import { map } from 'rxjs/operators';
/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import { Inject, Injectable, Injector } from '@angular/core';
import { HttpService } from '../../../../services/http/http.service';
import { Observable } from 'rxjs';
import { SearchModel } from '../../../../models/search/common/search';
import { CoreService } from '../../../../core/core.service';
import { FinalSearchRequestType, SlickGridResp } from "../types";
import { ServerGroupStorageService } from '../../../../services/storage/server.group.storage.service';
import { ColumnsOrderService } from '../../columns-order/services/columns.order.service';
import { ProfileService } from '../../../../services/profile/profile.service';
import { AscDescType } from '../../columns-order/columns.order';

export type ColumnOrderSetupsType = {
    context: any /*CoreSearchComponent| ComponentRef<any>*/,
    field: string
}

/**
 * Grid search service
 */
@Injectable()
export class SlickGridService extends CoreService {
    protected extendedColumns: Array<any>;
    protected facetsFieldOverrideList: Array<any>;
    protected sessionStorage: ServerGroupStorageService;
    private columnsOrderPrefix: string = 'columns.order.'; /* ColumnOrderPrefixConst */
    private gridProperties: string[] = [
        'searchGridConfig',
        'associatedMediaGridConfig'
    ]
    // private columnsOrderMap: any = {
    //     ''
    // }
    // private searchTypesForOrderColumns: { [key: string]: string } = {
    //     'versions': 'setting.adv.associate.column.order.version.',
    //     'media': 'setting.adv.associate.column.order.media.',
    // }

    constructor(
        @Inject(HttpService) public httpService: HttpService,
        @Inject(Injector) public injector?: Injector,
        // public sfp?: SearchFormProvider
    ) {
        super(httpService);
        if (injector) {
            this.sessionStorage = this.injector.get(ServerGroupStorageService);
        }
    }

    /**
     * Search by parameters
     * @param searchType - search type as part of url
     * @param searchModel - model with data for search
     * @param page - page number
     * @param sortField - sort type for fields (asc or desc)
     * @param sortDirection sort type for direction (asc or desc)
     * @param url - custom uri for request
     * @param extColumns - extendedColumns
     * @param colOrderSetups
     * @returns {Observable<SlickGridResp>}
     */
    search(searchType: string,
           searchModel: SearchModel,
           page: number,
           sortField?: string,
           sortDirection?: string,
           url?: string, extColumns?: string[],
           colOrderSetups?: ColumnOrderSetupsType): Observable<SlickGridResp> {
        const _url = !url ? '/api/v3/search/' + searchType : url;
        let reqsData = this.getParamsForSearch(
            searchModel,
            page,
            sortField || null,
            sortDirection || null,
            searchType
        );

        if (searchModel.hasSpecialFields() && searchModel.hasCritsFromSuggestion()) {
            reqsData.Text = '';
        }

        if (extColumns && extColumns.length > 0) {
            reqsData['ExtendedColumns'] = extColumns;
        }

        reqsData['DefaultSearchColumns'] = this.getDefaultColumns(searchType);
        if (colOrderSetups && colOrderSetups.context[colOrderSetups.field] && !(sortField && sortDirection)) {
            const prefix = colOrderSetups.context[colOrderSetups.field].options.module.columnsOrderPrefix;
            if (!prefix) {
                return new Observable((observer) => {
                    this.processSearch(_url, reqsData, observer)
                });
            }
            // const colService = this.injector.get(ServerGroupStorageService);
            const profileService = this.injector.get(ProfileService);
            return new Observable((observer) => {
                    this.sessionStorage.retrieve({local: [prefix]}, true).subscribe((res: { [key: string]: AscDescType }) => {
                        const orderString = res.local[prefix];
                        if (!orderString) {
                            return this.processSearch(_url, reqsData, observer);
                        } else {
                            const orderJSON = JSON.parse(orderString);
                            if(!orderJSON) {
                                return this.processSearch(_url, reqsData, observer);
                            }
                            const orderArr = Object.keys(orderJSON);
                            reqsData['SortField'] = orderArr[0];
                            reqsData['SortDirection'] = orderJSON[orderArr[0]];
                            return this.httpService
                                .post(
                                    _url,
                                    JSON.stringify(reqsData),
                                    {},
                                    {},
                                    false
                                ).pipe(
                                    map((resp: any) => {
                                        return resp.body
                                    })).subscribe((rows) => {
                                    observer.next(rows)
                                    observer.complete()
                                }, (err) => {
                                    observer.error(err);
                                    observer.complete();
                                });
                        }
                    });
                });
            // this.colService.retrieve() // groupId
        } else {
            return new Observable((observer) => {
                this.processSearch(_url, reqsData, observer)
            });
        }

    }

    getParamsForSearch(
        searchModel: SearchModel,
        page?,
        sortFieldVal?,
        sortDirectionVal?,
        searchType?
    ): FinalSearchRequestType {
        let _sortDirection = sortDirectionVal ? sortDirectionVal : 'desc';
        let _sortFieldVal = sortFieldVal ? sortFieldVal : '';
        let _page = page ? page : 1;
        const json = Object.assign(searchModel._toJSON(), {
            'Page': _page,
            'SortField': _sortFieldVal,
            'SortDirection': _sortDirection,
            'ExtendedColumns': this.extendedColumns,
            'FacetsFieldOverrideList': this.facetsFieldOverrideList,
        });
        json['DefaultSearchColumns'] = this.getDefaultColumns(searchType);
        delete json.fromSuggestion;
        return json;
    }

    setFacetsFieldOverride(facetsFieldOverrideList): void {
        this.facetsFieldOverrideList = facetsFieldOverrideList;
    }

    getFacetsFieldOverride(): any[] {
        return this.facetsFieldOverrideList;
    }

    /**
     *
     * @param extendedColumns
     */
    setExtendsColumns(extendedColumns): void {
        this.extendedColumns = extendedColumns;
    }

    getExtendsColumns(): any[] {
        return this.extendedColumns;
    }

    protected getDefaultColumns(searchType): string[] {
        let res = [];
        if (searchType == "Media") {
            this.sessionStorage.retrieve({local: ['defaultSearchColumnsMedia']}).subscribe((setups) => {
                if (setups && setups.local && setups.local.defaultSearchColumnsMedia) {
                    res = JSON.parse(setups.local.defaultSearchColumnsMedia) || [];
                }
            });
        } else if (searchType == "versions") {
            this.sessionStorage.retrieve({local: ['defaultSearchColumnsVersion']}).subscribe((setups) => {
                if (setups && setups.local && setups.local.defaultSearchColumnsVersion) {
                    res = JSON.parse(setups.local.defaultSearchColumnsVersion) || [];
                }
            });
        } else if (searchType == "title") {
            this.sessionStorage.retrieve({local: ['defaultSearchColumnsTitle']}).subscribe((setups) => {
                if (setups && setups.local && setups.local.defaultSearchColumnsTitle) {
                    res = JSON.parse(setups.local.defaultSearchColumnsTitle) || [];
                }
            });
        }

        return res;
    }

    private processSearch(_url, reqsData, observer) {
        return this.httpService
            .post(
                _url,
                JSON.stringify(reqsData),
                {},
                {},
                false
            ).pipe(
                map((resp: any) => {
                    return resp.body;
                })).subscribe((rows) => {
                observer.next(rows)
                observer.complete()
            }, (err) => {
                observer.error(err);
                observer.complete();
            });
    }
}
