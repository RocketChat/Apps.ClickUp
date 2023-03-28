import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';
import { getActionsBlock, getButton, getSectionBlock } from '../helpers/blockBuilder';
import { Block } from '@rocket.chat/ui-kit';

export async function getWorkspacesModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: any }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.GET_WORKSPACES;
  const block: Block[] = [];

  for (const workspace of data.data.teams) {
    let workspaceNameSectionBlock = await getSectionBlock(`${workspace.name}`);

    let saveWorkspaceButton = await getButton(MiscEnum.SAVE_WORKSPACE_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.SAVE_WORKSPACE_ACTION_ID, `${workspace.id}`, ButtonStyle.PRIMARY);
    let getSpacesButton = await getButton(MiscEnum.GET_SPACES_BUTTON, MiscEnum.TASK_ACTIONS_BLOCK, MiscEnum.GET_SPACES_ACTION_ID, `${workspace.id}`);
    let taskActionBlock = await getActionsBlock(MiscEnum.TASK_ACTIONS_BLOCK, [saveWorkspaceButton, getSpacesButton]);
    
    block.push(workspaceNameSectionBlock, taskActionBlock);
  }

  let closeButton = await getButton('Close', '', '');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.GET_WORKSPACES_MODAL_NAME,
    },
    close: closeButton,
    blocks: block,
  };
}
