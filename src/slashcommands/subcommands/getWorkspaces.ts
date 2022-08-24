import { IModify, IPersistence, IRead , IHttp, HttpStatusCode} from '@rocket.chat/apps-engine/definition/accessors';
import { ClickUpApp } from '../../../ClickUpApp';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { getTasksModal } from "../../modals/getTasksModal";
import { persistUIData } from '../../lib/persistence';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../../enums/Misc';
import { getAccessTokenForUser } from '../../storage/users';

export async function getWorkspaces(app: ClickUpApp, read: IRead, modify: IModify, context: SlashCommandContext, persistence: IPersistence, http: IHttp): Promise<void> {
    const block = modify.getCreator().getBlockBuilder();
    const triggerId = context.getTriggerId();
    if(triggerId){
        const user = context.getSender();
        const room = context.getRoom();
        const token = await getAccessTokenForUser(read, user);
        const headers = {
            Authorization: `${token?.token}`,
        };    
        const response = await http.get(`https://api.clickup.com/api/v2/team`,{ headers });
    if(response.statusCode==HttpStatusCode.OK) {
        const builder = await modify.getCreator().startMessage().setRoom(room);
        const block = modify.getCreator().getBlockBuilder();
        response.data.teams.forEach(async (workspace) => {
                    block.addSectionBlock({
                        text: block.newPlainTextObject(`${workspace.name}`),
                    });
                    block.addActionsBlock({
                        blockId: MiscEnum.TASK_ACTIONS_BLOCK,
                        elements: [
                            block.newButtonElement({
                                actionId: MiscEnum.SAVE_WORKSPACE_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.SAVE_WORKSPACE_BUTTON),
                                value: `${workspace.id}`,
                                style: ButtonStyle.PRIMARY,

                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.GET_SPACES_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.GET_SPACES_BUTTON),
                                value: `${workspace.id}`,
                            }),
                        ],
                    });
                    builder.setBlocks(block);
                
            
        });
        await modify
                .getNotifier()
                .notifyUser(user, builder.getMessage());;
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to retrieve workspaces! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
    }else{
        this.app.getLogger().error("Invalid Trigger ID");
    }
    }
   

