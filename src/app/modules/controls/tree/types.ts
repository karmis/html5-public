/**
 * Created by Sergey Trizna on 02.10.2017.
 */
export type TreeStandardItemType = {
    key: string|number|any,
    title: string,
    folder: boolean,
    children: TreeStandardListTypes,
    selected: boolean
    expanded?: boolean
    dirtyObj: {}
}

export type TreeStandardIndexedListTypes = {
    [key:number]: TreeStandardItemType
};
export type TreeStandardListTypes = Array<TreeStandardItemType>;

export type TreeStandardConvertParamsType = {
    key: string,
    title: string,
    children: string,
    additionalData?: string,
    selected?: string,
    active?: string,
    lazy?: string|boolean
    autoExpand?:boolean
};

export type TreeStandardPointerToNodeType = {
    key: string
};

export type TreeStandardListOfPointersToNodesTypes = Array<TreeStandardPointerToNodeType>
