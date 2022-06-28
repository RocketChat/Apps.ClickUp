import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUIKitResponse, TextObjectType, UIKitBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";

export async function getTasks({
    context,
    room,
    read,
    persistence,
    modify,
    http,
}: {
    context: UIKitBlockInteractionContext,
    room: IRoom;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {
    
    const api_response = await http.post(
        `https://api.clickup.com/api/v2/list/tasks`
    );
    if(api_response.statusCode == 200){
        const textSender = modify
        .getCreator()
        .startMessage()
        .setText(`*TASK CREATED SUCCESSFULLY!*`);
        if (room) {
            textSender.setRoom(room);
        }
        await modify.getCreator().finish(textSender);
    }
    else {
        const textSender = modify
        .getCreator()
        .startMessage()
        .setText(`*UNABLE TO CREATE TASK!*`);
        if (room) {
            textSender.setRoom(room);
        }
        await modify.getCreator().finish(textSender);
    }

    
}