import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext, ButtonStyle } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { ModalsEnum } from "../../enums/Modals";
import { MiscEnum } from "../../enums/Misc";
import { HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";
import { Block } from "@rocket.chat/ui-kit";
import { getActionsBlock, getButton, getContextBlock, getSectionBlock } from "../../helpers/blockBuilder";
import { getTasksOfUrl } from "../const";

export async function getTasks({ context, data, room, read, persistence, modify, http }: { context: UIKitViewSubmitInteractionContext; data: IUIKitViewSubmitIncomingInteraction; room: IRoom; read: IRead; persistence: IPersistence; modify: IModify; http: IHttp }) {
  const state = data.view.state;
  const user: IUser = context.getInteractionData().user;
  const token = await getAccessTokenForUser(read, user);
  const list_id = state?.[ModalsEnum.LIST_ID_BLOCK]?.[ModalsEnum.LIST_ID_INPUT];
  const archived = state?.[ModalsEnum.ARCHIVED_BLOCK]?.[ModalsEnum.ARCHIVED_ACTION_ID] == "Yes" ? "true" : "false";
  const subtasks = state?.[ModalsEnum.SUBTASKS_BLOCK]?.[ModalsEnum.SUBTASKS_ACTION_ID] == "Yes" ? "true" : "false";
  const taskLimit = state?.[ModalsEnum.TASK_LIMIT_BLOCK]?.[ModalsEnum.TASK_LIMIT_INPUT];
  const incomingtitle = data.view.title.text;
  let workspace_id;
  incomingtitle.includes("#") ? (workspace_id = incomingtitle.split("#")[1]) : (workspace_id = "");
  let limit = taskLimit;
  limit > 101 ? 100 : (limit = taskLimit);

  const headers = {
    Authorization: `${token?.token}`,
  };

  const url = getTasksOfUrl(list_id!, archived!, subtasks!);
  const response = await http.get(url, { headers });
  if (response.statusCode == HttpStatusCode.OK) {
    const builder = await modify.getCreator().startMessage().setRoom(room);
    const block: Block[] = [];
    
    for (const task of response.data.tasks) {
      if (limit == 0) return;
      if (limit--) {
        let taskNameSectionBlock = await getSectionBlock(`${task.name}`);
        let taskDescriptionContextBlock = await getContextBlock(`Description: ` + `${task.description}`.slice(0, 80) + `...`);
        block.push(taskNameSectionBlock, taskDescriptionContextBlock);

        if (workspace_id != "") {
          let viewTaskButton = await getButton(MiscEnum.VIEW_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.VIEW_TASK_ACTION_ID, `${task.url}`, undefined, `${task.url}`);
          let shareTaskButton = await getButton(MiscEnum.SHARE_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.SHARE_TASK_ACTION_ID, `${task.id}`, ButtonStyle.PRIMARY);
          let editTaskButton = await getButton(MiscEnum.EDIT_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.EDIT_TASK_ACTION_ID, `${task.id}`);
          let deleteTaskButton = await getButton(MiscEnum.DELETE_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.DELETE_TASK_ACTION_ID, `${task.id}`, ButtonStyle.DANGER);
          let subscribetaskButton = await getButton(MiscEnum.SUBSCRIBE_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.SUBSCRIBE_TASK_ACTION_ID, `${workspace_id},${task.name},${task.id}`, ButtonStyle.PRIMARY);
          let taskActionBlock = await getActionsBlock(MiscEnum.TASK_ACTIONS_BLOCK, [viewTaskButton, shareTaskButton, editTaskButton, deleteTaskButton, subscribetaskButton]);
          block.push(taskActionBlock);
        } else {
          let viewTaskButton = await getButton(MiscEnum.VIEW_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.VIEW_TASK_ACTION_ID, `${task.url}`, undefined, `${task.url}`);
          let shareTaskButton = await getButton(MiscEnum.SHARE_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.SHARE_TASK_ACTION_ID, `${task.id}`, ButtonStyle.PRIMARY);
          let editTaskButton = await getButton(MiscEnum.EDIT_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.EDIT_TASK_ACTION_ID, `${task.id}`);
          let deleteTaskButton = await getButton(MiscEnum.DELETE_TASK_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.DELETE_TASK_ACTION_ID, `${task.id}`, ButtonStyle.DANGER);
          let taskActionBlock = await getActionsBlock(MiscEnum.TASK_ACTIONS_BLOCK, [viewTaskButton, shareTaskButton, editTaskButton, deleteTaskButton]);
          block.push(taskActionBlock);
        }
        builder.setBlocks(block);
      }
    }
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } else {
    const textSender = await modify.getCreator().startMessage().setText(`❗️ Unable to retrieve tasks! \n Error ${response.data.err}`);
    if (room) {
      textSender.setRoom(room);
    }
    await modify.getCreator().finish(textSender);
  }
}
