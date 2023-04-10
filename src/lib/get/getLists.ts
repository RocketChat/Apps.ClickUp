import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitBlockInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitBaseIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";
import { getListsModal } from "../../modals/getListsModal";
import { getListsOfUrl } from "../const";

export async function getLists({ context, data, room, read, persistence, modify, http }: { context: UIKitBlockInteractionContext; data: IUIKitBaseIncomingInteraction; room: IRoom; read: IRead; persistence: IPersistence; modify: IModify; http: IHttp }) {
  const triggerId = context.getInteractionData().triggerId;
  if (triggerId) {
    const user: IUser = context.getInteractionData().user;
    const token = await getAccessTokenForUser(read, user);
    const value = context.getInteractionData().value;
    const folder_id = value?.split(",")[2];
    const headers = {
      Authorization: `${token?.token}`,
    };
    const url = getListsOfUrl(folder_id!);
    const response = await http.get(url, { headers });
    
    if(response.statusCode==HttpStatusCode.OK) {
        const modal = await getListsModal({modify,read,persistence,http,data:response,olddata:value});
        await modify.getUiController().openSurfaceView(modal,{triggerId},user);
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
  } else {
    this.app.getLogger().error("Invalid Trigger ID");
  }
}
