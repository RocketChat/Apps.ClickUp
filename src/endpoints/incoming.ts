import { ApiEndpoint } from "@rocket.chat/apps-engine/definition/api";
import {
    IRead,
    IHttp,
    IModify,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IApiEndpointInfo,
    IApiEndpoint,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { Subscription } from "../storage/subscription";
import { ISubscription } from "../definitions/subscription";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { retrieveUserByClickUpUserIdAsync } from "../storage/users";
import { sendDirectMessage } from "../lib/message";

export class clickupWebhooks extends ApiEndpoint {
    public path = "clickupwebhook";
    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        const creator = modify.getCreator();
        const userReader = read.getUserReader();
        const roomBuilder = creator.startRoom();
        const payload: any = request.content;
        let subscriptionStorage = new Subscription(persis,read.getPersistenceReader());
        const subscriptions: Array<ISubscription> =
            await subscriptionStorage.getSubscribedRooms(
                payload.task_id,
            );
        if (!subscriptions || subscriptions.length == 0) {
            return this.success();
        }
        let event: string = payload?.event;
        let messageText = "newEvent !";
        switch(event) {
            case "taskStatusUpdated":
                messageText = `Task status has been updated from ${payload?.history_items[0]?.before?.status} to ${payload?.history_items[0]?.after?.status}`
                break;
            case "taskDeleted":
                messageText = `Task ID #${payload.task_id} has been deleted, kindly remove it from subscriptions.`
            case "taskPriorityUpdated":
                messageText = `Task priority has been updated from ${payload?.history_items[0]?.before?.priority} to ${payload?.history_items[0]?.after?.priority}`
                break;
            case "taskAssigneeUpdated":
                messageText =  `Task assignees have been changed, use get-tasks command to Edit assignees.`
                let new_assignee_id = payload?.history_items[0]?.after?.id
                const rocketChatUser = await retrieveUserByClickUpUserIdAsync(
                    read,
                    new_assignee_id
                );
                if (rocketChatUser) {
                    const user = await userReader.getById(
                        rocketChatUser.rocketChatUserId
                    );
                    const msg_to_user =
                    `Hello, ${user.name}!\n` +
                    `You have been added as an assignee to the Task ID #${payload.task_id}`
                    
                    await sendDirectMessage(read, modify, user, msg_to_user, persis);
                } 
                break;
            case "taskDueDateUpdated":
                let olddueDate = new Date(payload?.history_items[0]?.before *1);
                let olddueDatevalue = olddueDate.toISOString().split('T')[0];
                let newdueDate = new Date(payload?.history_items[0]?.after *1);
                let newdueDatevalue = newdueDate.toISOString().split('T')[0];
                messageText = `Task due date has been changed ${olddueDatevalue} to ${newdueDatevalue}`
                break;
            case "taskCommentPosted":
                messageText = `New comment has been made on the task: ${payload?.history_items[0]?.comment?.text_content}`
                break;
            case "taskCommentUpdated":
                messageText = `Comment on the task has been updated to: ${payload?.history_items[0]?.comment?.text_content}`
                break;
            case "taskTimeEstimateUpdated":
                messageText = `Task estimated time has been updated to: ${payload?.history_items[0]?.data?.time_estimate_string}`
                break;
            case "taskTimeTrackedUpdated":
                messageText = `New time entry has been added to the task.`
                break;
            default:
                messageText = `There are some changes in the task ${payload.task_id}`
                break;

        }
        for (let subscription of subscriptions) {
            let roomId = subscription.room;
            if (!roomId) {
                continue;
            }
            const room: IRoom = (await read
                .getRoomReader()
                .getById(roomId)) as IRoom;
            const textSender = await modify
                .getCreator()
                .startMessage()
                .setText(messageText);
            if (room) {
                textSender.setRoom(room);
            }
            await modify.getCreator().finish(textSender);
        }

        return this.success();
    }
}
