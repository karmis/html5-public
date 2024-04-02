import { AllSearchFacetsItem } from './search.facets.item';

export type AllSearchFacetsHead = {
    Facets: Array<AllSearchFacetsItem>;
    FieldId: string;
    FieldName: string;
    SearchField: string;
};
