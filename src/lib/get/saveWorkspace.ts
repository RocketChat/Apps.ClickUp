import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { UIKitBlockInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUIKitBaseIncomingInteraction} from "@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { getAccessTokenForUser } from "../../storage/users";
import { HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";
import { saveWorkspaceModal } from "../../modals/saveWorkspaceModal";

export async function saveWorkspace({ context, data, room, read, persistence, modify, http, slashcommandcontext }: { context: UIKitBlockInteractionContext; data: IUIKitBaseIncomingInteraction; room: IRoom; read: IRead; persistence: IPersistence; modify: IModify; http: IHttp; slashcommandcontext?: SlashCommandContext }) {
  const user: IUser = context.getInteractionData().user;
  const token = await getAccessTokenForUser(read, user);
  const workspace_id = context.getInteractionData().value;
  const triggerId = context.getInteractionData().triggerId;
  const headers = {
    Authorization: `${token?.token}`,
  };
  const response = await http.get(`https://api.clickup.com/api/v2/team`, { headers });
  const workspace = response.data.teams.find((x) => x.id === `${workspace_id}`);
  if (response.statusCode == HttpStatusCode.OK) {
    if (triggerId) {
      const modal = await saveWorkspaceModal({ modify, read, persistence, http, slashcommandcontext, data: workspace });
      await modify.getUiController().openSurfaceView(modal, { triggerId }, user);
    } else {
      this.app.getLogger().error("Invalid Trigger ID");
    }
  } else {
    const textSender = await modify.getCreator().startMessage().setText(`❗️ Unable to save workspace! \n Error ${response.data.err}`);
    if (room) {
      textSender.setRoom(room);
    }
    await modify.getCreator().finish(textSender);
  }
}
