import express, { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { validateJsonWebhook } from './util/validateGithubWebhook.js'
import { $ } from 'execa'
import generateString from './util/generateString.js'
import * as rl from 'node:readline'
import * as fs from 'node:fs'
import { SPCDatabaseObject } from './types.js'
import dayjs from 'dayjs'
import * as colorette from 'colorette'
import { cwd } from 'node:process';
if (!process.env.TOKEN) {
    console.log('please set TOKEN environment variable!')
    process.exit(1)
}

const superCoolDatabase = [] as SPCDatabaseObject[]

const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});
readline.prompt()

const app = express()

async function checkAuth(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization !== process.env.TOKEN) return res.send({ successful: false, message: 'Token is incorrect!' })
    next()
}

const hookLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
})

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient()

app.post('/hooks/:webhook', hookLimiter, async (req, res) => {
    const webhookRequested = req.params.webhook
    if (await prisma.webhook.count({ where: { webhookName: webhookRequested } }) === 0)
        return res.status(400).send({ successful: false, message: 'There\'s not a webhook with that route name!' })

    const fetchDB = (await prisma.webhook.findFirst({
        where: {
            webhookName: webhookRequested
        }
    }))!
    switch (fetchDB.authType) {
        case 'github':
            const validate = validateJsonWebhook(req, fetchDB.pass)
            if (!validate)
                return res.status(403).send({ successful: false, message: 'The github authentication token is not correct!' })
        case 'auth-token':
            if (req.headers.authorization !== fetchDB.pass)
                return res.status(403).send({ successful: false, message: 'The authorization header token is not correct!' })
    }
    const randomTextFileName = generateString(5)
    res.send({ successful: true, message: `Command executing now. Log id: ${randomTextFileName}` })
    const date = dayjs().toDate()
    superCoolDatabase.push({ webhookName: fetchDB.webhookName, exit: 'running', ranAt: date, processID: randomTextFileName })
    const cmd = $({ shell: '/bin/bash' })`${fetchDB.command}`
    const filePath = `${cwd()}/logs/${randomTextFileName}.txt`
    fs.closeSync(fs.openSync(filePath, 'w'))
    cmd.pipeStdout!(filePath)
    cmd.on('exit', (code) => {
        const filteredDB = superCoolDatabase.filter((db) => db.ranAt === date)[0]
        if (code !== 0) {
            filteredDB.exit = 'errored'
            fs.appendFileSync(filePath, '\nProcess errored!')
        } else {
            filteredDB.exit = 'successful'
            fs.appendFileSync(filePath, '\nProcess was successful!') 
        }
    })
})

app.post('/api/createWebhook', checkAuth, async (req, res) => {
    const { webhookName, authType, pass, command } = req.body
    if (await prisma.webhook.count({ where: { webhookName: webhookName } }) >= 1)
        return res.status(400).send({ successful: false, message: 'There\'s already a webhook with that route name!' })
    
    await prisma.webhook.create({
        data: {
            command: command,
            authType: authType,
            pass: pass,
            webhookName: webhookName
        }
    })
    res.send({ successful: true })
})

app.get('/api/listWebhooks', checkAuth, async (req, res) => {
    const webhooks = await prisma.webhook.findMany()
    res.send(webhooks)
})

app.get('/api/editWebhooksList', checkAuth, async (req, res) => {
    const webhooks = await prisma.webhook.findMany()
    const newWebhooksArray = [] as string[]
    webhooks.forEach((webhook) => {
        return newWebhooksArray.push(webhook.webhookName)
    })
    res.send(newWebhooksArray)
})

app.get('/api/getWebhookInfo/:webhook', checkAuth, async (req, res) => {
    const webhook = req.params.webhook
    if (await prisma.webhook.count({ where: { webhookName: webhook } }) === 0)
        return res.status(400).send({ successful: false, message: 'There\'s not a webhook with that route name!' })
    
    const dbFetch = await prisma.webhook.findFirst({ where: { webhookName: webhook } })
    res.send(dbFetch)
})

app.post('/api/editWebhook', checkAuth, async (req, res) => {
    const { unchangedWebhookName, webhookName, authType, pass, command } = req.body
    if (await prisma.webhook.count({ where: { webhookName: unchangedWebhookName } }) === 0)
        return res.status(400).send({ successful: false, message: 'There\'s not a webhook with that route name!' })

    await prisma.webhook.updateMany({
        where: {
            webhookName: unchangedWebhookName,
        },
        data: {
            command: command,
            authType: authType,
            pass: pass,
            webhookName: webhookName
        }
    })
    res.send({ successful: true })
})

app.listen(process.env.WH_SERVER_PORT || 3006, () => console.log('Listening'))

readline.on('line', (l) => {
    const usercmd = l.split(' ')
    switch (usercmd[0]) {
        case 'hooks': {
            switch (usercmd[1]) {
                case 'successful':
                    const successfulFilteredDB = superCoolDatabase.filter(db => db.exit === 'successful').map(db => {
                        return `${colorette.bgGreen('SUCCESSFUL')} Process ID ${db.processID} on webhook ${db.webhookName}`
                    }).join('\n')
                    return console.log(`These are the successful commands ran since the server went up:\n${successfulFilteredDB}`)
                case 'errored':
                    const erroredFilteredDB = superCoolDatabase.filter(db => db.exit === 'errored').map(db => {
                        return `${colorette.bgRed('ERRORED')} Process ID ${db.processID} on webhook ${db.webhookName}`
                    }).join('\n')
                    return console.log(`These are all errored commands that ran since the server went up:\n${erroredFilteredDB}`)
                case 'running':
                    const runningFilteredDB = superCoolDatabase.filter(db => db.exit === 'running').map(db => {
                        return `${colorette.bgCyan('RUNNING')} Process ID ${db.processID} on webhook ${db.webhookName}`
                    }).join('\n')
                    return console.log(`These are all errored commands that ran since the server went up:\n${runningFilteredDB}`)
                case 'all':
                    const allFilteredDB = superCoolDatabase.map(db => {
                        switch (db.exit) {
                            case 'successful':
                                var color = colorette.bgGreen('SUCCESSFUL')
                                break
                            case 'errored':
                                var color = colorette.bgRed('ERRORED')
                                break
                            case 'running':
                                var color = colorette.bgCyan('RUNNING')
                                break
                        }
                        return `${color} Process ID ${db.processID} on webhook ${db.webhookName}`
                    }).join('\n')
                    return console.log(`These are all webhooks that ran since the server went up:\n${allFilteredDB}`)
                default:
                    return console.log(`Argument ${usercmd[1]} not found`)
            }
        }
        default:
            if (!usercmd[0]) break;
            console.log(`Argument ${usercmd[0]} not found`)
            break;
    }
    readline.prompt()
})