import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom, RoomType } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser, get_clickup_uid } from "../../storage/users";
import { ModalsEnum } from "../../enums/Modals";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';
import { sendDirectMessage } from "../message";

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
    const taskPriority = state?.[ModalsEnum.TASK_PRIORITY_BLOCK]?.[ModalsEnum.TASK_PRIORITY_ACTION_ID];
    const taskDescription = state?.[ModalsEnum.TASK_DESCRIPTION_BLOCK]?.[ModalsEnum.TASK_DESCRIPTION_INPUT];
    const taskstartDate = Math.floor(new Date(state?.[ModalsEnum.TASK_START_DATE_BLOCK]?.[ModalsEnum.TASK_START_DATE_INPUT]).getTime()*1);
    const taskdueDate = Math.floor(new Date(state?.[ModalsEnum.TASK_DUE_DATE_BLOCK]?.[ModalsEnum.TASK_DUE_DATE_INPUT]).getTime()*1);
    const roomneeded = state?.[ModalsEnum.ASSIGNEE_ROOM_BLOCK]?.[ModalsEnum.ASSIGNEE_ROOM_ACTION_ID] == "Yes"?"true":"false";
    const rcassignees = state?.[ModalsEnum.TASK_ASSIGNEES_BLOCK]?.[ModalsEnum.TASK_ASSIGNEES_INPUT];
    const cuassignees = [] as string[];
    const authorized = [] as string[];
    const unauthorized = [] as string[];
 
    if(rcassignees!==undefined) {
    const rcassigneeslist = `${rcassignees}`.split(",");
    for (let rcassignee of rcassigneeslist) {
        let cuassignee = await get_clickup_uid(read, rcassignee);
        if(cuassignee!==undefined) {
            cuassignees.push(cuassignee);
            authorized.push(rcassignee);}
        else {
            unauthorized.push(rcassignee);
        }
        }
    }
        const headers = {
        Authorization: `${token?.token}`,
    };
    const body = {
        'name': `${taskName}`,
        'description': `${taskDescription}`,
        'due_date':`${taskdueDate}`,
        'start_date': `${taskstartDate}`,
        'assignees' : cuassignees,
        'priority': `${taskPriority}`,
    }
 
    const response = await http.post(`https://api.clickup.com/api/v2/list/${list_id}/task`,{ headers , data: body});

    if(response.statusCode==HttpStatusCode.OK) {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`✅️ Task created successfully! \n You may access it at [${taskName}](${response.data.url})`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    if(rcassignees!==undefined) {
        const rcassigneeslist = `${rcassignees}`.split(",");
    for (let pendingassignee of unauthorized) {
    const text =
            `Hello, ${pendingassignee}!\n` +
            `You have been added as an assignee to the task: [${taskName}](${response.data.url}) by ${user.username}\n` +
            `It seems you've not yet authorized your ClickUp account on Rocket.Chat.\n` +
            `To do so, type  \`/clickup-app auth\`\n`
            const rcuser = await read.getUserReader().getByUsername(pendingassignee)
            await sendDirectMessage(read, modify, rcuser, text, persistence);
    }
    
    for (let addedassignee of authorized) {
        const text =
                `Hello, ${addedassignee}!\n` +
                `You have been added as an assignee to the task: [${taskName}](${response.data.url}) by ${user.username}`
                const rcuser = await read.getUserReader().getByUsername(addedassignee)
                await sendDirectMessage(read, modify, rcuser, text, persistence);
        }
    
    if(roomneeded==="true"){     
            const roombuilder = modify.getCreator().startRoom().setCreator(user).setType(RoomType.PRIVATE_GROUP).setDisplayName(`Task- ${taskName}`).setSlugifiedName(`${taskName}`.replace(/[^a-zA-Z0-9 ]/g, '').replace(' ', '_'));
            roombuilder.setMembersToBeAddedByUsernames(rcassigneeslist);
            await modify.getCreator().finish(roombuilder);
        }
    }
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