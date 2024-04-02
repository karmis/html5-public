/**
 * Created by Sergey Klimenko on 08.03.2017.
 */
import { Injectable } from '@angular/core';
import { HttpService } from '../../../../services/http/http.service';
import {Observable} from "rxjs";
import { SessionStorageService } from "ngx-webstorage";
import {
    AdvancedFieldsObjectTypes,
    AdvancedFieldsPreparedObjectType,
    AdvancedFieldType,
    AdvancedFullFieldsObjectTypes,
    AdvancedOperatorsObjectForSelect2Types,
    AdvancedRESTIdsForListOfFieldsTypes,
    AdvancedSearchEditorTypes,
    AdvancedSearchGroupRef,
    MediaSearch,
    MediaSearchTypes
} from '../types';
import { LookupsTypes } from '../../../../services/system.config/search.types';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { Select2ObjectTypes } from '../../../controls/select2/types';
import { map } from 'rxjs/operators';

/**
 * Search settings
 */
export interface SearchAdvancedServiceInterface {
    httpService: HttpService;
    sessionStorage: SessionStorageService;
    lookupService: LookupService;
    storagePrefix: string;
    // storagePrefixSavedSearches: string;

    /**
     * Return list of fields for current view with view name
     * @returns {Observable<AdvancedFieldsObjectTypes>}
     */
    getSearchInfo(id, clearCache?: boolean): Observable<AdvancedFullFieldsObjectTypes>;

    /**
     * Return prepared object contained list of fields and list of prepared fields for select2
     * @returns Observable<AdvancedFieldsPreparedObjectType>
     */
    getFields(
        id: AdvancedRESTIdsForListOfFieldsTypes,
        cacheClear?: boolean
    ): Observable<AdvancedFieldsPreparedObjectType>;

    /**
     * Return list of operators
     */
    getOperators(
        lookupId: LookupsTypes,
        cacheClear?: boolean
    ): Observable<AdvancedOperatorsObjectForSelect2Types>;

    /**
     * Return structure of query builder
     */
    getStructure(): Array<AdvancedSearchGroupRef>;
}
/**
 * Search Settings service
 */
@Injectable()
export class SearchAdvancedService implements SearchAdvancedServiceInterface {
    httpService: HttpService;
    sessionStorage: SessionStorageService;
    lookupService: LookupService;
    storagePrefix: string = 'advanced.search.criteria.data.';
    // storagePrefixSavedSearches = 'advanced.search.saved.searches.';

    constructor(_httpService: HttpService,
                _sessionStorage: SessionStorageService,
                _lookupService: LookupService) {
        this.httpService = _httpService;
        this.sessionStorage = _sessionStorage;
        this.lookupService = _lookupService;
    }


    /**
     * Return list of fields for current view with view name
     * @returns {Observable<AdvancedFieldsObjectTypes>}
     */
    getSearchInfo(
        id: AdvancedRESTIdsForListOfFieldsTypes,
        clearCache: boolean = false
    ): Observable<AdvancedFullFieldsObjectTypes> {
        let data = this.sessionStorage.retrieve(this.storagePrefix + id)||[];
        return new Observable((observer) => {
                if (!Object.keys(data).length || clearCache) {
                    this.httpService
                        .get(
                            '/api/view/searchinfo/' + id
                        )
                        .pipe(map((res:any) => res.body))
                        .subscribe(
                            (res) => {
                                this.sessionStorage.store(this.storagePrefix + id, res);
                                observer.next(res);
                            }, (err) => {
                                observer.error(err);
                            }, () => {
                                observer.complete();
                            });

                } else {
                    //toDo support async init
                    //to make observable asynchronous
                    // Promise.resolve()
                    //     .then(() => {
                            observer.next(data);
                            observer.complete();
                        // });
                }
            }
        );
    }

