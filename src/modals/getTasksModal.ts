import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ModalsEnum } from '../enums/Modals';
import { AppEnum } from '../enums/App';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

export async function getTasksModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.GET_TASKS;
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
        blockId: ModalsEnum.TASK_LIMIT_BLOCK,
        label: { text: ModalsEnum.TASK_LIMIT_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_LIMIT_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: ModalsEnum.TASK_LIMIT_INPUT_LABEL_DEFAULT,
        })
    });

    block.addSectionBlock({
        text: {
            text: ModalsEnum.OPTIONAL_PARAMETERS_LABEL,
            type: TextObjectType.PLAINTEXT,
        },
    });

    block.addActionsBlock({
        blockId: ModalsEnum.ARCHIVED_BLOCK,
        elements: [
            block.newStaticSelectElement({
                actionId: ModalsEnum.ARCHIVED_ACTION_ID,
                placeholder: block.newPlainTextObject(ModalsEnum.ARCHIVED_PLACEHOLDER),
                options: [{ text: { type: TextObjectType.PLAINTEXT, text: 'Yes' }, value: 'Yes' }, { text: { type: TextObjectType.PLAINTEXT, text: 'No' }, value: 'No' }],
                initialValue: 'No',
            }),
        ],
    });
    block.addActionsBlock({
        blockId: ModalsEnum.SUBTASKS_BLOCK,
        elements: [
            block.newStaticSelectElement({
                actionId: ModalsEnum.SUBTASKS_ACTION_ID,
                placeholder: block.newPlainTextObject(ModalsEnum.SUBTASKS_PLACEHOLDER),
                options: [{ text: { type: TextObjectType.PLAINTEXT, text: 'Yes' }, value: 'Yes' }, { text: { type: TextObjectType.PLAINTEXT, text: 'No' }, value: 'No' }],
                initialValue: 'No',
            }),
        ],
    });

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.GET_TASKS_MODAL_NAME,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Close',
            },
        }),
        submit: block.newButtonElement({
            text: block.newPlainTextObject(ModalsEnum.GET_TASKS_SUBMIT_BUTTON_LABEL),
        }),
        blocks: block.getBlocks(),
    };
}
