import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitViewSubmitInteractionContext , ButtonStyle} from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { ModalsEnum } from "../../enums/Modals";
import { MiscEnum } from "../../enums/Misc";
import { HttpStatusCode } from '@rocket.chat/apps-engine/definition/accessors';

export async function getTasks({
    context,
    data,
    room,
    read,
    persistence,
    modify,
    http,
}: {
    context: UIKitViewSubmitInteractionContext,
    data: IUIKitViewSubmitIncomingInteraction,
    room: IRoom;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {
    const state = data.view.state;
    const user: IUser = context.getInteractionData().user;
    const token = await getAccessTokenForUser(read, user);
    const list_id = state?.[ModalsEnum.LIST_ID_BLOCK]?.[ModalsEnum.LIST_ID_INPUT];
    const archived = state?.[ModalsEnum.ARCHIVED_BLOCK]?.[ModalsEnum.ARCHIVED_ACTION_ID] == "Yes"?"true":"false";
    const subtasks = state?.[ModalsEnum.SUBTASKS_BLOCK]?.[ModalsEnum.SUBTASKS_ACTION_ID] == "Yes"?"true":"false";
    const taskLimit = state?.[ModalsEnum.TASK_LIMIT_BLOCK]?.[ModalsEnum.TASK_LIMIT_INPUT];
    const incomingtitle = data.view.title.text;
    let workspace_id;
    incomingtitle.includes('#') ? workspace_id = incomingtitle.split('#')[1]: workspace_id ='';
    let limit = taskLimit;
    limit > 101 ? 100: limit = taskLimit;

    const headers = {
        Authorization: `${token?.token}`,
    };

    const response = await http.get(`https://api.clickup.com/api/v2/list/${list_id}/task?archived=${archived}&subtasks=${subtasks}`,{ headers });
    if(response.statusCode==HttpStatusCode.OK) {
        const builder = await modify.getCreator().startMessage().setRoom(room);
        const block = modify.getCreator().getBlockBuilder();
        response.data.tasks.forEach(async (task) => {
            if (limit == 0) return;
            if (limit--) {
                    block.addSectionBlock({
                        text: block.newPlainTextObject(`${task.name}`),
                    });
                    block.addContextBlock({ elements: [ block.newPlainTextObject(`Description: `+`${task.description}`.slice(0, 80) + `...`)]});
                    if (workspace_id !=''){
                        block.addActionsBlock({
                            blockId: MiscEnum.TASK_ACTIONS_BLOCK,
                            elements: [
                                block.newButtonElement({
                                    actionId: MiscEnum.VIEW_TASK_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.VIEW_TASK_BUTTON),
                                    value: `${task.url}`,
                                    url: `${task.url}`,
                                }),
                                block.newButtonElement({
                                    actionId: MiscEnum.SHARE_TASK_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.SHARE_TASK_BUTTON),
                                    value: `${task.id}`,
                                    style: ButtonStyle.PRIMARY,
                                }),
                                block.newButtonElement({
                                    actionId: MiscEnum.EDIT_TASK_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.EDIT_TASK_BUTTON),
                                    value: `${task.id}`,
                                }),
                                block.newButtonElement({
                                    actionId: MiscEnum.DELETE_TASK_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.DELETE_TASK_BUTTON),
                                    value: `${task.id}`,
                                    style: ButtonStyle.DANGER,
                                }),
                                block.newButtonElement({
                                    actionId: MiscEnum.SUBSCRIBE_TASK_ACTION_ID,
                                    text: block.newPlainTextObject(MiscEnum.SUBSCRIBE_TASK_BUTTON),
                                    value: `${workspace_id},${task.name},${task.id}`,
                                    style: ButtonStyle.PRIMARY,
                                }),
                            ],
                        });
                    }
                    else {
                    block.addActionsBlock({
                        blockId: MiscEnum.TASK_ACTIONS_BLOCK,
                        elements: [
                            block.newButtonElement({
                                actionId: MiscEnum.VIEW_TASK_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.VIEW_TASK_BUTTON),
                                value: `${task.url}`,
                                url: `${task.url}`,
                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.SHARE_TASK_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.SHARE_TASK_BUTTON),
                                value: `${task.id}`,
                                style: ButtonStyle.PRIMARY,
                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.EDIT_TASK_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.EDIT_TASK_BUTTON),
                                value: `${task.id}`,
                            }),
                            block.newButtonElement({
                                actionId: MiscEnum.DELETE_TASK_ACTION_ID,
                                text: block.newPlainTextObject(MiscEnum.DELETE_TASK_BUTTON),
                                value: `${task.id}`,
                                style: ButtonStyle.DANGER,
                            }),
                        ],
                    });}
                    builder.setBlocks(block);
                
            }
        });
        await modify
                .getNotifier()
                .notifyUser(user, builder.getMessage());;
    }
    else {
        const textSender = await modify
        .getCreator()
        .startMessage()
        .setText(`❗️ Unable to retrieve tasks! \n Error ${response.data.err}`);
        if (room) {
            textSender.setRoom(room);
        }
    await modify.getCreator().finish(textSender);
    }
}