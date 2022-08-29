import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ITextObject, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ModalsEnum } from '../enums/Modals';
import { AppEnum } from '../enums/App';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { getInteractionRoomData, storeInteractionRoomData } from '../storage/roomInteraction';
import { Subscription } from '../storage/subscription';
import { ISubscription } from '../definitions/subscription';
import { ITaskSubscription } from '../definitions/taskSubscription';
import { MiscEnum } from '../enums/Misc';

export async function subscriptionsModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.SUBSCRIPTION_VIEW;

    const block = modify.getCreator().getBlockBuilder();

    const room = slashcommandcontext?.getRoom() || uikitcontext?.getInteractionData().room;
    const user = slashcommandcontext?.getSender() || uikitcontext?.getInteractionData().user;
   
    if (user?.id) {
        let roomId;
        if (room?.id) {
            roomId = room.id;
            await storeInteractionRoomData(persistence, user.id, roomId);
        } else {
            roomId = (await getInteractionRoomData(read.getPersistenceReader(), user.id)).roomId;
        }
    
        let subscriptionStorage = new Subscription(persistence,read.getPersistenceReader());
        let roomSubscriptions: Array<ISubscription> = await subscriptionStorage.getSubscriptions(roomId);

        block.addDividerBlock();
        
    
        let vartaskData = new Map<string,ITaskSubscription>;
        for (let subscription of roomSubscriptions) {
            let taskName = subscription.taskName;
            let taskId = subscription.taskId;
            let userId = subscription.user;
            let user = await read.getUserReader().getById(userId);
            
            if(vartaskData.has(taskId)){
                let taskData = vartaskData.get(taskId) as ITaskSubscription;
                taskData.user=user;
                vartaskData.set(taskId,taskData);
            }else{
                let taskData:ITaskSubscription={
                    webhookId:subscription.webhookId,
                    user:user,
                    taskName:taskName,
                    taskId:taskId
                };
                vartaskData.set(taskId,taskData);
            }

        }
        let index=1;
        for (let task of vartaskData.values()) {
            let taskName = task.taskName;
            let taskId = task.taskId;
            let taskUser = task.user;
            block.addSectionBlock({
                text: { text: `${index}) ${taskName}`, type: TextObjectType.PLAINTEXT},
                accessory: block.newButtonElement({
                    actionId: MiscEnum.VIEW_TASK_ACTION_ID,
                    text: block.newPlainTextObject(MiscEnum.VIEW_TASK_BUTTON),
                    value: `${taskId}`,
                    url: `https://app.clickup.com/t/${taskId}`,
                })
            });
            index++;
        }
    }

    block.addDividerBlock();

    block.addActionsBlock({
        elements: [
            block.newButtonElement({
                actionId: ModalsEnum.OPEN_ADD_SUBSCRIPTIONS_MODAL,
                text: { text: ModalsEnum.OPEN_ADD_SUBSCRIPTIONS_LABEL, type: TextObjectType.PLAINTEXT },
                value: room?.id
            }),
            block.newButtonElement({
                actionId: ModalsEnum.OPEN_DELETE_SUBSCRIPTIONS_MODAL,
                text: { text: ModalsEnum.OPEN_DELETE_SUBSCRIPTIONS_LABEL, type: TextObjectType.PLAINTEXT },
                value: room?.id
            }),
            block.newButtonElement({
                actionId: ModalsEnum.SUBSCRIPTION_REFRESH_ACTION,
                text: { text: ModalsEnum.SUBSCRIPTION_REFRESH_LABEL, type: TextObjectType.PLAINTEXT },
                value: room?.id
            }),
        ]
    });

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.SUBSCRIPTION_TITLE,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Close',
            },
        }),
        blocks: block.getBlocks(),
    };
}