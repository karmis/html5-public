/**
 * Created by Sergey Trizna on 02.09.2017.
 */
export interface Select2ItemTypeGroup {
    id: number;
    text: string;
    children: Select2ItemType[];
}

export type Select2ItemType = {
    id: number|string,
    text: string,
    isSelected?: boolean,
    isDefault?: boolean,
    isNewTag?: boolean,
}

export type Select2ListTypes = Array<Select2ItemType>;

export type Select2ObjectTypes = {
    [key:number]: Select2ItemType
}


export type Select2ConvertObject = {
    key: string,
    text:string,
    selected?: string,
    disabled?: string
}

export type Select2ClearFormat = {
    showButton: boolean,
    defaultValue?: any
    withTrigger?: boolean
}
