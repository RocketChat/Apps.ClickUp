import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../storage/users";
import { ModalsEnum } from "../enums/Modals";
import { getWebhookUrl } from '../helpers/getWebhookURL';
import { Subscription } from "../storage/subscription";
import { getInteractionRoomData } from "../storage/roomInteraction";
import { ClickUpApp } from "../../ClickUpApp";
import { postWebhookUrl } from "./const";

export async function persistSubscription({ app, context, data, room, read, persistence, modify, http }: { app: ClickUpApp; context: UIKitViewSubmitInteractionContext; data: IUIKitViewSubmitIncomingInteraction; room: IRoom; read: IRead; persistence: IPersistence; modify: IModify; http: IHttp }) {
  const state = data.view.state;
  const user: IUser = context.getInteractionData().user;
  const { roomId } = await getInteractionRoomData(read.getPersistenceReader(), user.id);
  const subscribedRoom: IRoom = (await read.getRoomReader().getById(roomId)) ?? room;
  const token = await getAccessTokenForUser(read, user);
  const workspace_id = state?.[ModalsEnum.WORKSPACE_ID_BLOCK]?.[ModalsEnum.WORKSPACE_ID_INPUT];
  const task_name = state?.[ModalsEnum.TASK_NAME_BLOCK]?.[ModalsEnum.TASK_NAME_INPUT];
  const task_id = state?.[ModalsEnum.TASK_ID_BLOCK]?.[ModalsEnum.TASK_ID_INPUT];
  const url = await getWebhookUrl(app);
  const headers = {
    Authorization: `${token?.token}`,
  };
  const body = {
    endpoint: `${url}`,
    task_id: `${task_id}`,
    events: `*`,
  };

  const api_response = await http.post(`https://api.clickup.com/api/v2/team/${workspace_id}/webhook`, { headers, data: body });

  let subscriptionStorage = new Subscription(persistence, read.getPersistenceReader());
  let hookId = "";
  let subscriptions = await subscriptionStorage.getSubscriptionsByTask(task_id, user.id);
  if (subscriptions && subscriptions.length) {
    for (let subscription of subscriptions) {
      if (hookId == "") {
        hookId = subscription.webhookId;
      }
    }
    const api_url = postWebhookUrl(workspace_id);
    const api_response = await http.post(api_url, { headers , data: body});
    let subscriptionStorage = new Subscription(persistence, read.getPersistenceReader());
    let hookId = "";
    let subscriptions = await subscriptionStorage.getSubscriptionsByTask(task_id, user.id);
    if (subscriptions && subscriptions.length) {
         for (let subscription of subscriptions) {
                 if (hookId == "") {
                       hookId = subscription.webhookId;
                      }
                   }
              }

  let response: any;
  if (hookId == "") {
    response = await subscriptionStorage.createSubscription(task_name, task_id, api_response.data.webhook.id, subscribedRoom, user);
  }
  if (response) {
    const textSender = await modify.getCreator().startMessage().setText(`✅️ Subscribed to notifications successfully!`);
    if (room) {
      textSender.setRoom(room);
    }
    await modify.getCreator().finish(textSender);
  } else {
    const textSender = await modify.getCreator().startMessage().setText(`❗️ Unable to subscribe! `);
    if (room) {
      textSender.setRoom(room);
    }
    await modify.getCreator().finish(textSender);
  }
}
