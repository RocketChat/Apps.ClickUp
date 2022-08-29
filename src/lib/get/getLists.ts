import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { ButtonStyle, UIKitBlockInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitBaseIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { MiscEnum } from "../../enums/Misc";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';

export async function getLists({
    context,
    data,
    room,
    read,
    persistence,
    modify,
    http,
}: {
    context: UIKitBlockInteractionContext,
    data: IUIKitBaseIncomingInteraction,
    room: IRoom;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {
    const user: IUser = context.getInteractionData().user;
    const token = await getAccessTokenForUser(read, user);
    const value = context.getInteractionData().value;
    const folder_id = value?.split(',')[2];
    const headers = {
        Authorization: `${token?.token}`,
    };

    const response = await http.get(`https://api.clickup.com/api/v2/folder/${folder_id}/list?archived=false`,{ headers });
    
    if(response.statusCode==HttpStatusCode.OK) {
        let limit = response.data.lists.length;
        
        const builder = await modify.getCreator().startMessage().setRoom(room);
        const block = modify.getCreator().getBlockBuilder();
        response.data.lists.forEach(async (list) => {
            if (limit == 0) return;
            if (limit--) {
                    block.addSectionBlock({
                        text: block.newPlainTextObject(`${list.name}`),
                    });
                    block.addContextBlock({ elements: [ block.newPlainTextObject(`ID: `+`${list.id}` +`${list.priority?` |Priority: `+list.priority.priority``:""}`)]});
                    block.addActionsBlock({
                        blockId: MiscEnum.LIST_ACTIONS_BLOCK,
                        elements: [
                            block.newButtonElement({
                                actionId: MiscEnum.GET_TASKS_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.GET_TASKS_BUTTON),
                                value: `${value},${list.id}`,
                                style: ButtonStyle.PRIMARY,
                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.DELETE_LIST_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.DELETE_LIST_BUTTON),
                                value: `${list.id}`,
                                style: ButtonStyle.DANGER,
                            }),
                        ],
                    });
                    builder.setBlocks(block);
                
            }
        });
        await modify
                .getNotifier()
                .notifyUser(user, builder.getMessage());;
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to retrieve lists! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}