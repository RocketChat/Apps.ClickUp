import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { getInteractionRoomData, storeInteractionRoomData } from '../storage/roomInteraction';
import { Subscription } from '../storage/subscription';
import { ISubscription } from '../definitions/subscription';
import { ITaskSubscription } from '../definitions/taskSubscription';
import { MiscEnum } from '../enums/Misc';
import { Block } from '@rocket.chat/ui-kit';
import { getActionsBlock, getButton, getDividerBlock, getSectionBlock } from '../helpers/blockBuilder';
import { ButtonStyle, UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { viewTaskUrl } from '../lib/const';


export async function subscriptionsModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.SUBSCRIPTION_VIEW;

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

    let dividerblock = await getDividerBlock();
    block.push(dividerblock);


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

      let viewTaskButton = await getButton(MiscEnum.VIEW_TASK_BUTTON, '', MiscEnum.VIEW_TASK_ACTION_ID, `${taskId}`, ButtonStyle.PRIMARY, viewTaskUrl(taskId)`);
      let taskSectionBlock = await getSectionBlock(`${index}) ${taskName}`, viewTaskButton);
      block.push(taskSectionBlock);

      index++;
    }
  }

  let dividerblock = await getDividerBlock();

  let addSubscriptionButton = await getButton(ModalsEnum.OPEN_ADD_SUBSCRIPTIONS_LABEL, '', ModalsEnum.OPEN_ADD_SUBSCRIPTIONS_MODAL, room?.id);
  let deleteSubscriptionButton = await getButton(ModalsEnum.OPEN_DELETE_SUBSCRIPTIONS_LABEL, '', ModalsEnum.OPEN_DELETE_SUBSCRIPTIONS_MODAL, room?.id);
  let subscriptionRefreshButton = await getButton(ModalsEnum.SUBSCRIPTION_REFRESH_LABEL, '', ModalsEnum.SUBSCRIPTION_REFRESH_ACTION, room?.id);
  let subscriptionActionButton = await getActionsBlock('', [addSubscriptionButton, deleteSubscriptionButton, subscriptionRefreshButton]);

  block.push(dividerblock, subscriptionActionButton);

  let closeButton = await getButton('Close', '', '');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.SUBSCRIPTION_TITLE,
    },
    close: closeButton,
    blocks: block,
  };
}
