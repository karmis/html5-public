/**
 * Created by Sergey Trizna on 02.10.2017.
 */
export type UserLookupType = {
    Id: number,
    UserId: string,
    Forename: string,
    Surname: string,
    AgencyID?: number,
    Biography?: null,
    ID?: number,
    Name?: string,
    Provenance?: string,
    RelatedAgency?: null,
    RelatedProvenance?: null,
    Type?: string,
    id?: number,
};
export type UsersListLookupTypes = Array<UserLookupType>;
