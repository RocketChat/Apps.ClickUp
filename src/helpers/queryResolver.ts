import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUIKitResponse, TextObjectType, UIKitBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { getTasks } from "../lib/getTasks";
import { postTask } from "../lib/postTask";

export async function queryResolver({
    query,
    context,
    data,
    room,
    read,
    persistence,
    modify,
    http,
}: {
    query: String,
    context: UIKitBlockInteractionContext,
    data: IUIKitViewSubmitIncomingInteraction,
    room: IRoom;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {

    switch (query) {
        case "getTasks": {
            // to be implemented this week.
            // await getTasks({context,room,read,persistence,modify,http});
            break;
        }
        case "postTask": {
            // await postTask({context,data,room,read,persistence,modify,http});
            break;
        }
        
        default: 
            // await helperMessage({room,read,persistence,modify,http});
    }
}