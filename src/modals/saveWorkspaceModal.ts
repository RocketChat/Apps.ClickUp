import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enums/Modals';
import { AppEnum } from '../enums/App';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitBlockInteractionContext, UIKitInteractionContext, BlockElementType } from '@rocket.chat/apps-engine/definition/uikit';

export async function saveWorkspaceModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify, read: IRead, persistence: IPersistence, http: IHttp ,slashcommandcontext?: SlashCommandContext, uikitcontext?: UIKitInteractionContext, data: any }): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.SAVE_WORKSPACE;
    const block = modify.getCreator().getBlockBuilder();
    const membercount = data.members.length;
    block.addSectionBlock({
        text: block.newPlainTextObject(`Do not change the input boxes, just enter username after colon.`),
    });
   data.members.forEach((member,index) =>{
        block.addInputBlock({
            blockId: ModalsEnum.MEMBER_USERNAME_BLOCK+`#${index}`,
            label: { text: `Enter Rocket.Chat username of ClickUp user: \n`+`${member.user.username} (${member.user.email})`, type: TextObjectType.PLAINTEXT },
            element: block.newPlainTextInputElement({
                actionId: ModalsEnum.MEMBER_USERNAME_INPUT+`#${index}`,
                placeholder: { text: '', type: TextObjectType.PLAINTEXT },
                initialValue: `${member.user.id}:`,

            })
        });
        }
   )


    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.SAVE_WORKSPACE_MODAL_NAME + data.name + '#'+data.id +'#'+membercount,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Close',
            },
        }),
        submit: block.newButtonElement({
            text: block.newPlainTextObject(ModalsEnum.SAVE_WORKSPACE_SUBMIT_BUTTON_LABEL),
        }),
        blocks: block.getBlocks(),
    };
}
