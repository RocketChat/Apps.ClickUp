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
import { persistUserAsync } from "../storage/users";
import { ModalsEnum } from "../enums/Modals";
import { persist_workspace } from "./persistence";

export async function persistWorkspace({
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
    const workspace_id = data.view.title.text.split("#")[2];
    const workspaceName = data.view.title.text.split("#")[1];
    const membercount = data.view.title.text.split("#")[3]; 
    const teammemberlist = [] as string[];
    for(let index=0;index<+membercount;index++){
        const inputbox =  state?.[ModalsEnum.MEMBER_USERNAME_BLOCK+`#${index}`]?.[ModalsEnum.MEMBER_USERNAME_INPUT+`#${index}`];
        const rcusername = inputbox.split(":")[1];
        const clickup_uid = inputbox.split(":")[0];
        teammemberlist.push(`${rcusername}:${clickup_uid}`)
        const rcuser = await read.getUserReader().getByUsername(rcusername)
        await persistUserAsync(persistence, rcuser.id, clickup_uid);
    }
    try {
        await persist_workspace(read,persistence,user.id,`${workspace_id}:${workspaceName}`,teammemberlist)
    
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`✅️ Workspace and members data saved successfully!`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    } catch (error) {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to save! \n Error ${error}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
   
    
}