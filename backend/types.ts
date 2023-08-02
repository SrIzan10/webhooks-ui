export interface CreateWebhookPostData {
    id?: string;
    webhookName: string;
    authType: string;
    pass: string;
    command: string;
}

export interface SPCDatabaseObject {
    webhookName: string;
    exit: 'successful' | 'errored' | 'running';
    ranAt: Date;
    processID: string;
}