/**
 * Created by Sergey Trizna on 27.12.2017.
 */
import {Inject, Injector} from '@angular/core';
import {SlickGridEventData} from '../../../../../modules/search/slick-grid/types';
import {MediaSlickGridProvider} from '../../../../media/providers/media.slick.grid.provider';
import { MediaInsideMappingComponent } from '../media.component';
import {SearchModel} from '../../../../../models/search/common/search';
import {Observable} from 'rxjs';
import {AdvancedCriteriaType} from '../../../../../modules/search/advanced/types';
import {AdvancedSearchModel} from '../../../../../models/search/common/advanced.search';

export class MediaInsideMappingSlickGridProvider extends MediaSlickGridProvider {
    private paramsStorageKeyMedia: string = 'associate.advanced_search.media.setups';

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    hookSearchModel(searchModel: SearchModel): Observable<SearchModel> {
        return new Observable((observer: any) => {
            const loadingMediaHandler = this.serverGroupStorageService.retrieve({
                global: [this.paramsStorageKeyMedia],
                local: [this.paramsStorageKeyMedia]
            });
            loadingMediaHandler.subscribe((res: any) => {
                if (!res.global[this.paramsStorageKeyMedia]) {
                    observer.complete();
                    return;
                }

                let groupIds = searchModel.getUniqueGroupIds();
                if (!groupIds.length) {
                    groupIds = [0]; // need for addAdvancedItem into groupIds.forEach
                }

                let advSetupsVersion = JSON.parse(res.global[this.paramsStorageKeyMedia] || null);
                if (advSetupsVersion && advSetupsVersion.forEach) {
                    advSetupsVersion.forEach((item: AdvancedCriteriaType, k) => {
                        //don't merge adv model
                        groupIds.forEach(el => {
                            let advModel = new AdvancedSearchModel();
                            advModel = advModel.fillByJSON(item);
                            advModel.setGroupId(el);
                            searchModel.addAdvancedItem(advModel);
                        });
                    });
                }

                observer.next(searchModel);

            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    afterRequestData(resp, searchModel) {
        super.afterRequestData(resp, searchModel);
        if ((<MediaInsideMappingComponent>this.config.componentContext).mediaFacetsService) {
            const searchFacetsProvider = (<MediaInsideMappingComponent>this.config.componentContext).store;
            let facets = resp.Facets && resp.Facets.Facets ? resp.Facets.Facets : [];
            let facetsInfo = resp.Facets && resp.Facets.FacetsInfo ? resp.Facets.FacetsInfo : '';
            searchFacetsProvider.newSearch(this.prevStateOfReset);
            searchFacetsProvider.setFacets(facets);
            searchFacetsProvider.setInfo(facetsInfo);
        }
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        let mappingComp = (<MediaInsideMappingComponent>this.config.componentContext).mappingComp;
        let msgp: any = mappingComp.slickGridComp.provider;
        if (rowId == null)
            this.setNullRow(suppressDataUpdated);
        else {
            msgp.setSelectedRow();
            this.getSlick().setSelectedRows([rowId]);
            this._selectedRowsIds = [rowId];
            this.setNotNullRow(eventData, suppressDataUpdated, rowId);
        }
    }

    setSelectedRows(rowIds: number[]) {
        this.getSlick().setSelectedRows(rowIds);
        this._selectedRowsIds = rowIds;
        this.onSelectRow.emit(rowIds);
        if (rowIds.length > 1) {
            this.onDataUpdated.emit(<SlickGridEventData>{
                row: null,
                cell: null,
            });
        } else if (rowIds.length == 1) {
            this.setSelectedRow(rowIds[0]);
        }

    }

    onRowChanged(_data?: SlickGridEventData): any {
        let data = _data;
        if (!_data) {
            data = this.lastData;
        }
        if (!data) {
            return;
        }

        this.lastData = data;
    }
}
