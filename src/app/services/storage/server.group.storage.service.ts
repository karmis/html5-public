import { Inject, Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type LocalGlobalKeysStorageService = {
    local?: Array<number | string>
    global?: Array<number | string>
}


export type GroupStorageResponse = {
    local?: any;
    global?: any;
}

@Injectable()
export class ServerGroupStorageService {
    // override
    protected storagePrefix: string = 'config.user.group.preferences';
    // override
    protected storageUrl: string = '/api/user-group-preferences';
    // override
    protected separator: string = ',';

    constructor(@Inject(HttpService) public httpService: HttpService,
                @Inject(SessionStorageService) public sessionStorageService: SessionStorageService,
                @Inject(LocalStorageService) public localStorageService: LocalStorageService) {
        // super(httpService, sessionStorageService, localStorageService);
    }

    retrieve(
        keys: LocalGlobalKeysStorageService = {local: [], global: []},
        cacheClear: boolean = false,
        max: number = 0,
        type: 'session' | 'local' = 'session'): Observable<GroupStorageResponse> {
        return new Observable((observer: any) => {
            if (cacheClear) {
                this._fetchKeys(keys, type).subscribe((resp) => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                let res: GroupStorageResponse = {};
                if (keys.global && keys.global.length > 0) {
                    res.global = this.getExists(keys.global, max, type);
                }
                if (keys.local && keys.local.length > 0) {
                    res.local = this.getExists(keys.local, max, type);
                }

                //TODO add check, if key not exist in store try get from server (done)
                if ((keys.global && (!res.global || this.isAnyEmptyVal(res.global))) || (keys.local && (!res.local || this.isAnyEmptyVal(res.local)))) {
                    this._fetchKeys(keys).subscribe((resp) => {
                        observer.next(resp);
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
                    observer.next(res);
                    observer.complete();
                    // });
                }
            }
        });
    }

    protected _fetchKeys(
        _keys: LocalGlobalKeysStorageService = {local: [], global: []},
        type: 'session' | 'local' = 'session'): Observable<GroupStorageResponse> {
        const keys = (<LocalGlobalKeysStorageService>_keys);
        return new Observable((observer: any) => {
            let uri = '';
            let localUri;
            let globalUri;
            if (keys.global && keys.global.length > 0) {
                globalUri = keys.global.join(this.separator);
            }
            if (keys.local && keys.local.length > 0) {
                localUri = keys.local.join(this.separator);
            }
            if (localUri) {
                uri += '?keys=' + localUri;
            }
            if (globalUri) {
                let concat = localUri ? '&' : '?';
                uri += concat + 'globals=' + globalUri;
            }
            const storageService = type === 'session' ? this.sessionStorageService : this.localStorageService;
            this.httpService
                .get(this.storageUrl + uri)
                .pipe(map((response: any) => {
                    return response.body;
                }))
                .subscribe(
                    (data: { Key: string, Value: string }[]) => {
                        let res: GroupStorageResponse = {
                            global: {},
                            local: {}
                        };

                        const uniqueKeys = Array.from(new Set(data.map(el => el.Key)));
                        for (let key of uniqueKeys) {
                            let resSettings;
                            const arr = data.filter(el => el.Key == key);
                            if (arr.length == 2) {
                                // resSettings = $.extend(true, {}, arr[1], arr[0]).Value;
                                resSettings = this.getMergeSettings(arr);
                            } else if (arr.length == 1) {
                                resSettings = arr[0].Value;
                            }

                            if (key === 'default_page') {
                                this.localStorageService.store(this.storagePrefix + "." + key, resSettings);
                            } else {
                                storageService.store(this.storagePrefix + "." + key, resSettings);
                            }

                            if (keys.global && keys.global.indexOf(key) > -1) {
                                if (!res.global) {
                                    res.global = {};
                                }
                                res.global[key] = resSettings;
                            } else {
                                if (!res.local) {
                                    res.local = {};
                                }
                                res.local[key] = resSettings;
                            }
                        }

                        observer.next(res);
                    }, (error) => {
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    });
        });
    }

    private isAnyEmptyVal(res) {
        const arrOfVals = (window as any).Object.values(res);
        return arrOfVals.indexOf(null) > -1 || arrOfVals.indexOf(undefined) > -1
    }

    private getMergeSettings(arr: Array<any>) {
        let result;

        if (!Array.isArray(arr) || arr.length == 0) {
            return;
        }

        const mappedArr = arr.map(el => JSON.parse(el.Value || null)).reverse();

        if (typeof mappedArr[0] === 'object') {
            const targetLit = (Array.isArray(mappedArr[0])) ? [] : {};

            result = $.extend(
                true,
                targetLit,
                ...mappedArr
            );
        } else {
            result = mappedArr[mappedArr.length - 1];
        }
        result = JSON.stringify(result);

        return result;
    }

    private getExists(keys: Array<string | number>, max: number, type: 'session' | 'local' = 'session') {
        let response = {};
        let checkExist = true;
        $.each(keys, (i: any, k) => {
            if (max > 0 && i > max - 1) {
                return false;
            }
            let storageService = type === 'session' ? this.sessionStorageService : this.localStorageService;
            response[k] = storageService.retrieve(this.storagePrefix + '.' + k);
            if (response[k] == null) {
                checkExist = false;
            }
        });

        return response;
    }

}
