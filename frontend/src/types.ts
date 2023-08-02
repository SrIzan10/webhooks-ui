export interface CreateWebhookPostData {
    id?: string
    webhookName: string;
    authType: string;
    pass: string;
    command: string;
}