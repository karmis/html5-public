/**
 * Created by Sergey Trizna on 02.10.2017.
 */
export type LocationLookupType = {
    $id: number,
    ID: number,
    LOC_TYP: number,
    NAM: string,
    PAR_ID: number,
    Parent: LocationRefToParent,
    Children?: LocationsListLookupTypes
};

export type LocationRefToParent = {
    $ref: number
};

export type LocationsListLookupTypes = Array<LocationLookupType>;
