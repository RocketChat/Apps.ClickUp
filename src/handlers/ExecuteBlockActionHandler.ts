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
import { deleteTask } from "../lib/deleteTask";
import { editTask } from "../lib/editTask";
import { saveWorkspace } from "../lib/saveWorkspace";
import { getSpaces } from "../lib/getSpaces";
import { getFolders } from "../lib/getFolders";
import { getLists } from "../lib/getLists";
import { getTasksModal } from "../modals/getTasksModal";
import { deleteSpace } from "../lib/deleteSpace";
import { deleteFolder } from "../lib/deleteFolder";
import { deleteList } from "../lib/deleteList";

export class ExecuteBlockActionHandler {
    constructor(
        private readonly app: IApp,
        private readonly read: IRead,
        private readonly http: IHttp,
        private readonly modify: IModify,
        private readonly persistence: IPersistence
    ) {}

    public async run(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        slashcommandcontext?: SlashCommandContext, 
        uikitcontext?: UIKitInteractionContext
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
                    await editTask({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();  
                case MiscEnum.DELETE_TASK_ACTION_ID:
                    await deleteTask({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();   
                case MiscEnum.SAVE_WORKSPACE_ACTION_ID:
                    await saveWorkspace({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();    
                case MiscEnum.GET_SPACES_ACTION_ID:
                    await getSpaces({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse(); 
                case MiscEnum.DELETE_SPACE_ACTION_ID:
                        await deleteSpace({context,data,room,read,persistence,modify,http});
                        return context.getInteractionResponder().successResponse();  
                case MiscEnum.GET_FOLDERS_ACTION_ID:
                    await getFolders({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse();      
                case MiscEnum.DELETE_FOLDER_ACTION_ID:
                        await deleteFolder({context,data,room,read,persistence,modify,http});
                        return context.getInteractionResponder().successResponse();  
                case MiscEnum.GET_LISTS_ACTION_ID:
                    await getLists({context,data,room,read,persistence,modify,http});
                    return context.getInteractionResponder().successResponse(); 
                case MiscEnum.DELETE_LIST_ACTION_ID:
                        await deleteList({context,data,room,read,persistence,modify,http});
                        return context.getInteractionResponder().successResponse();   
                case MiscEnum.GET_TASKS_ACTION_ID:
                    const modal = await getTasksModal({modify,read,persistence,http,data:context.getInteractionData().value});
                    const triggerId= context.getInteractionData().triggerId;
                    await modify.getUiController().openModalView(modal,{triggerId},context.getInteractionData().user);
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