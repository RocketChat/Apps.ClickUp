import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ButtonStyle, TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { MiscEnum } from '../enums/Misc';

export async function getListsModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data , olddata}: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext, data?: any , olddata?:string}): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.GET_LISTS;
    const block = modify.getCreator().getBlockBuilder();
    const value = olddata;
    let limit = data.data.lists.length;
    data.data.lists.forEach(async (list) => {
        if (limit == 0) return;
        if (limit--) {
                block.addSectionBlock({
                    text: block.newPlainTextObject(`${list.name}`),
                });
                block.addContextBlock({ elements: [ block.newPlainTextObject(`ID: `+`${list.id}` +`${list.priority?` |Priority: `+list.priority.priority``:""}`)]});
                block.addActionsBlock({
                    blockId: MiscEnum.LIST_ACTIONS_BLOCK,
                    elements: [
                        block.newButtonElement({
                            actionId: MiscEnum.CREATE_TASK_BUTTON_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.CREATE_TASK_BUTTON),
                            value: `${list.id}`,
                            style: ButtonStyle.PRIMARY,
                        }),
                        block.newButtonElement({
                            actionId: MiscEnum.GET_TASKS_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.GET_TASKS_BUTTON),
                            value: `${value},${list.id}`,
                            style: ButtonStyle.PRIMARY,
                        }),
                        block.newButtonElement({
                            actionId: MiscEnum.DELETE_LIST_ACTION_ID,
                            text: block.newPlainTextObject(MiscEnum.DELETE_LIST_BUTTON),
                            value: `${list.id}`,
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
            text: ModalsEnum.GET_LISTS_MODAL_NAME,
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
