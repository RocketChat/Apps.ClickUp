import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ModalsEnum } from '../enums/Modals';
import { AppEnum } from '../enums/App';
// import { getRoomTasks, getUIData, persistUIData } from '../lib/persistence';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

export async function createTaskModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.CREATE_TASK;

    const block = modify.getCreator().getBlockBuilder();

    const room = slashcommandcontext?.getRoom() || uikitcontext?.getInteractionData().room;
    const user = slashcommandcontext?.getSender() || uikitcontext?.getInteractionData().user;
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
  
    block.addActionsBlock({
        elements: [
            block.newButtonElement({
                actionId: ModalsEnum.CREATE_TASK,
                text: { text: ModalsEnum.CREATE_TASK_LABEL, type: TextObjectType.PLAINTEXT },
                value: room?.id
            }),
            block.newButtonElement({
                actionId: ModalsEnum.CREATE_TASK_WITH_ROOM,
                text: { text: ModalsEnum.CREATE_TASK_WITH_ROOM_LABEL, type: TextObjectType.PLAINTEXT },
                value: room?.id
            }),
        ]
    });

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: AppEnum.DEFAULT_TITLE,
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
