import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle} from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';
import { Block} from '@rocket.chat/ui-kit';
import { getActionsBlock, getButton, getContextBlock, getSectionBlock } from '../helpers/blockBuilder';

export async function getFoldersModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data, olddata }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: any; olddata?: string }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.GET_FOLDERS;
  const block: Block[] = [];
  const value = olddata;
  let limit = data.data.folders.length;
  for (const folder of data.data.folders) {
    if (limit == 0) break;
    if (limit--) {
      let folderNameSectionBox = await getSectionBlock(`${folder.name}`);

      let folderIdContextBlock = await getContextBlock(`ID: ` + `${folder.id}`);

      let getListButton = await getButton(MiscEnum.GET_LISTS_BUTTON, MiscEnum.FOLDER_ACTIONS_BLOCK, MiscEnum.GET_LISTS_ACTION_ID, `${value},${folder.id}`, ButtonStyle.PRIMARY);
      let deleteFolderButton = await getButton(MiscEnum.DELETE_FOLDER_BUTTON, MiscEnum.FOLDER_ACTIONS_BLOCK, MiscEnum.DELETE_FOLDER_ACTION_ID, `${folder.id}`, ButtonStyle.DANGER);
      let folderActionBlock = await getActionsBlock(MiscEnum.FOLDER_ACTIONS_BLOCK, [getListButton, deleteFolderButton]);

      block.push(folderNameSectionBox, folderIdContextBlock, folderActionBlock);
    }
  }

  let closeButton = await getButton('Close', '', '');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.GET_FOLDERS_MODAL_NAME,
    },
    close: closeButton,
    blocks: block,
  };
}
