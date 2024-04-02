/**
 * Created by initr on 16.12.2016.
 */
import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import {SessionStorageService} from "ngx-webstorage";
import {forkJoin, Observable} from 'rxjs';
import {LookupsTypes} from '../system.config/search.types';
import {Select2ConvertObject, Select2ItemType} from '../../modules/controls/select2/types';
import {map} from 'rxjs/operators';
import {ArrayProvider} from '../../providers/common/array.provider';
import {IMFXControlsLookupsSelect2Component} from '../../modules/controls/select2/imfx.select2.lookups';

export type LookupReturnTypeForSelect2 = {
    sourceData: any[],
    select2Items: Select2ItemType[]
}

@Injectable()
export class LookupService {
    // private lookUps = {
    //     '14': ['FriendlyNames.TM_MIS',
    //         'FriendlyNames.TM_PG_RL'],
    //     '5': ['SearchSupportedOperators'],
    //     '10': ['AfdTypes'],
    //     '9': ['AspectRatioTypes']
    public customStandardToString: Function = null;
    protected standartObject = {
        id: '',
        text: ''
    };
    // }
    private prefixStorage = "lookups.";
    private prefixSelect2Storage = "select2-lookups.";

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService,
                private arrayProvider: ArrayProvider) {
    }

    public getLookups(id: LookupsTypes, lookupUrl = '/api/lookups/'): Observable<any> {
        let data = this.sessionStorage.retrieve(this.prefixStorage + id);
        return new Observable((observer: any) => {
                // if (true) {
                if (!data) {
                    let lookup = id.split('.')[0];
                    this.httpService.get(lookupUrl + lookup)
                        .pipe(map((res: any) => res.body))
                        .subscribe(
                            (res: any) => {
                                if (!Array.isArray(res)) {
                                    let path = id.split('.');
                                    let d = res;
                                    for (let i in path) {
                                        d = d[path[i]];
                                    }
                                    this.sessionStorage.store(this.prefixStorage + id, d);
                                    observer.next(d);
                                } else {
                                    this.sessionStorage.store(this.prefixStorage + id, res);
                                    observer.next(res);
                                }

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
    };

    /**
     *
     * @param id
     * @param lookupUrl
     * @param lookupGetParams
     * @param context
     * @returns {any}
     */
    public getLookupForSelect2Controls(id: LookupsTypes, lookupUrl = '/api/lookups/', lookupGetParams = '', context?: any /*UploadRemoteComponent*/): Observable<LookupReturnTypeForSelect2> {
        return new Observable((observer: any) => {
                let idParams = lookupGetParams.replace(/[?&=]/g, '.'); //take into account potential get-params
                let select2Data: any[] = this.sessionStorage.retrieve(this.prefixSelect2Storage + id + idParams);
                let data: any[] = this.sessionStorage.retrieve(this.prefixStorage + id + idParams);
                if (data && select2Data) {
                    observer.next({
                        sourceData: data,
                        select2Items: select2Data
                    });
                    observer.complete();
                    return;
                }
                if (!data) {
                    let lookup = id.split('.')[0];
                    this.httpService.get(lookupUrl + lookup + lookupGetParams)
                        .pipe(map((res: any) => res.body))
                        .subscribe(
                            (res: any) => {
                                if (!Array.isArray(res)) {
                                    let path = id.split('.');
                                    let d = res;
                                    for (let i in path) {
                                        d = d[path[i]];
                                    }
                                    observer.next({
                                        sourceData: d,
                                        select2Items: this._getLookupForSelect2Controls(d, id, idParams, context)
                                    });
                                } else {
                                    observer.next({
                                        sourceData: res,
                                        select2Items: this._getLookupForSelect2Controls(res, id, idParams, context)
                                    });
                                }

                            }, (err) => {
                                observer.error(err);
                            }, () => {
                                observer.complete();
                            });

                } else if (!select2Data && data) {
                    //toDo support async init
                    observer.next({
                        sourceData: data,
                        select2Items: this._getLookupForSelect2Controls(data, id, idParams, context)
                    });
                    observer.complete();
                    // });
                }
            }
        );
    };

    getLookupsAsync(ids: Array<LookupsTypes>) {
        let req = [];
        let resData = [];
        let _ids = [];
        for (let el of ids) {
            let data = this.sessionStorage.retrieve(this.prefixStorage + el);
            if (!data) {
                let lookup = el.split('.')[0];
                _ids.push(el);
                req.push(
                    this.httpService.get('/api/lookups/' + lookup)
                        .pipe(map((res: any) => res.body))
                );
            } else {
                resData.push(data);
            }
        }
        return new Observable((observer: any) => {
            if (req.length !== 0) {
                forkJoin(req).subscribe(
                    (res: any) => {
                        for (let i in res) {
                            let path = _ids[i].split('.');
                            let d = res[i];
                            for (let j in path) {
                                d = d[path[j]];
                            }
                            this.sessionStorage.store(this.prefixStorage + _ids[i], d);
                            resData.splice(ids.indexOf(_ids[i]), 0, d);
                        }
                        observer.next(resData);
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
                observer.next(resData);
                observer.complete();
                // });
            }
        });
    };

    public getLookupRuleForConvertToSelect2Item(type: LookupsTypes): Select2ConvertObject {
        let conv: Select2ConvertObject;
        // if(type.indexOf('custommediastatus') > -1) {
        //     type = 'custommediastatus'
        // }
        switch (type) {
            case 'Devices':
                conv = {
                    key: 'Id',
                    text: 'DvCode',
                };
                break;
            case 'CtnrFormats':
                conv = {
                    key: 'Id',
                    text: 'Name',
                };
                break;
            case 'ItemFormats':
                conv = {
                    key: 'Id',
                    text: 'Name',
                };
                break;
            case 'MediaFileTypes':
                conv = {
                    key: 'Id',
                    text: 'Name',
                };
                break;
            case 'Languages':
                conv = {
                    key: 'Id',
                    text: 'Value'
                };
                break;
            case 'AgeCertification':
                conv = {
                    key: 'Id',
                    text: 'Value'
                };
                break;
            case 'AudioMsTypes':
                conv = {
                    key: 'Id',
                    text: 'Value'
                };
                break;
            case 'AudioContentTypes':
                conv = {
                    key: 'Id',
                    text: 'Value'
                };
                break;
            case 'Countries':
                conv = {
                    key: 'Id',
                    text: 'Value'
                };
                break;
            case 'MediaEventTypes':
                conv = {
                    key: 'ID',
                    text: 'NAME'
                };
                break;
            case 'SegmentTypes':
                conv = {
                    key: 'ID',
                    text: 'NAME'
                };
                break;
            case 'order-presets':
                conv = {
                    key: 'Id',
                    text: 'Name'
                };
                break;
            default:
                conv = {
                    key: 'ID',
                    text: 'Name'
                };
        }

        return conv;
    }


    private _getLookupForSelect2Controls(lookups: any[], lookupType: LookupsTypes, lookupGetParams = '', context: IMFXControlsLookupsSelect2Component): Select2ItemType[] {
        const rule: Select2ConvertObject = this.getLookupRuleForConvertToSelect2Item(lookupType);
        const items: Select2ItemType[] = this.arrayProvider.turnObjectOfObjectToStandard(context && context.filterResult ? context.filterResult(lookups, context) : lookups, rule);
        this.sessionStorage.store(this.prefixSelect2Storage + lookupType + lookupGetParams, items);
        this.sessionStorage.store(this.prefixStorage + lookupType + lookupGetParams, lookups);
        return items;
    }
}
