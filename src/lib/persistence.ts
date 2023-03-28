import { IPersistence, IPersistenceRead, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { RocketChatAssociationModel, RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";

export const persistUIData = async (persistence: IPersistence, id: string, data: any): Promise<void> => {
  const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${id}#UI`);
  await persistence.updateByAssociation(association, data, true);
};

export const getUIData = async (persistenceRead: IPersistenceRead, id: string): Promise<any> => {
  const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${id}#UI`);
  const result = (await persistenceRead.readByAssociation(association)) as Array<any>;
  return result && result.length ? result[0] : null;
};

export const clearUIData = async (persistence: IPersistence, id: string): Promise<void> => {
  const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${id}#UI`);
  await persistence.removeByAssociation(association);
};

export const persist_workspace = async (read: IRead, persistence: IPersistence, user: string, workspace: string, members: string[]): Promise<void> => {
  const [wid, wname] = workspace.split(":");
  const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user);
  const workspacesofuser = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, "saved_workspaces");
  const workspacedata = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, `workspace:${wid}`);

  await persistence.updateByAssociations([user_association, workspacesofuser], { workspacename: wname, workspaceid: wid, members: members }, true);
};
