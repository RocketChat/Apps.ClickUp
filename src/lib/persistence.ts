import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

export const persistUIData = async (persistence: IPersistence, id: string, data: any): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    await persistence.updateByAssociation(association, data, true);
};

export const getUIData = async (persistenceRead: IPersistenceRead, id: string): Promise<any> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    const result = await persistenceRead.readByAssociation(association) as Array<any>;
    return result && result.length ? result[0] : null;
};

export const clearUIData = async (persistence: IPersistence, id: string): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    await persistence.removeByAssociation(association);
};