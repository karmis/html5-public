import { FacetsService } from '../facets.service';
import { SearchFormProvider } from '../../form/providers/search.form.provider';
import { FacetsStore } from '../store/facets.store';

// TODO lekaving: it's dirty hack parentContext
export interface FacetsConfig {
    parentContext: null | any ;
    service: null | FacetsService;
    searchForm: null | SearchFormProvider;
    store?: null | FacetsStore;
    // TODO lekaving: add type
    gridProvider?: any;
    type?: any;
}

export const defaultConfig: FacetsConfig = {
    parentContext: null,
    service: null,
    searchForm: null,
    store: null
};
