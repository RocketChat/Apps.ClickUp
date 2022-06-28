import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { UIKitViewSubmitInteractionContext , UIKitInteractionContext} from '@rocket.chat/apps-engine/definition/uikit';
import { ModalsEnum } from '../enums/Modals';
import { sendMessage } from '../lib/message';
import { ClickUpApp } from '../../ClickUpApp';
import { postTask } from '../lib/postTask';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { getUIData } from '../lib/persistence';

export class ExecuteViewSubmitHandler {
	constructor(
		private readonly app: ClickUpApp,
		private readonly read: IRead,
		private readonly http: IHttp,
		private readonly modify: IModify,
		private readonly persistence: IPersistence
        
	) {}

	public async run(context: UIKitViewSubmitInteractionContext,read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext) {
		const { user, view } = context.getInteractionData();
		switch (view.id) {
            case ModalsEnum.CREATE_TASK:
                const uiData = await getUIData(read.getPersistenceReader(), user.id);
                if (user.id) {
                    const room = uiData.room;
                    const roomId  =  uiData.room?.id
                    if (roomId) {
                        const data = context.getInteractionData();                
                        try {
                            const taskresult = await postTask({context,data,room,read,persistence,modify,http});

                            return context.getInteractionResponder().successResponse();
                        } catch (error) {
                            return context.getInteractionResponder().viewErrorResponse({
                                viewId: data.view.id,
                                errors: error,
                            });
                        }
                    }
                }
                break;
			default:
                break;
		}
		return {
			success: true,
		};
	}
}