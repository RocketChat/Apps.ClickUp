import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';
export async function getWorkspacesModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext, data?: any }): Promise<IUIKitModalViewParam> {

    const viewId = ModalsEnum.GET_WORKSPACES;
    const block = modify.getCreator().getBlockBuilder();
    data.data.teams.forEach(async (workspace) => {
                block.addSectionBlock({
                    text: block.newPlainTextObject(`${workspace.name}`),
                });
                block.addActionsBlock({
                    blockId: MiscEnum.TASK_ACTIONS_BLOCK,
                    elements: [
                        block.newButtonElement({
                            actionId: MiscEnum.SAVE_WORKSPACE_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.SAVE_WORKSPACE_BUTTON),
                            value: `${workspace.id}`,
                            style: ButtonStyle.PRIMARY,

                        }),
                        block.newButtonElement({
                            actionId: MiscEnum.GET_SPACES_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.GET_SPACES_BUTTON),
                            value: `${workspace.id}`,
                        }),
                    ],
                });
            
        
    });
   


    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.GET_WORKSPACES_MODAL_NAME,
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
