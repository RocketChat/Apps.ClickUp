import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitViewSubmitInteractionContext , UIKitInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { ModalsEnum } from '../enums/Modals';
import { ClickUpApp } from '../../ClickUpApp';
import { postTask } from '../lib/post/postTask';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { getUIData } from '../lib/persistence';
import { getTasks } from '../lib/get/getTasks';
import { updateTask } from '../lib/put/updateTask';
import { persistWorkspace } from '../lib/persistWorkspace';
import { persistSubscription } from '../lib/persistSubscription';

export class ExecuteViewSubmitHandler {
	constructor(
		private readonly app: ClickUpApp,
		private readonly read: IRead,
		private readonly http: IHttp,
		private readonly modify: IModify,
		private readonly persistence: IPersistence,
        
	) {}

	public async run(
        app:ClickUpApp,
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
        slashcommandcontext?: SlashCommandContext, 
        uikitcontext?: UIKitInteractionContext) {
		const { user, view } = context.getInteractionData();
        const uiData = await getUIData(read.getPersistenceReader(), user.id);
        const room = uiData.room;
        const roomId  =  uiData.room?.id
        const data = context.getInteractionData();    
        try {
            
		switch (view.id) {
            case ModalsEnum.CREATE_TASK:
                await postTask({context,data,room,read,persistence,modify,http});
                return context.getInteractionResponder().successResponse();                        
            case ModalsEnum.GET_TASKS:
                await getTasks({context,data,room,read,persistence,modify,http});
                return context.getInteractionResponder().successResponse();    
            case ModalsEnum.EDIT_TASK:
                await updateTask({context,data,room,read,persistence,modify,http});
                return context.getInteractionResponder().successResponse(); 
            case ModalsEnum.SAVE_WORKSPACE:
                await persistWorkspace({context,data,room,read,persistence,modify,http});
                return context.getInteractionResponder().successResponse(); 
            case ModalsEnum.ADD_SUBSCRIPTION:
                await persistSubscription({app,context,data,room,read,persistence,modify,http});
                return context.getInteractionResponder().successResponse(); 
			default:
                break;
		}
    } catch (error) {
        return context.getInteractionResponder().viewErrorResponse({
            viewId: data.view.id,
            errors: error,
        });
    }
		return {
			success: true,
		};
	}
}