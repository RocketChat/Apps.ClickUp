import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { AppEnum } from '../enums/App';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext, BlockElementType } from '@rocket.chat/apps-engine/definition/uikit';

export async function editTaskModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext, data: any }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.EDIT_TASK;
    const block = modify.getCreator().getBlockBuilder();
    var assignees = data.assignees.map(assignee => assignee['username']);
    var dueDate = new Date(data.due_date *1);
    let dueDatevalue = dueDate.toISOString().split('T')[0];
    var startDate = new Date(data.start_date *1);
    let startDatevalue = startDate.toISOString().split('T')[0];

    block.addInputBlock({
        blockId: ModalsEnum.TASK_NAME_BLOCK,
        label: { text: ModalsEnum.TASK_NAME_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_NAME_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: data.name as string || ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT,
        })
    });

    block.addInputBlock({
        blockId: ModalsEnum.TASK_DESCRIPTION_BLOCK,
        label: { text: ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_DESCRIPTION_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: data.description as string || ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL_DEFAULT,
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
            initialValue: startDatevalue
        },
    });

    block.addInputBlock({
        blockId: ModalsEnum.TASK_DUE_DATE_BLOCK,
        label: { text: ModalsEnum.TASK_DUE_DATE_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: {
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            type: 'datepicker' as BlockElementType,
            actionId: ModalsEnum.TASK_DUE_DATE_INPUT,
            initialValue: dueDatevalue
        },
    });
    block.addInputBlock({
        blockId: ModalsEnum.TASK_ASSIGNEES_BLOCK,
        label: { text: ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL, type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TASK_ASSIGNEES_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
            initialValue: assignees.toString() as string || ModalsEnum.TASK_ASSIGNEES_INPUT_LABEL_DEFAULT,
        })
    });

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.EDIT_TASK_MODAL_NAME + data.id,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Close',
            },
        }),
        submit: block.newButtonElement({
            text: block.newPlainTextObject(ModalsEnum.EDIT_TASK_SUBMIT_BUTTON_LABEL),
        }),
        blocks: block.getBlocks(),
    };
}
