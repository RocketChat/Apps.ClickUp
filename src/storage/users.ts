import { IPersistence, IPersistenceRead, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { RocketChatAssociationModel, RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";
import { IAuthData, IOAuth2ClientOptions } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export interface UserModel {
    rocketChatUserId: string;
    clickUpUserId: string;
}

const assoc = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'users');

export const persistUserAsync = async (
    persis: IPersistence,
    rocketChatUserId: string,
    clickUpUserId: string
): Promise<void> => {
    const associationsByRocketChatUserId: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'User'
        ),
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            rocketChatUserId
        ),
    ];
    const associationsByTeamsUserId: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'User'
        ),
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            clickUpUserId
        ),
    ];
    const data: UserModel = {
        rocketChatUserId,
        clickUpUserId,
    };

    await persis.updateByAssociations(
        associationsByRocketChatUserId,
        data,
        true
    );
    await persis.updateByAssociations(associationsByTeamsUserId, data, true);
};

export const retrieveUserByRocketChatUserIdAsync = async (
    read: IRead,
    rocketChatUserId: string
): Promise<UserModel | null> => {
    const associations: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'User'
        ),
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            rocketChatUserId
        ),
    ];

    const persistenceRead: IPersistenceRead = read.getPersistenceReader();
    const results = await persistenceRead.readByAssociations(associations);

    if (results === undefined || results === null || results.length == 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(
            `More than one User record for user ${rocketChatUserId}`
        );
    }

    const data: UserModel = results[0] as UserModel;
    return data;
};

export const retrieveUserByClickUpUserIdAsync = async (
    read: IRead,
    clickUpUserId: string
): Promise<UserModel | null> => {
    const associations: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'User'
        ),
        new RocketChatAssociationRecord(
            RocketChatAssociationModel.USER,
            clickUpUserId
        ),
    ];

    const persistenceRead: IPersistenceRead = read.getPersistenceReader();
    const results = await persistenceRead.readByAssociations(associations);

    if (results === undefined || results === null || results.length == 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(`More than one User record for user ${clickUpUserId}`);
    }

    const data: UserModel = results[0] as UserModel;
    return data;
};


export async function create(read: IRead, persistence: IPersistence, user: IUser): Promise<void> {
    const users = await getAllUsers(read);

    if (!users) {
        await persistence.createWithAssociation([user], assoc);
        return;
    }

    if (!isUserPresent(users, user)) {
        users.push(user);
        await persistence.updateByAssociation(assoc, users);
    }
}

export async function remove(read: IRead, persistence: IPersistence, user: IUser): Promise<void> {
    const users = await getAllUsers(read);

    if (!users || !isUserPresent(users, user)) {
        // @NOTE do nothing
        return;
    }

    const idx = users.findIndex((u: IUser) => u.id === user.id);
    users.splice(idx, 1);
    await persistence.updateByAssociation(assoc, users);
}

export async function getAllUsers(read: IRead): Promise<IUser[]> {
    const data = await read.getPersistenceReader().readByAssociation(assoc);
    return (data.length ? data[0] as IUser[] : []);
}

function isUserPresent(users: IUser[], targetUser: IUser): boolean {
    return users.some((user) => user.id === targetUser.id);
}

/**
  * This function needed to be copied from the apps engine due to difficulties trying to
  * get access to the auth client from inside a job processor.
  * @NOTE It relies on hardcoded information (config alias's suffix) to work and it might break if
  * the value changes
  */
export async function getAccessTokenForUser(read: IRead, user: IUser): Promise<IAuthData | undefined> {
        const associations = [
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.USER,
                user.id,
            ),
            new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                `clickup-app-oauth-connection`,
            ),
        ];

        const [ result ] = await read.getPersistenceReader().readByAssociations(associations) as unknown as Array<IAuthData | undefined>;

        return result;
}
