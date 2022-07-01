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

export async function postTask({
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
    const taskName = state?.[ModalsEnum.TASK_NAME_BLOCK]?.[ModalsEnum.TASK_NAME_INPUT];
    const taskDescription = state?.[ModalsEnum.TASK_DESCRIPTION_BLOCK]?.[ModalsEnum.TASK_DESCRIPTION_INPUT];
    const headers = {
        Authorization: `${token?.token}`,
    };
    const body = {
        'name': `${taskName}`,
        'description': `${taskDescription}`,
    }

    const response = await http.post(`https://api.clickup.com/api/v2/list/${list_id}/task`,{ headers , data: body});

    if(response.statusCode==200) {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`✅️ Task created successfully! \n You may access it at [${taskName}](${response.data.url})`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to create task! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}