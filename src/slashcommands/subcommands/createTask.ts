import { IModify, IPersistence, IRead , IHttp} from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ClickUpApp } from '../../../ClickUpApp';
import { createSectionBlock, IButton } from '../../lib/blocks';
import { sendDirectMessage } from '../../lib/message';
import { TextObjectType } from "@rocket.chat/apps-engine/definition/uikit/blocks/Objects";
import { BlockElementType } from "@rocket.chat/apps-engine/definition/uikit";
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { createTaskModal } from "../../modals/createTaskModal";


export async function createTask(app: ClickUpApp, read: IRead, modify: IModify, context: SlashCommandContext, persistence: IPersistence, http: IHttp): Promise<void> {
    const block = modify.getCreator().getBlockBuilder();
    const triggerId = context.getTriggerId();

    // console.log(triggerId);
    // const ctmodal = await createTaskModal({modify,read,persistence,http,slashcommandcontext:context});
    // await modify.getUiController().openModalView(
    //         ctmodal,
    //         {triggerId},
    //         context.getSender(),
            
    //     );

    if(triggerId){
        console.log(triggerId);
        const modal = await createTaskModal({modify,read,persistence,http,slashcommandcontext:context});
        await modify.getUiController().openModalView(modal,{triggerId},context.getSender());
    }else{
        console.log("Inavlid Trigger ID !");
    }
    }
   

