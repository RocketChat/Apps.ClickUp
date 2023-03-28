import { IHttp, IMessageBuilder, IModify, IModifyCreator, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUIKitResponse, TextObjectType, UIKitViewSubmitInteractionContext, ButtonStyle, UIKitBlockInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUIKitBaseIncomingInteraction, IUIKitViewSubmitIncomingInteraction } from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { editTaskModal } from "../../modals/editTaskModal";
import { HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";

export async function editTask({ context, data, room, read, persistence, modify, http, slashcommandcontext }: { context: UIKitBlockInteractionContext; data: IUIKitBaseIncomingInteraction; room: IRoom; read: IRead; persistence: IPersistence; modify: IModify; http: IHttp; slashcommandcontext?: SlashCommandContext }) {
  const user: IUser = context.getInteractionData().user;
  const token = await getAccessTokenForUser(read, user);
  const task_id = context.getInteractionData().value;
  const triggerId = context.getInteractionData().triggerId;
  const headers = {
    Authorization: `${token?.token}`,
  };
  const response = await http.get(`https://api.clickup.com/api/v2/task/${task_id}/`, { headers });

  if (response.statusCode == HttpStatusCode.OK) {
    if (triggerId) {
      const modal = await editTaskModal({ modify, read, persistence, http, slashcommandcontext, data: response.data });
      await modify.getUiController().openSurfaceView(modal, { triggerId }, user);
    } else {
      this.app.getLogger().error("Invalid Trigger ID");
    }
  } else {
    const textSender = await modify.getCreator().startMessage().setText(`❗️ Unable to edit task! \n Error ${response.data.err}`);
    if (room) {
      textSender.setRoom(room);
    }
    await modify.getCreator().finish(textSender);
  }
}
