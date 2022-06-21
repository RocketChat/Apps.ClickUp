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
import { createTaskModal } from "../modals/createTaskModal";

export class ClickUp implements ISlashCommand {
    public command = 'clickup-app';
    public i18nParamsExample = 'slashcommand_params';
    public i18nDescription = 'slashcommand_description';
    public providesPreview = false;

    // imported to access the public method from the main class
    constructor(private readonly app: ClickUpApp) {}

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const command = this.getCommandFromContextArguments(context);
        const triggerId = context.getTriggerId();
        console.log(triggerId);
        if (!command) {
            return await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
        }

        switch (command) {
            case Subcommands.Auth:
                await authorize(this.app, read, modify, context.getSender(), persistence);
                break;
            case Subcommands.CreateTask:
                await createTask(this.app, read, modify, context, persistence, http);
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
*help:* shows this list;
*auth:* starts the process to authorize ClickUp Account;
        `;

        return sendNotification(read, modify, user, room, text);
    }
}
