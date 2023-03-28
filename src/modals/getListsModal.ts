import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';
import { getActionsBlock, getButton, getContextBlock, getSectionBlock } from '../helpers/blockBuilder';
import { Block } from '@rocket.chat/ui-kit';

export async function getListsModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data, olddata }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: any; olddata?: string }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.GET_LISTS;
  const block: Block[] = [];
  const value = olddata;
  let limit = data.data.lists.length;
  for (const list of data.data.lists) {
    if (limit == 0) break;
    if (limit--) {
      let listNameSectionBlock = await getSectionBlock(`${list.name}`);

      let listContextBlock = await getContextBlock(`ID: ` + `${list.id}` + `${list.priority ? ` |Priority: ` + list.priority.priority`` : ''}`);

      let createTaskButton = await getButton(MiscEnum.CREATE_TASK_BUTTON, MiscEnum.LIST_ACTIONS_BLOCK, MiscEnum.CREATE_TASK_BUTTON_ACTION_ID, `${list.id}`, ButtonStyle.PRIMARY);
      let getTaskButton = await getButton(MiscEnum.GET_TASKS_BUTTON, MiscEnum.LIST_ACTIONS_BLOCK, MiscEnum.GET_TASKS_ACTION_ID, `${value},${list.id}`, ButtonStyle.PRIMARY);
      let deleteListButton = await getButton(MiscEnum.DELETE_LIST_BUTTON, MiscEnum.LIST_ACTIONS_BLOCK, MiscEnum.DELETE_LIST_ACTION_ID, `${list.id}`, ButtonStyle.DANGER);
      let listActionBlock = await getActionsBlock(MiscEnum.LIST_ACTIONS_BLOCK, [createTaskButton, getTaskButton, deleteListButton]);

      block.push(listNameSectionBlock, listContextBlock, listActionBlock);
    }
  }

  let closeButton = await getButton('Close', '', '');
  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.GET_LISTS_MODAL_NAME,
    },
    close: closeButton,
    blocks: block,
  };
}
