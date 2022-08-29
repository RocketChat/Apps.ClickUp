import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ITextObject, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { getInteractionRoomData, storeInteractionRoomData } from '../storage/roomInteraction';
import { Subscription } from '../storage/subscription';
import { ISubscription } from '../definitions/subscription';
import { ITaskSubscription } from '../definitions/taskSubscription';

export async function DeleteSubscriptionModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.DELETE_SUBSCRIPTION_VIEW;

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
            if(taskUser.id == user.id){
                block.addSectionBlock({
                    text: { text: `${index}) ${taskName}`, type: TextObjectType.PLAINTEXT},
                    accessory: block.newButtonElement({
                        actionId: ModalsEnum.DELETE_SUBSCRIPTION_ACTION,
                        text: {
                            text: ModalsEnum.DELETE_SUBSCRIPTION_LABEL,
                            type: TextObjectType.PLAINTEXT
                        },
                        value: taskId + "," + task.webhookId,
                    })
                });

            }else{
                block.addSectionBlock({
                    text: { text: `${index}) ${taskName}`, type: TextObjectType.PLAINTEXT},
                });

            }
            index++;
        }
    }

    block.addDividerBlock();

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.DELETE_SUBSCIPTIONS_TITLE,
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