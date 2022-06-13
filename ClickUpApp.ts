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

export class ClickUpApp extends App {

    public botUsername: string;
    public botUser: IUser;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
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

        const quickReminder = 'Quick reminder: Let your workspaces users know about the ClickUp App,\
                            so everyone will be able to manage their tasks/workspaces as well.\n';

        const text =
            `Welcome to the ClickUp Rocket.Chat App!\n` +
            `To start managing your workspaces, tasks, etc. ` +
            `You first need to complete the app's setup and then authorize your ClickUp account.\n` +
            `To do so, type  \`/clickup-app auth\`\n` +
            `${isUserHighHierarchy(user) ? quickReminder : ''}`;

        await sendDirectMessage(read, modify, user, text, persistence);
    }

}