    /**
     * Return prepared object contained list of fields and list of prepared fields for select2
     * @returns Observable<AdvancedFieldsPreparedObjectType>
     */
    getFields(
        id: AdvancedRESTIdsForListOfFieldsTypes,
        cacheClear: boolean = false
    ): Observable<AdvancedFieldsPreparedObjectType> {
        return new Observable((observer) => {
            let storageKey = this.storagePrefix + 'preparedFields.' + id;
            const data = this.sessionStorage.retrieve(storageKey);
            if (!data || cacheClear) {
                this.getSearchInfo(id, cacheClear).subscribe((objectTypes: AdvancedFullFieldsObjectTypes) => {
                    let preparedFields: AdvancedFieldsPreparedObjectType = {
                        items: [],
                        props: {},
                    };
                    objectTypes.FieldNameAndType.forEach((field: AdvancedFieldType) => {
                        preparedFields.props[field.Name] = field;
                        preparedFields.items.push({
                            id: field.Name,
                            text: `${field.FriendlyName}`
                        });
                    });

                    this.sessionStorage.store(storageKey, preparedFields);

                    observer.next(preparedFields);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                        observer.next(data);
                        observer.complete();
                    // });
            }
        });
    }

    getSearchByFields(): Observable<MediaSearchTypes> {
        const data = this.sessionStorage.retrieve(this.storagePrefix + 'SearchByFields');
        return new Observable((observer) => {
                if (!data) {
                    this.httpService
                        .get(
                            '/api/config/searchfields'
                        )
                        .pipe(map((res:any) => res.body))
                        .subscribe(
                            (res: MediaSearchTypes) => {
                                for (const key in res) {
                                    res[key] = res[key].map(item => ({
                                        id: item.Field,
                                        text: item.Label,
                                        isDefault: item.IsDefault
                                    }));
                                }

                                this.sessionStorage.store(this.storagePrefix + 'SearchByFields', res);
                                observer.next(res);
                            }, (err) => {
                                observer.error(err);
                            }, () => {
                                observer.complete();
                            });

                } else {
                    //toDo support async init
                    //to make observable asynchronous
                    // Promise.resolve()
                    //     .then(() => {
                    observer.next(data);
                    observer.complete();
                    // });
                }
            }
        );
    }

    /**
     * Get operators
     */
    getOperators(
        lookupId: LookupsTypes,
        cacheClear: boolean = false
    ): Observable<AdvancedOperatorsObjectForSelect2Types> {
        return Observable.create((observer) => {
            let storageKey = this.storagePrefix + 'preparedOperators.' + lookupId;
            let data = this.sessionStorage.retrieve(storageKey);
            if (!data || cacheClear) {
                this.lookupService.getLookups(lookupId)
                    .subscribe(
                        (operators: any) => {
                            let select2Operators: Select2ObjectTypes = {};
                            $.each(
                                operators,
                                (name: AdvancedSearchEditorTypes, _operators: Array<string>) => {
                                _operators.forEach((operator: string, k: number) => {
                                    if (!select2Operators[name]) {
                                        select2Operators[name] = [];
                                    }

                                    select2Operators[name].push({
                                        id: k,
                                        text: operator
                                    });
                                });
                            });

                            this.sessionStorage.store(storageKey, select2Operators);
                            observer.next(select2Operators);
                        }, (error: any) => {
                            observer.error(error);
                            console.error('Failed', error);
                        }, () => {
                            observer.complete();
                        }
                    );
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                        observer.next(data);
                        observer.complete();
                    // });
            }
        });
    }

    /**
     * Return structure of query builder
     * @returns {AdvancedSearchGroupRef[]}
     */
    getStructure(): Array<AdvancedSearchGroupRef> {
        let arrOfStruct: Array<AdvancedSearchGroupRef> = [
            {
                id: 0,
                mode: 'example',
                criterias: [
                    {
                        selectedField: 'OWNERS_text',
                        selectedOperator: '=',
                        // value: {value:''}
                    },
                    {
                        selectedField: 'CREATED_DT',
                        selectedOperator: '>',
                        // value: {value:''}
                    },
                    {
                        selectedField: 'CREATED_DT',
                        selectedOperator: '<',
                        // value: {value:''}
                    },
                    {
                        selectedField: 'CC_FLAG_text',
                        selectedOperator: '<',
                        // value: {value:''}
                    }
                ]
            }
        ];

        return arrOfStruct;

        // clone array
        // return tmpAtr.slice(0);



        // let arr = [
        //     {
        //         'id': 0,
        //         'criterias': [
        //             {
        //                 'id': 0,
        //                 'data': {
        //                     'name': 'TITLE',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MIID2',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'PROGID1',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'VERSIONID1',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'SCHEMAIDx',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'XmlFields',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'USAGE_TYPE_text',
        //                     'lookupType': 'UsageTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ITEM_TYPE_text',
        //                     'lookupType': 'ItemTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'CTNR_FORMAT',
        //                     'lookupType': 'CtnrFormats',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MEDIA_TYPE_text',
        //                     'lookupType': 'MediaTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ATTACHMENT_TEXT',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MIID1',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'TV_STD_text',
        //                     'lookupType': 'TvStandards',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'CREATED_DT',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ITEM_FORMAT_TYPE_TEXT',
        //                     'lookupType': 'ItemFormats',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ID',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'CREATED_BY',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Users',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'BARCODE',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'FILENAME',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MEDIA_FORMAT_text',
        //                     'lookupType': 'MediaFileTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'STORAGE_ID',
        //                     'lookupType': 'Devices',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'SCHEMAIDx',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'XmlFields',
        //                     'value': ''
        //                 }
        //             }
        //         ]
        //     }
        // ];
        // let _tmpArr = [
        //     {
        //         'id': 0,
        //         'criterias': [
        //             {
        //                 'id': 0,
        //                 'data': {
        //                     'name': 'TITLE',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MIID2',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'PROGID1',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'VERSIONID1',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'SCHEMAIDx',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'XmlFields',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'USAGE_TYPE_text',
        //                     'lookupType': 'UsageTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ITEM_TYPE_text',
        //                     'lookupType': 'ItemTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'CTNR_FORMAT',
        //                     'lookupType': 'CtnrFormats',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MEDIA_TYPE_text',
        //                     'lookupType': 'MediaTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ATTACHMENT_TEXT',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MIID1',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'TV_STD_text',
        //                     'lookupType': 'TvStandards',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'CREATED_DT',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ITEM_FORMAT_TYPE_TEXT',
        //                     'lookupType': 'ItemFormats',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'ID',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'CREATED_BY',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Users',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'BARCODE',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'FILENAME',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'MEDIA_FORMAT_text',
        //                     'lookupType': 'MediaFileTypes',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'STORAGE_ID',
        //                     'lookupType': 'Devices',
        //                     'lookupSearchType': 'Empty',
        //                     'value': ''
        //                 }
        //             },
        //             {
        //                 'id': 1,
        //                 'data': {
        //                     'name': 'SCHEMAIDx',
        //                     'lookupType': 'Empty',
        //                     'lookupSearchType': 'XmlFields',
        //                     'value': ''
        //                 }
        //             }
        //         ]
        //     }
        // ];
    }

    /**
     * Return structure of query builder
     * @returns {AdvancedSearchGroupRef[]}
     */
    getStructureForProdMI(): Array<AdvancedSearchGroupRef> {
        let arrOfStruct: Array<AdvancedSearchGroupRef> = [
            {
                id: 0,
                mode: 'builder',
                criterias: [
                    {
                        selectedField: 'StatusText',
                        selectedOperator: '=',
                        value: {value:'1'}
                    },
                    {
                        selectedField: 'HASCHECKS',
                        selectedOperator: '=',
                        value: {value: 'true'}
                    }
                ]
            }
        ];

        return arrOfStruct;
    }
}
