import {RESTColumnSettings, RESTColumSetup} from "../slick-grid/types";
import {ReturnRequestStateType} from "../../../views/base/types";

export type ViewType = {
    ColumnData: RESTColumSetups;
    Id: number;
    IsPublic: boolean;
    PlacementId: number;
    SearchColumns: string[],
    ShowThumbs: boolean,
    Type: string,
    ViewName: string | null,
}

export type RESTColumSetups = {
    [key: string]: RESTColumSetup
}

export type ViewsOriginalType = {
    BuilderType: string;
    DataGridTag: any | null;
    DefaultSearchColumns: string[]
    DefaultView: ViewType
    DefaultViewName: string | null;
    DefaultWidth: number
    UserViews: UserViewsOriginalType[]
    ViewColumns: ViewColumnsType
}

export type UserViewsOriginalType = {
    id: number|string,
    Id?: number|string,
    text: string,
    isSelected?: boolean
}

export type ViewColumnsType = {
    [key: string]: RESTColumnSettings
}

export type CurrentViewsStateType = {
    viewObject: ViewType;
    isSaved: boolean
}

export type ViewSaveResp = ReturnRequestStateType & {
    ID: number;
}


export type SaveViewValidateResult = { saveError: string, valid: boolean }
