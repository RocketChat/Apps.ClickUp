import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext, UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { getButton, getInputBox, getSectionBlock } from '../helpers/blockBuilder';
import { Block } from '@rocket.chat/ui-kit';

export async function saveWorkspaceModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data: any }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.SAVE_WORKSPACE;
  const block: Block[] = [];
  const membercount = data.members.length;

  let textSectionBlock = await getSectionBlock(`Do not change the input boxes, just enter username after colon.`);
  block.push(textSectionBlock);

  for (const [index, member] of data.members) {
    let userInputBox = await getInputBox(`Enter Rocket.Chat username of ClickUp user: \n` + `${member.user.username} (${member.user.email})`, '', ModalsEnum.MEMBER_USERNAME_BLOCK + `#${index}`, ModalsEnum.MEMBER_USERNAME_INPUT + `#${index}`, `${member.user.id}:`);
    block.push(userInputBox);
  }

  let closeButton = await getButton('Close', '', '');
  let submitButton = await getButton(ModalsEnum.SAVE_WORKSPACE_SUBMIT_BUTTON_LABEL, '', '');
  
  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.SAVE_WORKSPACE_MODAL_NAME + data.name + '#' + data.id + '#' + membercount,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
