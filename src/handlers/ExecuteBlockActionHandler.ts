import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IApp } from "@rocket.chat/apps-engine/definition/IApp";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import {  UIKitInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from "../enums/Misc";
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { getUIData } from '../lib/persistence';
import { shareTask } from "../lib/get/shareTask";
import { deleteTask } from "../lib/delete/deleteTask";
import { editTask } from "../lib/get/editTask";
import { saveWorkspace } from "../lib/get/saveWorkspace";
import { getSpaces } from "../lib/get/getSpaces";
import { getFolders } from "../lib/get/getFolders";
import { getLists } from "../lib/get/getLists";
import { getTasksModal } from "../modals/getTasksModal";
import { deleteSpace } from "../lib/delete/deleteSpace";
import { deleteFolder } from "../lib/delete/deleteFolder";
import { deleteList } from "../lib/delete/deleteList";
import { ModalsEnum } from "../enums/Modals";
import { AddSubscriptionModal } from "../modals/addSubscriptionModal";
import { DeleteSubscriptionModal } from "../modals/deleteSubscriptionModal";
import { deleteSubscription } from "../lib/deleteSubscription";
import { subscriptionsModal } from '../modals/subscriptionsModal';
import { createTaskModal } from "../modals/createTaskModal";

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
        const triggerId= context.getInteractionData().triggerId;
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
                case MiscEnum.SUBSCRIBE_TASK_ACTION_ID:
                    const Subscriptionmodal = await AddSubscriptionModal({modify,read,persistence,http,uikitcontext:context,data:context.getInteractionData().value})
                    return context.getInteractionResponder().openModalViewResponse(Subscriptionmodal);
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
                case MiscEnum.CREATE_TASK_BUTTON_ACTION_ID:
                    const createTaskmodal = await createTaskModal({modify,read,persistence,http,data:context.getInteractionData().value});
                    await modify.getUiController().openSurfaceView(createTaskmodal,{triggerId},context.getInteractionData().user);
                    return context.getInteractionResponder().successResponse();        
                case MiscEnum.GET_TASKS_ACTION_ID:
                    const getTasksmodal = await getTasksModal({modify,read,persistence,http,data:context.getInteractionData().value});
                    await modify.getUiController().openSurfaceView(getTasksmodal,{triggerId},context.getInteractionData().user);
                    return context.getInteractionResponder().successResponse();  
                case ModalsEnum.OPEN_ADD_SUBSCRIPTIONS_MODAL: 
                    const addSubscriptionmodal = await AddSubscriptionModal({modify,read,persistence,http,uikitcontext:context})
                    return context.getInteractionResponder().openModalViewResponse(addSubscriptionmodal);
                case ModalsEnum.OPEN_DELETE_SUBSCRIPTIONS_MODAL: 
                    const deleteSubscriptionmodal = await DeleteSubscriptionModal({modify,read,persistence,http,uikitcontext:context})
                    return context.getInteractionResponder().openModalViewResponse(deleteSubscriptionmodal);
                case ModalsEnum.DELETE_SUBSCRIPTION_ACTION :
                    await deleteSubscription({context,data,room,read,persistence,modify,http});
                    break;
                case ModalsEnum.SUBSCRIPTION_REFRESH_ACTION:
                    const subscriptionsmodal = await subscriptionsModal({ modify, read, persistence, http, uikitcontext: context });
                    await modify.getUiController().updateSurfaceView(subscriptionsmodal, { triggerId: context.getInteractionData().triggerId }, context.getInteractionData().user);
                    break;
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