import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { Block } from '@rocket.chat/ui-kit';
import { getButton, getInputBox, getInputBoxDate } from '../helpers/blockBuilder';

export async function editTaskModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data: any }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.EDIT_TASK;
  const block: Block[] = [];
  let assignees = data.assignees.map((assignee) => assignee['username']);
  let dueDate = new Date(data.due_date * 1);
  let dueDatevalue = dueDate.toISOString().split('T')[0];
  let startDate = new Date(data.start_date * 1);
  let startDatevalue = startDate.toISOString().split('T')[0];

  let taskNameInputBox = await getInputBox(ModalsEnum.TASK_NAME_INPUT_LABEL, '', ModalsEnum.TASK_NAME_BLOCK, ModalsEnum.TASK_NAME_INPUT, (data.name as string) || ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT);
  let taskDescriptionInputBox = await getInputBox(ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL, '', ModalsEnum.TASK_DESCRIPTION_BLOCK, ModalsEnum.TASK_DESCRIPTION_INPUT, (data.description as string) || ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL_DEFAULT, true);
  let taskStartDateInputBox = await getInputBoxDate(ModalsEnum.TASK_START_DATE_INPUT_LABEL, '', ModalsEnum.TASK_START_DATE_BLOCK, ModalsEnum.TASK_START_DATE_INPUT, startDatevalue);
  let taskDueDateInputBox = await getInputBoxDate(ModalsEnum.TASK_DUE_DATE_INPUT_LABEL, '', ModalsEnum.TASK_DUE_DATE_BLOCK, ModalsEnum.TASK_DUE_DATE_INPUT, dueDatevalue);
  let taskAssigneesInputBox = await getInputBox(ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL, '', ModalsEnum.TASK_ASSIGNEES_BLOCK, ModalsEnum.TASK_ASSIGNEES_INPUT, (assignees.toString() as string) || ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL_DEFAULT);
  
  block.push(taskNameInputBox, taskDescriptionInputBox, taskStartDateInputBox, taskDueDateInputBox, taskAssigneesInputBox);

  let closeButton = await getButton('Close', '', '');
  let submitButton = await getButton(ModalsEnum.EDIT_TASK_SUBMIT_BUTTON_LABEL, '', '');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.EDIT_TASK_MODAL_NAME + data.id,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
