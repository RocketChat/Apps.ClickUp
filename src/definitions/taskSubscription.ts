import { IUser } from "@rocket.chat/apps-engine/definition/users";

export interface ITaskSubscription{
    webhookId : string,
    taskId : string,
    taskName : string,
    user : IUser
}