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
import { getAccessTokenForUser } from "../../storage/users";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';
import { getSpacesModal } from "../../modals/getSpacesModal";

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
    const triggerId = context.getInteractionData().triggerId;
    if(triggerId){
    const user: IUser = context.getInteractionData().user;
    const token = await getAccessTokenForUser(read, user);
    const workspace_id = context.getInteractionData().value;
    const headers = {
        Authorization: `${token?.token}`,
    };
     const response = await http.get(`https://api.clickup.com/api/v2/team/${workspace_id}/space?archived=false`,{ headers });   
    if(response.statusCode==HttpStatusCode.OK) {
        const modal = await getSpacesModal({modify,read,persistence,http,data:response,wid:workspace_id});
        await modify.getUiController().openContextualBarView(modal,{triggerId},user);
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
                }else{
    this.app.getLogger().error("Invalid Trigger ID");
                    }
}