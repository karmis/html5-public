import { ConsumerSearchFacets } from '../../modules/search/facets1/models/consumer.facets';
import { ConsumerSearchItem } from './consumer.search.item';

export interface ConsumerSearchResponse {
    Facets: ConsumerSearchFacets[];
    Items: ConsumerSearchItem[];
    ResultCount: number;
    SeriesInfo: any;
}
