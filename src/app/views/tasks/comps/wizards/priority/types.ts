/**
 * Created by Sergey Trizna on 07.03.2018.
 */
export type WorkflowChangePriorityModel = {
    Jobs: number[];
    Priority: number;
    UpdateChildren: boolean;
}
export type TaskChangePriorityModel = {
    Tasks: number[];
    Priority: number;
    UpdateChildren: boolean;
}
