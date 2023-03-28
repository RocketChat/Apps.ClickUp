import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { getInteractionRoomData, storeInteractionRoomData } from '../storage/roomInteraction';
import { Subscription } from '../storage/subscription';
import { ISubscription } from '../definitions/subscription';
import { ITaskSubscription } from '../definitions/taskSubscription';
import { Block } from '@rocket.chat/ui-kit';
import { getButton, getDividerBlock, getSectionBlock } from '../helpers/blockBuilder';

export async function DeleteSubscriptionModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.DELETE_SUBSCRIPTION_VIEW;

  const block: Block[] = [];

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

    let subscriptionStorage = new Subscription(persistence, read.getPersistenceReader());
    let roomSubscriptions: Array<ISubscription> = await subscriptionStorage.getSubscriptions(roomId);

    let dividerBlock = await getDividerBlock();
    block.push(dividerBlock);

    let vartaskData = new Map<string, ITaskSubscription>();
    for (let subscription of roomSubscriptions) {
      let taskName = subscription.taskName;
      let taskId = subscription.taskId;
      let userId = subscription.user;
      let user = await read.getUserReader().getById(userId);

      if (vartaskData.has(taskId)) {
        let taskData = vartaskData.get(taskId) as ITaskSubscription;
        taskData.user = user;
        vartaskData.set(taskId, taskData);
      } else {
        let taskData: ITaskSubscription = {
          webhookId: subscription.webhookId,
          user: user,
          taskName: taskName,
          taskId: taskId,
        };
        vartaskData.set(taskId, taskData);
      }
    }
    let index = 1;
    for (let task of vartaskData.values()) {
      let taskName = task.taskName;
      let taskId = task.taskId;
      let taskUser = task.user;
      if (taskUser.id == user.id) {
        let accessoryButton = await getButton(ModalsEnum.DELETE_SUBSCRIPTION_LABEL, '', ModalsEnum.DELETE_SUBSCRIPTION_ACTION, taskId + ',' + task.webhookId);
        let taskNameSectionBlock = await getSectionBlock(`${index}) ${taskName}`, accessoryButton);
        block.push(taskNameSectionBlock);
      } else {
        let taskNameSectionBlock = await getSectionBlock(`${index}) ${taskName}`);
        block.push(taskNameSectionBlock);
      }
      index++;
    }
  }

  let dividerBlock = await getDividerBlock();
  block.push(dividerBlock);

  let closeButton = await getButton('Close', '','');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.DELETE_SUBSCIPTIONS_TITLE,
    },
    close: closeButton,
    blocks: block,
  };
}
