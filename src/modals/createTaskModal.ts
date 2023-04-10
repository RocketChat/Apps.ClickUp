import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { Block} from '@rocket.chat/ui-kit';
import { getActionsBlock, getButton, getInputBox, getInputBoxDate, getOptions, getStaticSelectElement } from '../helpers/blockBuilder';

export async function createTaskModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: string }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.CREATE_TASK;
  const block: Block[] = [];

  let listIdInputBox = await getInputBox(ModalsEnum.LIST_ID_INPUT_LABEL, ModalsEnum.LIST_ID_INPUT_LABEL_DEFAULT, ModalsEnum.LIST_ID_BLOCK, ModalsEnum.LIST_ID_INPUT, data || '');
  
  let taskNameInputbox = await getInputBox(ModalsEnum.TASK_NAME_INPUT_LABEL, ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT, ModalsEnum.TASK_NAME_BLOCK, ModalsEnum.TASK_NAME_INPUT);
  
  let option1 = await getOptions('Urgent', '1');
  let option2 = await getOptions('High', '2');
  let option3 = await getOptions('Normal', '3');
  let option4 = await getOptions('Low', '4');
  let taskPrioritySelectElement = await getStaticSelectElement(ModalsEnum.TASK_PRIORITY_PLACEHOLDER, [option1, option2, option3, option4], ModalsEnum.TASK_PRIORITY_BLOCK, ModalsEnum.TASK_PRIORITY_ACTION_ID, 'Normal');
  let taskPriorityActionBlock = await getActionsBlock(ModalsEnum.TASK_PRIORITY_BLOCK, [taskPrioritySelectElement]);

  let taskDescriptionInputBox = await getInputBox(ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL, ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL_DEFAULT, ModalsEnum.TASK_DESCRIPTION_BLOCK, ModalsEnum.TASK_DESCRIPTION_INPUT);

  let taskStartDateInputBox = await getInputBoxDate(ModalsEnum.TASK_START_DATE_INPUT_LABEL, '', ModalsEnum.TASK_START_DATE_BLOCK, ModalsEnum.TASK_START_DATE_INPUT);

  let taskDueDateInputBox = await getInputBoxDate(ModalsEnum.TASK_DUE_DATE_INPUT_LABEL, '', ModalsEnum.TASK_DUE_DATE_BLOCK, ModalsEnum.TASK_DUE_DATE_INPUT);

  let taskAssigneeInputBlock = await getInputBox(ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL, ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL_DEFAULT, ModalsEnum.TASK_ASSIGNEES_BLOCK, ModalsEnum.TASK_ASSIGNEES_INPUT);
  
  let op1 = await getOptions('Yes', 'Yes');
  let op2 = await getOptions('No', 'No');
  let assigneeRoomSelectElement = await getStaticSelectElement(ModalsEnum.ASSIGNEE_ROOM_PLACEHOLDER, [op1, op2], ModalsEnum.ASSIGNEE_ROOM_BLOCK, ModalsEnum.ASSIGNEE_ROOM_ACTION_ID, 'No');
  let assigneeRoomActionBlock = await getActionsBlock(ModalsEnum.ASSIGNEE_ROOM_BLOCK, [assigneeRoomSelectElement]);
  
  block.push(listIdInputBox,taskNameInputbox,taskPriorityActionBlock,taskDescriptionInputBox,taskStartDateInputBox,taskDueDateInputBox,taskAssigneeInputBlock,assigneeRoomActionBlock);

  let closeButton = await getButton('Close', '', '');

  let submitButton = await getButton(ModalsEnum.CREATE_TASK_SUBMIT_BUTTON_LABEL, '', ModalsEnum.CREATE_TASK);

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.CREATE_TASK_MODAL_NAME,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
