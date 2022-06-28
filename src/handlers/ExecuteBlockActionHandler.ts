import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IApp } from "@rocket.chat/apps-engine/definition/IApp";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { ModalsEnum } from "../enums/Modals";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { getAccessTokenForUser } from '../storage/users';
import { postTask } from "../lib/postTask";

export class ExecuteBlockActionHandler {
    constructor(
        private readonly app: IApp,
        private readonly read: IRead,
        private readonly http: IHttp,
        private readonly modify: IModify,
        private readonly persistence: IPersistence
    ) {}

    public async run(
        context: UIKitBlockInteractionContext
    ): Promise<IUIKitResponse> {
        console.log("reaching block action handler");
        const data = context.getInteractionData();
        const { actionId, user } = data;

        switch (actionId) {
            case "trial": {

        try {
			this.app.getLogger().info(data);
            // await postTask({context,data,room,read,persistence,modify,http});
            console.log("block action hanler reached");
                } catch (error) {
            this.app.getLogger().error(error);
                //code for creating new task
            }
        }
    }

        return context.getInteractionResponder().successResponse();
    }

}