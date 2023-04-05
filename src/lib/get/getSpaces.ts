import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitBlockInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitBaseIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";
import { getSpacesModal } from "../../modals/getSpacesModal";
import { getSpacesOfUrl } from "../const";

export async function getSpaces({ context, data, room, read, persistence, modify, http }: { context: UIKitBlockInteractionContext; data: IUIKitBaseIncomingInteraction; room: IRoom; read: IRead; persistence: IPersistence; modify: IModify; http: IHttp }) {
  const triggerId = context.getInteractionData().triggerId;
  if (triggerId) {
    const user: IUser = context.getInteractionData().user;
    const token = await getAccessTokenForUser(read, user);
    const workspace_id = context.getInteractionData().value;
    const headers = {
      Authorization: `${token?.token}`,
    };
    const url = getSpacesOfUrl(workspace_id!);
     const response = await http.get(url, { headers });   
    if(response.statusCode==HttpStatusCode.OK) {
        const modal = await getSpacesModal({modify,read,persistence,http,data:response,wid:workspace_id});
        await modify.getUiController().openModalView(modal,{triggerId},user);
    }
  } else {
    this.app.getLogger().error("Invalid Trigger ID");
  }
}