import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { AppEnum } from '../enums/App';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext, BlockElementType } from '@rocket.chat/apps-engine/definition/uikit';

export async function createTaskModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.CREATE_TASK;

    const block = modify.getCreator().getBlockBuilder();

    block.addInputBlock({
        blockId: ModalsEnum.LIST_ID_BLOCK,
        label: { text: ModalsEnum.LIST_ID_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.LIST_ID_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: ModalsEnum.LIST_ID_INPUT_LABEL_DEFAULT,
        })
    });
    block.addInputBlock({
        blockId: ModalsEnum.TASK_NAME_BLOCK,
        label: { text: ModalsEnum.TASK_NAME_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_NAME_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT,
        })
    });
    block.addInputBlock({
        blockId: ModalsEnum.TASK_DESCRIPTION_BLOCK,
        label: { text: ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_DESCRIPTION_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL_DEFAULT,
            multiline : true,
        })
    });

    block.addInputBlock({
        blockId: ModalsEnum.TASK_START_DATE_BLOCK,
        label: { text: ModalsEnum.TASK_START_DATE_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: {
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            type: 'datepicker' as BlockElementType,
            actionId: ModalsEnum.TASK_START_DATE_INPUT,
        },
    });

    block.addInputBlock({
        blockId: ModalsEnum.TASK_DUE_DATE_BLOCK,
        label: { text: ModalsEnum.TASK_DUE_DATE_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: {
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            type: 'datepicker' as BlockElementType,
            actionId: ModalsEnum.TASK_DUE_DATE_INPUT,
        },
    });
    
    block.addInputBlock({
        blockId: ModalsEnum.TASK_ASSIGNEES_BLOCK,
        label: { text: ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_ASSIGNEES_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL_DEFAULT,
        })
    });


    block.addActionsBlock({
        blockId: ModalsEnum.ASSIGNEE_ROOM_BLOCK,
        elements: [
            block.newStaticSelectElement({
                actionId: ModalsEnum.ASSIGNEE_ROOM_ACTION_ID,
                placeholder: block.newPlainTextObject(ModalsEnum.ASSIGNEE_ROOM_PLACEHOLDER),
                options: [{ text: { type: TextObjectType.PLAINTEXT, text: 'Yes' }, value: 'Yes' }, { text: { type: TextObjectType.PLAINTEXT, text: 'No' }, value: 'No' }],
                initialValue: 'No',
            }),
        ],
    });

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.CREATE_TASK_MODAL_NAME,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Close',
            },
        }),
        submit: block.newButtonElement({
            text: block.newPlainTextObject(ModalsEnum.CREATE_TASK_SUBMIT_BUTTON_LABEL),
        }),
        blocks: block.getBlocks(),
    };
}
