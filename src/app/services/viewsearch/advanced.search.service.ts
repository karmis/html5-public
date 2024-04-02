/**
 * Created by initr on 29.11.2016.
 */
import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import {Observable} from "rxjs";
import {SessionStorageService} from "ngx-webstorage";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
/**
 * Advanced search service
 */

@Injectable()
export class AdvancedSearch {
    private storagePrefix = 'advanced.search.criteria.data.';

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {
    }

    /**
     * id: 'Media'
     * @returns {Observable<R>}
     */
    getSearchInfo(id): Observable<HttpResponse<any>> {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if(lang) {
          lang = lang.replace(/"/g,"");
        }
        let data = this.sessionStorage.retrieve(this.storagePrefix + id);
        return new Observable((observer: any) => {
                if (!data) {
                    this.httpService
                        .get(
                            "/api/view/searchinfo/" + id + "?lang=" + lang
                        )
                        .pipe(map((res:any) => res.body))
                        .subscribe(
                            (res: any) => {
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
     * @returns {Observable<R>}
     */
    getQueueManagerServices(): Observable<any> {
        return this.httpService
                .get(
                    '/api/lookup/AutomatedTasksTypes'
                )
                .pipe(map((res:any) => res.body));
    }

    /**
     * Prepare values for list with field names
     * @param fields
     * @returns {{fields: Array, columns: Array}}
     */
    public prepareItemsForCriteriaSelect(fields): {fields:Array<Object>, fieldsProps:Array<Object>}{
        let resp = {
            fields: [],
            fieldsProps: [],
        };

        fields.forEach((field: {
            FriendlyName: string,
            LookupSearchType: number,
            LookupType: number,
            Name: string,
            Parameter: number,
            SearchEditorType: string
        }) => {

            resp.fieldsProps[field.Name] = {
                friendlyName: field.FriendlyName,
                lookupSearchType: field.LookupSearchType,
                lookupType: field.LookupType,
                name: field.Name,
                parameter: field.Parameter,
                searchEditorType: field.SearchEditorType
            };
            resp.fields.push({
                id: field.Name,
                text: `${field.FriendlyName}`
            });
        });

        return resp;
    }

    /**
     * Return structure of query builder
     * @returns Object
     */
    getParamsForExample(): Array<Object> {
        let arr =  [
            {
                "id": 0,
                "criterias": [
                    {
                        "id": 0,
                        "data": {
                            "name": "TITLE",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "MIID2",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "PROGID1",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "VERSIONID1",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "SCHEMAIDx",
                            "lookupType": "Empty",
                            "lookupSearchType": "XmlFields",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "USAGE_TYPE_text",
                            "lookupType": "UsageTypes",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "ITEM_TYPE_text",
                            "lookupType": "ItemTypes",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "CTNR_FORMAT",
                            "lookupType": "CtnrFormats",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "MEDIA_TYPE_text",
                            "lookupType": "MediaTypes",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "ATTACHMENT_TEXT",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "MIID1",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "TV_STD_text",
                            "lookupType": "TvStandards",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "CREATED_DT",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "ITEM_FORMAT_TYPE_TEXT",
                            "lookupType": "ItemFormats",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "ID",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "CREATED_BY",
                            "lookupType": "Empty",
                            "lookupSearchType": "Users",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "BARCODE",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "FILENAME",
                            "lookupType": "Empty",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "MEDIA_FORMAT_text",
                            "lookupType": "MediaFileTypes",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "STORAGE_ID",
                            "lookupType": "Devices",
                            "lookupSearchType": "Empty",
                            "value": ""
                        }
                    },
                    {
                        "id": 1,
                        "data": {
                            "name": "SCHEMAIDx",
                            "lookupType": "Empty",
                            "lookupSearchType": "XmlFields",
                            "value": ""
                        }
                    }
                ]
            }
        ];

        // clone array
        return arr.slice(0);
    }
}


