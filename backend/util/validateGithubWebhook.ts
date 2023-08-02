import type { Request } from 'express'
import * as crypto from 'node:crypto'

export function validateJsonWebhook(request: Request, token: string) {

    // calculate the signature
    const expectedSignature = "sha256=" +
        crypto.createHmac("sha256", token)
            .update(JSON.stringify(request.body))
            .digest("hex");

    // compare the signature against the one in the request
    const signature = request.headers["x-hub-signature-256"];
    if (signature !== expectedSignature) {
        return false;
    } else {
        return true;
    }
}