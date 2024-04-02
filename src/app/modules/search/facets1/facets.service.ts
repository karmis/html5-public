import {Injectable} from "@angular/core";
import {FacetsStore} from './store/facets.store';
import {SearchModel} from '../../../models/search/common/search';
import {SlickGridProvider} from '../slick-grid/providers/slick.grid.provider';
import {ConsumerSearchComponent} from '../../../views/consumer/consumer.search.component';
import {MediaInsideMappingComponent} from "../../../views/mapping/modules/media-inside-mapping/media.component";
import {MappingSlickGridProvider} from "../../../views/mapping/providers/mapping.slick.grid.provider";

@Injectable()
export class FacetsService {
    moduleContext = null;
    parentContext = null;
    facetStore: FacetsStore;
    gridProvider: SlickGridProvider;

    constructor() {
        // debugger;
        // console.log('Facets.Service Init');
    }

    private _isOpenFacets = false;
    set isOpenFacets(val: boolean) {
        this._isOpenFacets = val;
    }

    get isOpenFacets(): boolean {
        return this._isOpenFacets;
    }

    toggleFacetsPage(toggle?: boolean) {
        this.isOpenFacets = typeof toggle === 'undefined' ? !this.isOpenFacets : toggle;
    }

    // TODO lekaving: legacy code
    getIsReady(): boolean {
        return (this.moduleContext) ? this.moduleContext.isReady : false;
    }

    init() {
        this.facetStore.searchModel$.subscribe((model: SearchModel) => {
            if (this.parentContext instanceof ConsumerSearchComponent) {
                this.parentContext['csp'].getConsumerSearchType().model = model;
                this.parentContext.doSearch();
            } else if(this.moduleContext.config.gridProvider instanceof MappingSlickGridProvider) {
                const tempModel = this.parentContext.searchFormProvider.getModel();
                tempModel['_advanced'].push(...model['_advanced']);
                const provider = !!this.gridProvider ? this.gridProvider : this.parentContext.slickGridComp.provider;
                provider.PagerProvider.setPage(1, false);
                provider.buildPage(tempModel);
            } else if(this.parentContext.mediaInsideMapping instanceof MediaInsideMappingComponent) {
                const tempModel = this.parentContext.mediaInsideMapping.searchFormProvider.getModel();
                tempModel['_advanced'].push(...model['_advanced']);
                const provider = !!this.gridProvider ? this.gridProvider : this.parentContext.slickGridComp.provider;
                provider.PagerProvider.setPage(1, false);
                provider.buildPage(tempModel);
            } else {
                const provider = !!this.gridProvider ? this.gridProvider : this.parentContext.slickGridComp.provider;
                provider.PagerProvider.setPage(1, false);
                provider.buildPage(model);
            }
        });
    }
}
