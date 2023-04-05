import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitBlockInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitBaseIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';
import { getTaskUrl } from "../const";

export async function shareTask({
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
    const task_id = context.getInteractionData().value;
    const headers = {
        Authorization: `${token?.token}`,
    };
    const url = getTaskUrl(task_id!);
    const response = await http.get(url, { headers });
    
    if(response.statusCode==HttpStatusCode.OK) {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`[${response.data.name}](${response.data.url})`+` | ${response.data.description}`.slice(0, 80) + `...`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
    await modify.getCreator().finish(textSender);
  } else {
    const textSender = await modify.getCreator().startMessage().setText(`❗️ Unable to share task! \n Error ${response.data.err}`);
    if (room) {
      textSender.setRoom(room);
    }
    await modify.getCreator().finish(textSender);
  }
}
