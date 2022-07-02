import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUIKitResponse, TextObjectType, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { ICreateTaskState } from "../facade/IClickUpService";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../storage/users";
import { ModalsEnum } from "../enums/Modals";

export async function getTasks({
    context,
    data,
    room,
    read,
    persistence,
    modify,
    http,
}: {
    context: UIKitViewSubmitInteractionContext,
    data: IUIKitViewSubmitIncomingInteraction,
    room: IRoom;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {
    const state = data.view.state;
    const user: IUser = context.getInteractionData().user;
    const token = await getAccessTokenForUser(read, user);
    const list_id = state?.[ModalsEnum.LIST_ID_BLOCK]?.[ModalsEnum.LIST_ID_INPUT];
    const archived = state?.[ModalsEnum.ARCHIVED_BLOCK]?.[ModalsEnum.ARCHIVED_ACTION_ID] == "Yes"?"true":"false";
    const subtasks = state?.[ModalsEnum.SUBTASKS_BLOCK]?.[ModalsEnum.SUBTASKS_ACTION_ID] == "Yes"?"true":"false";
    var taskLimit = state?.[ModalsEnum.TASK_LIMIT_BLOCK]?.[ModalsEnum.TASK_LIMIT_INPUT];
    taskLimit < 101 ? taskLimit: 100;

    const headers = {
        Authorization: `${token?.token}`,
    };

    const response = await http.get(`https://api.clickup.com/api/v2/list/${list_id}/task?archived=${archived}&subtasks=${subtasks}`,{ headers });
    if(response.statusCode==200) {
        response.data.tasks.forEach(async (task) => {
            if (taskLimit--) {
                const textSender = await modify
                    .getCreator()
                    .startMessage()
                    .setText(
                        `[${task.name}](${task.url})\n` + `${task.description}`.slice(0, 80) + '...'
                    );
                if (room) {
                    textSender.setRoom(room);
                }
                await modify.getCreator().finish(textSender);
            }
        });
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to retrieve tasks! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}