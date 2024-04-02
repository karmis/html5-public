/**
 * Created by Sergey Trizna on 02.10.2017.
 */
import {UserLookupType, UsersListLookupTypes} from "../../../../../../../../../../../../services/lookupsearch/types";
export type AdvancedCriteriaControlLookupUsersModalDataType = {
    users: UsersListLookupTypes,
    user?: UserLookupType,
    paramsOfSearch: string,
    filteredUser?: UsersListLookupTypes,
}