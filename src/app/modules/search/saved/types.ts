/**
 * Created by Sergey Trizna on 22.09.2017.
 */
export type SavedSearchListItem = {
    "ID": number,
    "Name": string,
    "Selected": boolean
}

export type SavedSearchList = Array<SavedSearchListItem>

export type SaveSearchResponse = {
    "ObjectId": number,
    "ID": number,
    "RuleResult"?: any,
    "Result": boolean,
    "Error": ErrorMessageResponse,
    "ErrorCode": string
}

export type ErrorMessageResponse = {
    Message: string
}