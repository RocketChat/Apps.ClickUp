// to be used in code-refactoring period.

export interface ICreateTaskState {
    state: {
        taskInfo: {
            taskName: string;
            taskDescription: string;
        };
    };
}