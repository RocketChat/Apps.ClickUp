import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IApp } from "@rocket.chat/apps-engine/definition/IApp";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { ModalsEnum } from "../enums/Modals";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import {  UIKitInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from "../enums/Misc";
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { getUIData } from '../lib/persistence';
import { shareTask } from "../lib/shareTask";
import {deleteTask} from "../lib/deleteTask";

export class ExecuteBlockActionHandler {
    constructor(
        private readonly app: IApp,
        private readonly read: IRead,
        private readonly http: IHttp,
        private readonly modify: IModify,
        private readonly persistence: IPersistence
    ) {}

    public async run(
        context: UIKitBlockInteractionContext,read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext
    ): Promise<IUIKitResponse> {
        const data = context.getInteractionData();
        const { actionId, user } = data;
        const uiData = await getUIData(read.getPersistenceReader(), user.id);
        const room = uiData.room;
        const roomId  =  uiData.room?.id;
    

        try {
            
            switch (actionId) {
                case MiscEnum.SHARE_TASK_ACTION_ID:
                    await shareTask({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();                        
                case MiscEnum.EDIT_TASK_ACTION_ID:
                    // await getTasks({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();  
                case MiscEnum.DELETE_TASK_ACTION_ID:
                    await deleteTask({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();    
                default:
                    break;
            }
        } catch (error) {
            return context.getInteractionResponder().viewErrorResponse({
                viewId: actionId,
                errors: error,
            });
        }

        return context.getInteractionResponder().successResponse();
    }

}