import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUIKitResponse, TextObjectType, UIKitViewSubmitInteractionContext , ButtonStyle, UIKitBlockInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUIKitBaseIncomingInteraction, IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { ICreateTaskState } from "../facade/IClickUpService";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../storage/users";
import { ModalsEnum } from "../enums/Modals";
import { MiscEnum } from "../enums/Misc";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';

export async function getFolders({
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
    const space_id = context.getInteractionData().value;
    const headers = {
        Authorization: `${token?.token}`,
    };

    const response = await http.get(`https://api.clickup.com/api/v2/space/${space_id}/folder?archived=false`,{ headers });
    
    if(response.statusCode==HttpStatusCode.OK) {
        let limit = response.data.folders.length;
        const builder = await modify.getCreator().startMessage().setRoom(room);
        const block = modify.getCreator().getBlockBuilder();
        response.data.folders.forEach(async (folder) => {
            if (limit == 0) return;
            if (limit--) {
                    block.addSectionBlock({
                        text: block.newPlainTextObject(`${folder.name}`),
                    });
                    block.addContextBlock({ elements: [ block.newPlainTextObject(`ID: `+`${folder.id}`)]});
                    block.addActionsBlock({
                        blockId: MiscEnum.FOLDER_ACTIONS_BLOCK,
                        elements: [
                            block.newButtonElement({
                                actionId: MiscEnum.GET_LISTS_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.GET_LISTS_BUTTON),
                                value: `${folder.id}`,
                                style: ButtonStyle.PRIMARY,
                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.DELETE_FOLDER_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.DELETE_FOLDER_BUTTON),
                                value: `${folder.id}`,
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
        .setText(`❗️ Unable to retrieve folders! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}