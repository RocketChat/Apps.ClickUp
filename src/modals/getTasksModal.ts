import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { Block } from '@rocket.chat/ui-kit';
import { getActionsBlock, getButton, getInputBox, getOptions, getSectionBlock, getStaticSelectElement } from '../helpers/blockBuilder';

export async function getTasksModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: string }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.GET_TASKS;
  const block: Block[] = [];
  let title;
  data ? (title = `from Workspace #${data?.split(',')[0]}`) : (title = '');

  let listIdInputBox = await getInputBox(ModalsEnum.LIST_ID_INPUT_LABEL, ModalsEnum.LIST_ID_INPUT_LABEL_DEFAULT, ModalsEnum.LIST_ID_BLOCK, ModalsEnum.LIST_ID_INPUT, data?.split(',')[3] || '');

  let tasklimitInputBox = await getInputBox(ModalsEnum.TASK_LIMIT_INPUT_LABEL, ModalsEnum.TASK_LIMIT_INPUT_LABEL_DEFAULT, ModalsEnum.TASK_LIMIT_BLOCK, ModalsEnum.TASK_LIMIT_INPUT, `1`);

  let optionalParametersSectionBlock = await getSectionBlock(ModalsEnum.OPTIONAL_PARAMETERS_LABEL);

  let archivedOption1 = await getOptions('Yes', 'Yes');
  let archivedOption2 = await getOptions('No', 'No');
  let archivedSelectElement = await getStaticSelectElement(ModalsEnum.ARCHIVED_PLACEHOLDER, [archivedOption1, archivedOption2], ModalsEnum.ARCHIVED_BLOCK, ModalsEnum.ARCHIVED_ACTION_ID, 'No');
  let archivedActionBlock = await getActionsBlock(ModalsEnum.ARCHIVED_BLOCK, [archivedSelectElement]);

  let subtaskOption1 = await getOptions('Yes', 'Yes');
  let subtaskOption2 = await getOptions('No', 'No');
  let subtaskSelectElement = await getStaticSelectElement(ModalsEnum.SUBTASKS_PLACEHOLDER, [subtaskOption1, subtaskOption2], ModalsEnum.SUBTASKS_BLOCK, ModalsEnum.SUBTASKS_ACTION_ID, 'No');
  let subtaskActionsBlock = await getActionsBlock(ModalsEnum.SUBTASKS_BLOCK, [subtaskSelectElement]);

  block.push(listIdInputBox,tasklimitInputBox,optionalParametersSectionBlock,archivedActionBlock,subtaskActionsBlock);

  let closeButton = await getButton('Close', '', '');
  let submitButton = await getButton(ModalsEnum.GET_TASKS_SUBMIT_BUTTON_LABEL, '', '');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.GET_TASKS_MODAL_NAME + title,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
