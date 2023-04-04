import {
    IAppAccessors,
    IAppInstallationContext,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { isUserHighHierarchy, sendDirectMessage } from './src/lib/message';
import { IAuthData, IOAuth2Client, IOAuth2ClientOptions } from '@rocket.chat/apps-engine/definition/oauth2/IOAuth2';
import { createOAuth2Client } from '@rocket.chat/apps-engine/definition/oauth2/OAuth2';
import { persistUserAsync } from './src/storage/users';
import { createSectionBlock } from './src/lib/blocks';
import { ClickUp as ClickUpCommand } from './src/slashcommands/clickUp';
import { IUIKitResponse, UIKitBlockInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ExecuteBlockActionHandler } from './src/handlers/ExecuteBlockActionHandler';
import { ExecuteViewSubmitHandler } from './src/handlers/ExecuteViewSubmitHandler';
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { clickupWebhooks} from './src/endpoints/incoming'
import { getProfileUrl } from './src/lib/const';

export class ClickUpApp extends App {

    public botUsername: string;
    public botUser: IUser;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    private oauth2ClientInstance: IOAuth2Client;
    private oauth2Config: IOAuth2ClientOptions = {
        alias: 'clickup-app',
       accessTokenUri: 'https://api.clickup.com/api/v2/oauth/token',
       authUri: 'https://app.clickup.com/api',
       refreshTokenUri: 'https://api.clickup.com/api/v2/oauth/token',
       revokeTokenUri: 'https://api.clickup.com/api/v2/oauth/token',
           authorizationCallback: this.autorizationCallback.bind(this),
       };
    
       private async autorizationCallback(
        token: IAuthData,
        user: IUser,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence,
    ) {
          
        if (token) {
            const headers = {
                Authorization: `${token?.token}`,
            };
            const url = getProfileUrl();
            const userData = await http.get(url, { headers });
            if(userData.statusCode==HttpStatusCode.OK) {
                await persistUserAsync(persistence, user.id, userData.data.user.id);
            }
            
        }  
          
        const text =
        `The authentication process has succeeded! :tada:\n` +
        `If you are a workspace admin, retrieve it using ` +
        `\`/clickup-app get-workspaces\` slash command and ` +
        `save it for managing its members and tasks.\n` +
        `If you are just a member of a workspace, you will be notified` +
        `once your admin assigns you a task.`;


        const blocks = await createSectionBlock(modify, text);

        await sendDirectMessage(read, modify, user, text, persistence, blocks);
    }

    public async onEnable(): Promise<boolean> {
        this.botUsername = 'clickup-app.bot';
        this.botUser = (await this.getAccessors()
            .reader.getUserReader()
            .getByUsername(this.botUsername)) as IUser;
        return true;
    }

    public async onInstall(
        context: IAppInstallationContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        const user = context.user;

        const quickReminder = 'Quick reminder: Let your workspace users know about the ClickUp App,\
                            so everyone will be able to manage their tasks/workspaces as well.\n';

        const text =
            `Welcome to the ClickUp Rocket.Chat App!\n` +
            `To start managing your workspaces, tasks, etc. ` +
            `You first need to complete the app's setup and then authorize your ClickUp account.\n` +
            `To do so, type  \`/clickup-app auth\`\n` +
            `${isUserHighHierarchy(user) ? quickReminder : ''}`;

        await sendDirectMessage(read, modify, user, text, persistence);
    }
    public getOauth2ClientInstance(): IOAuth2Client {
        if (!this.oauth2ClientInstance) {
            this.oauth2ClientInstance = createOAuth2Client(this, this.oauth2Config);
        }
        return this.oauth2ClientInstance;
    }

    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteBlockActionHandler(this, read, http, modify, persistence);
        return await handler.run(context, read, http, persistence, modify);
    }

    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        const handler = new ExecuteViewSubmitHandler(this, read, http, modify, persistence);
        return await handler.run(this, context, read, http, persistence, modify);
	}

    protected async extendConfiguration(
        configuration: IConfigurationExtend,
    ): Promise<void> {
        const user = (await this.getAccessors()
            .reader.getUserReader()
            .getAppUser()) as IUser;

        await Promise.all([
            this.getOauth2ClientInstance().setup(configuration),
            configuration.slashCommands.provideSlashCommand(new ClickUpCommand(this)),
        ]);
        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new clickupWebhooks(this)]
        });
    }

}
