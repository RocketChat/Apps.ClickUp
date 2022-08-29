import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ClickUpApp } from '../../ClickUpApp';
import { Subcommands } from '../enums/Subcommands';
import { sendNotification } from '../lib/message';
import { authorize } from './subcommands/authorize';
import {createTask} from './subcommands/createTask';
import {getTasks} from './subcommands/getTasks';
import { getWorkspaces } from './subcommands/getWorkspaces';

export class ClickUp implements ISlashCommand {
    public command = 'clickup-app';
    public i18nParamsExample = 'slashcommand_params';
    public i18nDescription = 'slashcommand_description';
    public providesPreview = false;

    // imported to access the public method from the main class
    constructor(private readonly app: ClickUpApp) {}

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const command = this.getCommandFromContextArguments(context);
        if (!command) {
            return await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
        }

        switch (command) {
            case Subcommands.Help:
                await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
                break;
            case Subcommands.Auth:
                await authorize(this.app, read, modify, context.getSender(), persistence);
                break;
            case Subcommands.CreateTask:
                await createTask(this.app, read, modify, context, persistence, http);
                break;
            case Subcommands.GetTasks:
                await getTasks(this.app, read, modify, context, persistence, http);
                break;
            case Subcommands.GetWorkspaces:
                await getWorkspaces(this.app, read, modify, context, persistence, http);
                break;
            default:
                await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
                break;
        }
    }

    private getCommandFromContextArguments(context: SlashCommandContext): string {
        const [command] = context.getArguments();
        return command;
    }

    private async displayAppHelpMessage(read: IRead, modify: IModify, user: IUser, room: IRoom): Promise<void> {
        const text = `ClickUp App provides you the following slash commands, /clickup-app:

    1) *help:* shows this list;
    2) *auth:* starts the process to authorize your ClickUp Account;
    3) *get-workspaces* lets you retreive your workspaces from ClickUp.
    4) *create-task* lets you create a new task.
    4) *get-tasks* lets you retreive your tasks.    `;

        return sendNotification(read, modify, user, room, text);
    }
}
