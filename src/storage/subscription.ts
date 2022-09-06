import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { ISubscription } from "../definitions/subscription";

export class Subscription {
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead
    ) {}

    public async createSubscription(
        taskName: string,
        taskId: string,
        webhookId: string,
        room: IRoom,
        user: IUser
    ): Promise<boolean> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `taskName:${taskName}`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `taskId:${taskId}`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    room.id
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    `${user.id}`
                ),
            ];
            let subscriptionRecord: ISubscription = {
                webhookId: webhookId,
                user: user.id,
                taskName: taskName,
                taskId: taskId,
                room: room.id,
            };
            await this.persistence.updateByAssociations(
                associations,
                subscriptionRecord,
                true
            );
        } catch (error) {
            console.warn("Subscription Error :", error);
            return false;
        }
        return true;
    }

    public async getSubscribedRooms(
        taskId: string,
    ): Promise<Array<ISubscription>> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `taskId:${taskId}`
                ),
            ];
            let subscriptions: Array<ISubscription> =
                (await this.persistenceRead.readByAssociations(
                    associations
                )) as Array<ISubscription>;
            return subscriptions;
        } catch (error) {
            console.warn("Get Subscribed Rooms Error :", error);
            let subscriptions: Array<ISubscription> = [];
            return subscriptions;
        }
    }

    public async getSubscriptions(
        roomId: string
    ): Promise<Array<ISubscription>> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    roomId
                ),
            ];
            let subscriptions: Array<ISubscription> =
                (await this.persistenceRead.readByAssociations(
                    associations
                )) as Array<ISubscription>;
            return subscriptions;
        } catch (error) {
            console.warn("Get Subscription Error :", error);
            let subscriptions: Array<ISubscription> = [];
            return subscriptions;
        }
    }

    public async deleteSubscriptions(
        taskId: string,
        roomId: string
    ): Promise<boolean> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `taskId:${taskId}`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    roomId
                ),
            ];
            await this.persistence.removeByAssociations(associations);
        } catch (error) {
            console.warn("Delete Subscription Error :", error);
            return false;
        }
        return true;
    }
    public async deleteSubscriptionsByTaskUser(
        taskId: string,
        roomId: string,
        userId: string
    ): Promise<boolean> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `taskId:${taskId}`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    `${userId}`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    roomId
                ),
            ];
            await this.persistence.removeByAssociations(associations);
        } catch (error) {
            console.warn("Delete Subscription Error :", error);
            return false;
        }
        return true;
    }

    public async deleteAllRoomSubscriptions(roomId: string): Promise<boolean> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.ROOM,
                    roomId
                ),
            ];
            await this.persistence.removeByAssociations(associations);
        } catch (error) {
            console.warn("Delete All Room Subscription Error :", error);
            return false;
        }
        return true;
    }

    public async getSubscriptionsByTask(
        taskId: string,
        userId: string
    ): Promise<Array<ISubscription>> {
        let subscriptions: Array<ISubscription> = [];
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `subscription`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `taskId:${taskId}`
                ),
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.USER,
                    `${userId}`
                ),
            ];
            subscriptions = (await this.persistenceRead.readByAssociations(
                associations
            )) as Array<ISubscription>;
        } catch (error) {
            console.warn("Get Subscriptions By Task Error :", error);
            return subscriptions;
        }
        return subscriptions;
    }
}
