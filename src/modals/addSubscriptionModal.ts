import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { TextObjectType } from "@rocket.chat/apps-engine/definition/uikit/blocks";
import { IUIKitModalViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { ModalsEnum } from "../enums/Modals";
import { AppEnum } from "../enums/App";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    UIKitBlockInteractionContext,
    UIKitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import {
    storeInteractionRoomData,
    getInteractionRoomData,
} from "../storage/roomInteraction";
import { Subscription } from "../storage/subscription";
import { ISubscription } from "../definitions/subscription";

export async function AddSubscriptionModal({
    modify,
    read,
    persistence,
    http,
    slashcommandcontext,
    uikitcontext,
    data
}: {
    modify: IModify;
    read: IRead;
    persistence: IPersistence;
    http: IHttp;
    slashcommandcontext?: SlashCommandContext;
    uikitcontext?: UIKitInteractionContext;
    data?: string
}): Promise<IUIKitModalViewParam> {
    const viewId = ModalsEnum.ADD_SUBSCRIPTION;
    const workspace_id = data?.split(',')[0];
    const task_name = data?.split(',')[1];
    const task_id = data?.split(',')[2];

    const block = modify.getCreator().getBlockBuilder();
    const room =
        slashcommandcontext?.getRoom() ||
        uikitcontext?.getInteractionData().room;
    const user =
        slashcommandcontext?.getSender() ||
        uikitcontext?.getInteractionData().user;

    if (user?.id) {
        let roomId;

        if (room?.id) {
            roomId = room.id;
            await storeInteractionRoomData(persistence, user.id, roomId);
        } else {
            roomId = (
                await getInteractionRoomData(
                    read.getPersistenceReader(),
                    user.id
                )
            ).roomId;
        }

        let subscriptionStorage = new Subscription(
            persistence,
            read.getPersistenceReader()
        );
        let roomSubscriptions: Array<ISubscription> =
            await subscriptionStorage.getSubscriptions(roomId);
        if(!data){
            block.addSectionBlock({
                text: block.newPlainTextObject(`This is the naive way to subscribe to task notifications! \nPlease use get-workspaces subcommand!`),
            });
        }
        block.addInputBlock({
            blockId: ModalsEnum.WORKSPACE_ID_BLOCK,
            label: {
                text: ModalsEnum.WORKSPACE_ID_LABEL,
                type: TextObjectType.PLAINTEXT,
            },
            element: block.newPlainTextInputElement({
                actionId: ModalsEnum.WORKSPACE_ID_INPUT,
                placeholder: {
                    text: ModalsEnum.WORKSPACE_ID_PLACEHOLDER,
                    type: TextObjectType.PLAINTEXT,
                },
                initialValue: workspace_id || '',
            }),
        });
        block.addInputBlock({
            blockId: ModalsEnum.TASK_NAME_BLOCK,
            label: {
                text: ModalsEnum.TASK_NAME_INPUT_LABEL,
                type: TextObjectType.PLAINTEXT,
            },
            element: block.newPlainTextInputElement({
                actionId: ModalsEnum.TASK_NAME_INPUT,
                placeholder: {
                    text: ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT,
                    type: TextObjectType.PLAINTEXT,
                },
                initialValue: task_name || '',
            }),
        });


        block.addInputBlock({
            blockId: ModalsEnum.TASK_ID_BLOCK,
            label: {
                text: ModalsEnum.TASK_ID_LABEL,
                type: TextObjectType.PLAINTEXT,
            },
            element: block.newPlainTextInputElement({
                actionId: ModalsEnum.TASK_ID_INPUT,
                placeholder: {
                    text: ModalsEnum.TASK_ID_PLACEHOLDER,
                    type: TextObjectType.PLAINTEXT,
                },
                initialValue: task_id || '',
            }),
        });

        
    }

    block.addDividerBlock();

    return {
        id: viewId,
        title: {
            type: TextObjectType.PLAINTEXT,
            text: ModalsEnum.ADD_SUBSCIPTIONS_TITLE,
        },
        close: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: "Close",
            },
        }),
        submit: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: "Subscribe",
            },
        }),
        blocks: block.getBlocks(),
    };
}