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
import { getInteractionRoomData } from "../../storage/roomInteraction";

export async function getSpaces({
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
    const interactionroomid = (await getInteractionRoomData(read.getPersistenceReader(), user.id))?.roomId;
    const interactionroom :IRoom = (await read.getRoomReader().getById(interactionroomid)) as IRoom;
    const token = await getAccessTokenForUser(read, user);
    const workspace_id = context.getInteractionData().value;
    const headers = {
        Authorization: `${token?.token}`,
    };
     const response = await http.get(`https://api.clickup.com/api/v2/team/${workspace_id}/space?archived=false`,{ headers });   
    if(response.statusCode==HttpStatusCode.OK) {
        let limit = response.data.spaces.length;
        const builder = await modify.getCreator().startMessage().setRoom(interactionroom);
        const block = modify.getCreator().getBlockBuilder();
        response.data.spaces.forEach(async (space) => {
            console.log(`${workspace_id},${space.id}`);
            if (limit == 0) return;
            if (limit--) {
                const privacy = space.private==true?"Private":"Public";
                    block.addSectionBlock({
                        text: block.newPlainTextObject(`${space.name}`),
                    });
                    block.addContextBlock({ elements: [ block.newPlainTextObject(`ID: `+`${space.id}` +` | Privacy: `+`${privacy}`)]});
                    block.addActionsBlock({
                        blockId: MiscEnum.SPACE_ACTIONS_BLOCK,
                        elements: [
                            block.newButtonElement({
                                actionId: MiscEnum.GET_FOLDERS_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.GET_FOLDERS_BUTTON),
                                value: `${workspace_id},${space.id}`,
                                style: ButtonStyle.PRIMARY,
                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.DELETE_SPACE_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.DELETE_SPACE_BUTTON),
                                value: `${space.id}`,
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
        .setText(`❗️ Unable to retrieve spaces! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}