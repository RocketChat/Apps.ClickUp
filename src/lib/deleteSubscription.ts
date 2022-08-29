import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {  UIKitBlockInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitBaseIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../storage/users";

import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';
import { storeInteractionRoomData, getInteractionRoomData } from "../storage/roomInteraction";
import { Subscription } from "../storage/subscription";
import { sendNotification } from "./message";

export async function deleteSubscription({
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
    let splitted = value!.split(',');
    let taskId = splitted[0];
    let webhook_id = splitted[1];
    let roomId: string;
    if (room?.id) {
        roomId = room.id;
        await storeInteractionRoomData(persistence, user.id, roomId);
    } else {
        roomId = (await getInteractionRoomData(read.getPersistenceReader(), user.id)).roomId;
    }
    let subscriptionStorage = new Subscription(persistence, read.getPersistenceReader());
    await subscriptionStorage.deleteSubscriptions(taskId, roomId);    
    const headers = {
        Authorization: `${token?.token}`,
    };
    const response = await http.del(`https://api.clickup.com/api/v2/webhook/${webhook_id}`,{ headers});

    if(response.statusCode==HttpStatusCode.OK) {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`✅️ Unsubscribed successfully!`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to unsubscribe! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}