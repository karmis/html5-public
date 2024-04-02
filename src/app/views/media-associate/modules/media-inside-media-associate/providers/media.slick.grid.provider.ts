/**
 * Created by Sergey Trizna on 27.12.2017.
 */
import {Inject, Injector} from '@angular/core';
import {SlickGridEventData} from '../../../../../modules/search/slick-grid/types';
import {MediaSlickGridProvider} from '../../../../media/providers/media.slick.grid.provider';
import {MediaInsideMediaAssociateComponent} from '../media.component';
import {SearchModel} from '../../../../../models/search/common/search';
import {Observable} from 'rxjs';
import {AdvancedCriteriaType} from '../../../../../modules/search/advanced/types';
import {AdvancedSearchModel} from '../../../../../models/search/common/advanced.search';

export class MediaInsideMediaAssociateSlickGridProvider extends MediaSlickGridProvider {
    private paramsStorageKeyMedia: string = 'associate_media.advanced_search.media.setups';
    private globalData: any;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    hookSearchModel(searchModel: SearchModel): Observable<SearchModel> {
        return Observable.create((observer) => {
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
    }

    setSelectedRow(rowId: number = null, eventData?, suppressDataUpdated: boolean = false) {
        let mediaComp = (<MediaInsideMediaAssociateComponent>this.config.componentContext).mediaComp;
        let msgp: any = mediaComp.slickGridComp.provider;
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
        let mediaComp = (<MediaInsideMediaAssociateComponent>this.config.componentContext).mediaComp;
        this.getSlick().setSelectedRows(rowIds);
        this._selectedRowsIds = rowIds;
        // setTimeout(() => {
        this.onSelectRow.emit(rowIds);
        // })
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

    private getSetting(key) {
        if (this.globalData.TM_SETTINGS_KEYS) {
            return this.globalData.TM_SETTINGS_KEYS.filter(el => el.KEY == key)[0]
        }
    }
}
