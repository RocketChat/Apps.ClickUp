import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';
import { Block } from '@rocket.chat/ui-kit';
import { getActionsBlock, getButton, getContextBlock, getSectionBlock } from '../helpers/blockBuilder';

export async function getSpacesModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data, wid }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: any; wid?: string }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.GET_SPACES;
  const block: Block[] = [];
  const workspace_id = wid;
  let limit = data.data.spaces.length;
  for (const space of data.data.spaces) {
    if (limit == 0) break;
    if (limit--) {
      const privacy = space.private == true ? 'Private' : 'Public';

      let spaceNameSectionBox = await getSectionBlock(`${space.name}`);

      let spaceDetailsContextBox = await getContextBlock(`ID: ` + `${space.id}` + ` | Privacy: ` + `${privacy}`);

      let getFoldersButton = await getButton(MiscEnum.GET_FOLDERS_BUTTON, MiscEnum.SPACE_ACTIONS_BLOCK, MiscEnum.GET_FOLDERS_ACTION_ID, `${workspace_id},${space.id}`, ButtonStyle.PRIMARY);
      let deleteSpaceButton = await getButton(MiscEnum.DELETE_SPACE_BUTTON, MiscEnum.SPACE_ACTIONS_BLOCK, MiscEnum.DELETE_SPACE_ACTION_ID, `${space.id}`, ButtonStyle.DANGER);
      let spaceActionBlock = await getActionsBlock(MiscEnum.SPACE_ACTIONS_BLOCK, [getFoldersButton, deleteSpaceButton]);

      block.push(spaceNameSectionBox, spaceDetailsContextBox, spaceActionBlock);
    }
  }

  let closeButton = await getButton('Close', '', '');

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.GET_SPACES_MODAL_NAME,
    },
    close: closeButton,
    blocks: block,
  };
}
