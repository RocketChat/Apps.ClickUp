import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { ModalsEnum } from "../../enums/Modals";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';
import { getTaskUrl } from "../const";

export async function updateTask({
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
    const task_id = data.view.title.text.split("#")[1];
    const taskName = state?.[ModalsEnum.TASK_NAME_BLOCK]?.[ModalsEnum.TASK_NAME_INPUT];
    const taskDescription = state?.[ModalsEnum.TASK_DESCRIPTION_BLOCK]?.[ModalsEnum.TASK_DESCRIPTION_INPUT];
    const taskstartDate = Math.floor(new Date(state?.[ModalsEnum.TASK_START_DATE_BLOCK]?.[ModalsEnum.TASK_START_DATE_INPUT]).getTime()*1);
    const taskdueDate = Math.floor(new Date(state?.[ModalsEnum.TASK_DUE_DATE_BLOCK]?.[ModalsEnum.TASK_DUE_DATE_INPUT]).getTime()*1);
    const headers = {
        Authorization: `${token?.token}`,
    };
    const body = {
        'name': `${taskName}`,
        'description': `${taskDescription}`,
        'due_date':`${taskdueDate}`,
        'start_date': `${taskstartDate}`,
    }
    const url = getTaskUrl(task_id!);
    const response = await http.put(url, { headers , data: body});
    
    if(response.statusCode==HttpStatusCode.OK) {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`✅️ Task updated successfully! \n You may access it at [${taskName}](${response.data.url})`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to update task! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}