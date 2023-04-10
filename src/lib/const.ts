const ApiBaseUrl: string = 'https://api.clickup.com/api';

const ApiVersion = {
    V2: 'v2',
    V3: 'v3'
};

const ApiEndpoint = {
    Profile: 'user',
    User: 'users',
    Workspace: 'team',
    Space: 'team',
    Folder: 'folder',
    List: 'list',
    Task: 'task',
    Webhook: 'webhook',
    SpacesOf: (workspaceId: string) => `${workspaceId}/space?archived=false`,
    FoldersOf: (spaceId: string) => `${spaceId}/folder?archived=false`,
    ListsOf: (folderId: string) => `${folderId}/list?archived=false`,
    ListsOfSpace: (spaceId: string) => `${spaceId}/list?archived=false`,
    TasksOf: (listId: string, archived: string, subtasks: string) => `${listId}/task?archived=${archived}&subtasks=${subtasks}`
};

export const getProfileUrl = () => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Profile}`;
};

export const getWorkspacesUrl = () => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Workspace}`;
};

export const getSpacesUrl = () => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Space}`;
};

export const getFoldersUrl = () => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Folder}`;
};

export const getListsUrl = () => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.List}`;
};

export const getTasksUrl = () => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Task}`;
};

export const getSpacesOfUrl = (workspaceId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Workspace}/${ApiEndpoint.SpacesOf(workspaceId)}`;
};

export const getFoldersOfUrl = (spaceId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/space/${ApiEndpoint.FoldersOf(spaceId)}`;
};

export const getListsOfUrl = (folderId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Folder}/${ApiEndpoint.ListsOf(folderId)}`;
};

export const getListsOfSpaceUrl = (spaceId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Space}/${ApiEndpoint.ListsOfSpace(spaceId)}`;
};

export const    getTasksOfUrl = (listId: string, archived: string, subtasks: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.List}/${ApiEndpoint.TasksOf(listId, archived, subtasks)}`;
};

export const getWorkspaceUrl = (workspaceId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Workspace}/${workspaceId}`;
};

export const getSpaceUrl = (spaceId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Space}/${spaceId}`;
};

export const getFolderUrl = (folderId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Folder}/${folderId}`;
};

export const getListUrl = (listId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.List}/${listId}`;
};

export const getTaskUrl = (taskId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Task}/${taskId}`;
};

export const getWebhookApiUrl = (webhookId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Webhook}/${webhookId}`;
};

export const postTaskUrl = (listId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.List}/${listId}/${ApiEndpoint.Task}`;
};

export const postWebhookUrl = (workspaceId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Workspace}/${workspaceId}/${ApiEndpoint.Webhook}`;
};

export const viewTaskUrl = (taskId: string) => {
    return `${ApiBaseUrl}/${ApiVersion.V2}/t/${taskId}`;
};