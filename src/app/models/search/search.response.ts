import { AllSearchDataItem } from './search.data.item';
import { AllSearchFacets } from './search.facets';

export type AllSearchResponse = {
    Data: Array<AllSearchDataItem>;
    Facets?: AllSearchFacets;
    Rows: number;
};
