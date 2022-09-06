import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';

export async function getFoldersModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data , olddata}: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext, data?: any , olddata?:string}): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.GET_FOLDERS;
    const block = modify.getCreator().getBlockBuilder();
    const value = olddata;
    let limit = data.data.folders.length;
    data.data.folders.forEach(async (folder) => {
        if (limit == 0) return;
        if (limit--) {
                block.addSectionBlock({
                    text: block.newPlainTextObject(`${folder.name}`),
                });
                block.addContextBlock({ elements: [ block.newPlainTextObject(`ID: `+`${folder.id}`)]});
                block.addActionsBlock({
                    blockId: MiscEnum.FOLDER_ACTIONS_BLOCK,
                    elements: [
                        block.newButtonElement({
                            actionId: MiscEnum.GET_LISTS_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.GET_LISTS_BUTTON),
                            value: `${value},${folder.id}`,
                            style: ButtonStyle.PRIMARY,
                        }),
                        block.newButtonElement({
                            actionId: MiscEnum.DELETE_FOLDER_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.DELETE_FOLDER_BUTTON),
                            value: `${folder.id}`,
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
            text: ModalsEnum.GET_FOLDERS_MODAL_NAME,
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
