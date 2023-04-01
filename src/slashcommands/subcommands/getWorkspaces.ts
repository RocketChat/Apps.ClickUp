import { IModify, IPersistence, IRead , IHttp, HttpStatusCode} from '@rocket.chat/apps-engine/definition/accessors';
import { ClickUpApp } from '../../../ClickUpApp';
import {
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { getAccessTokenForUser } from '../../storage/users';
import { storeInteractionRoomData } from '../../storage/roomInteraction';
import { getWorkspacesModal } from '../../modals/getWorkspacesModal';
import { persistUIData } from '../../lib/persistence';
import { getWorkspacesUrl } from '../../lib/const';

export async function getWorkspaces(app: ClickUpApp, read: IRead, modify: IModify, context: SlashCommandContext, persistence: IPersistence, http: IHttp): Promise<void> {
    const triggerId = context.getTriggerId();
    if(triggerId){
        const user = context.getSender();
        const room = context.getRoom();
        await storeInteractionRoomData(persistence, user.id, room.id);
        const token = await getAccessTokenForUser(read, user);
        const headers = {
            Authorization: `${token?.token}`,
        };
        const url = getWorkspacesUrl();
        const response = await http.get(url, { headers });
    if(response.statusCode==HttpStatusCode.OK) {
        await persistUIData(persistence, user.id, context);
        const modal = await getWorkspacesModal({modify,read,persistence,http,slashcommandcontext:context,data:response});
        await modify.getUiController().openModalView(modal,{triggerId},user);
    }
    }else{
        this.app.getLogger().error("Invalid Trigger ID");
    }
    }
   

