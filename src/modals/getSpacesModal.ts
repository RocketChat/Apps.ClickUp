import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';

export async function getSpacesModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data , wid}: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext, data?: any , wid?:string}): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.GET_SPACES;
    const block = modify.getCreator().getBlockBuilder();
    const workspace_id = wid;
    let limit = data.data.spaces.length;
    data.data.spaces.forEach(async (space) => {
        if (limit == 0) return;
        if (limit--) {
            const privacy = space.private==true?"Private":"Public";
                block.addSectionBlock({
                    text: block.newPlainTextObject(`${space.name}`),
                });
                block.addContextBlock({ elements: [ block.newPlainTextObject(`ID: `+`${space.id}` +` | Privacy: `+`${privacy}`)]});
                block.addActionsBlock({
                    blockId: MiscEnum.SPACE_ACTIONS_BLOCK,
                    elements: [
                        block.newButtonElement({
                            actionId: MiscEnum.GET_FOLDERS_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.GET_FOLDERS_BUTTON),
                            value: `${workspace_id},${space.id}`,
                            style: ButtonStyle.PRIMARY,
                        }),
                        block.newButtonElement({
                            actionId: MiscEnum.DELETE_SPACE_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.DELETE_SPACE_BUTTON),
                            value: `${space.id}`,
                            style: ButtonStyle.DANGER,
                        }),
                    ],
                });
            
        }
    });
   


    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.GET_SPACES_MODAL_NAME,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Close',
            },
        }),
        blocks: block.getBlocks(),
    };
}
