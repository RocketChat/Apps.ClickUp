import { IHttp, IModify, IPersistence, IRead, IUIKitSurfaceViewParam } from "@rocket.chat/apps-engine/definition/accessors";
import { ModalsEnum } from "../enums/Modals";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { UIKitInteractionContext, UIKitSurfaceType } from "@rocket.chat/apps-engine/definition/uikit";
import { storeInteractionRoomData, getInteractionRoomData } from "../storage/roomInteraction";
import { Subscription } from "../storage/subscription";
import { ISubscription } from "../definitions/subscription";
import { Block } from "@rocket.chat/ui-kit";
import { getButton, getDividerBlock, getInputBox, getSectionBlock } from "../helpers/blockBuilder";

export async function AddSubscriptionModal({ modify, read, persistence, http, slashcommandcontext, uikitcontext, data }: { modify: IModify; read: IRead; persistence: IPersistence; http: IHttp; slashcommandcontext?: SlashCommandContext; uikitcontext?: UIKitInteractionContext; data?: string }): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.ADD_SUBSCRIPTION;
  const workspace_id = data?.split(",")[0];
  const task_name = data?.split(",")[1];
  const task_id = data?.split(",")[2];
  const block: Block[] = [];
  const room = slashcommandcontext?.getRoom() || uikitcontext?.getInteractionData().room;
  const user = slashcommandcontext?.getSender() || uikitcontext?.getInteractionData().user;

  if (user?.id) {
    let roomId;

    if (room?.id) {
      roomId = room.id;
      await storeInteractionRoomData(persistence, user.id, roomId);
    } else {
      roomId = (await getInteractionRoomData(read.getPersistenceReader(), user.id)).roomId;
    }

    let subscriptionStorage = new Subscription(persistence, read.getPersistenceReader());
    let roomSubscriptions: Array<ISubscription> = await subscriptionStorage.getSubscriptions(roomId);
    if (!data) {
      const textSectionBlock = await getSectionBlock("This is the naive way to subscribe to task notifications! \nPlease use get-workspaces subcommand!");
      block.push(textSectionBlock);
    }
    let workspaceIdInputBox = await getInputBox(ModalsEnum.WORKSPACE_ID_LABEL, ModalsEnum.WORKSPACE_ID_PLACEHOLDER, ModalsEnum.WORKSPACE_ID_BLOCK, ModalsEnum.WORKSPACE_ID_INPUT, workspace_id || "");
    let taskNameInputBox = await getInputBox(ModalsEnum.TASK_NAME_INPUT_LABEL, ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT, ModalsEnum.TASK_NAME_BLOCK, ModalsEnum.TASK_NAME_INPUT, task_name || "");
    let taskIdInputBox = await getInputBox(ModalsEnum.TASK_ID_LABEL, ModalsEnum.TASK_ID_PLACEHOLDER, ModalsEnum.TASK_ID_BLOCK, ModalsEnum.TASK_ID_INPUT, task_id || "");
    block.push(workspaceIdInputBox,taskNameInputBox,taskIdInputBox);
  }
  let dividerBlock = await getDividerBlock();
  block.push(dividerBlock);

  let closeButton = await getButton("Close", "", "");
  let submitButton = await getButton("Subscribe", "", ModalsEnum.ADD_SUBSCRIPTION);
  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: "plain_text",
      text: ModalsEnum.ADD_SUBSCIPTIONS_TITLE,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
