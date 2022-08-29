import { IApiEndpointMetadata } from '@rocket.chat/apps-engine/definition/api';
import { ClickUpApp } from '../../ClickUpApp';

export async function getWebhookUrl(app: ClickUpApp): Promise<string> {
    const accessors = app.getAccessors();
    const webhookEndpoint = accessors.providedApiEndpoints.find((endpoint) => endpoint.path === 'clickupwebhook') as IApiEndpointMetadata;
    let siteUrl: string = await accessors.environmentReader.getServerSettings().getValueById('Site_Url') as string;
    if (siteUrl.charAt(siteUrl.length - 1) === '/') {
        siteUrl = siteUrl.substring(0, siteUrl.length - 1);
    }
    return siteUrl + webhookEndpoint.computedPath;
}