/**
 * Created by Sergey Trizna on 14.06.2017.
 */
import { Inject, Injectable } from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { HttpService } from "../http/http.service";
import { Observable, Subscription } from "rxjs";
import { map } from 'rxjs/operators';

// let hash = require('object-hash');
// let hashed = hash(data);
// let keyAndHash = key+'.'+hashed;
@Injectable()
export class ServerStorageService {
    // public httpService;
    protected storagePrefix: string = 'config.user.preferences';
    protected storageUrl: string = '/api/user-preferences';
    protected separator: string = ';';

    constructor(@Inject(HttpService) public httpService: HttpService,
                @Inject(SessionStorageService) public sessionStorageService: SessionStorageService,
                @Inject(LocalStorageService) public localStorageService: LocalStorageService) {
    }

    keys(cacheClear: boolean = false): Observable<Subscription> {
        let data;
        return new Observable((observer: any) => {
            if (cacheClear) {
                this._fetchKeys([]).subscribe((resp) => {
                    observer.next(resp);
                    observer.complete();
                },(err) => {
                    observer.error(err);
                });
            } else {
                data = this.sessionStorageService.retrieve(this.storagePrefix);
                if (data == null) {
                    this._fetchKeys([]).subscribe((data) => {
                        observer.next(data);
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
        });
    }

    retrieve(
        _keys: Array<number | string>,
        cacheClear: boolean = false,
        max:number = 0,
        type: 'session' | 'local' = 'session'): Observable<{ Key: string, Value: string }[]> {
        const keys = (<Array<number | string>>_keys);
        return new Observable((observer: any) => {
            if (cacheClear) {
                this._fetchKeys(keys).subscribe((resp) => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                let response = [];
                let checkExist = true;
                const storageService = type === 'session' ? this.sessionStorageService : this.localStorageService;
                $.each(keys, (i, k) => { // @TODO math operation to potential string
                    if (max > 0 && i > max - 1) {
                        return false;
                    }

                    const res = storageService.retrieve(this.storagePrefix + '.' + k);
                    response.push({
                        Key: k,
                        Value: res
                    });

                    if (res == null) {
                        checkExist = false;
                    }
                });
                //TODO add check, if key not exist in store try get from server
                if (!checkExist) {
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
                            observer.next(response);
                            observer.complete();
                        // });
                }
            }
        });
    }

    clear(key: string | number): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.store(key, null).subscribe(() => {
                observer.next(true);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    store(key: string | number | Array<string | number>, data: any, type: 'session' | 'local' = 'session'): Observable<Subscription> {
        let self = this;
        return new Observable((observer: any) => {
            self.httpService
                .post(
                    this.storageUrl,
                    [{Key: key, Value: JSON.stringify(data)}], // incorrect type (object instead of string)
                )
                .pipe(map((response: any) => {
                    return response;
                }))
                .subscribe(
                    () => {
                        let storageService = type === 'session' ? self.sessionStorageService : self.localStorageService;
                        storageService.store(self.storagePrefix + '.' + key, data);
                        observer.next(data);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
        });
    }

    add(key: string | number, data, max = 0): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.retrieve([key], true).subscribe((exists) => {
                let newValue = (exists[0] && exists[0].Value) ? JSON.parse(exists[0].Value) : [];
                if(newValue !== null){
                    if (max > 0 && (newValue.length + 1) > max) {
                        newValue = newValue.slice((max - 1) * (-1));
                    }
                } else {
                    newValue = [];
                }

                newValue.push(data);
                this.store(key, newValue).subscribe(() => {
                    observer.next(newValue);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            });
        });

    }

    protected _fetchKeys(_keys: Array<number | string> = []): Observable<any> {
        const keys = (<Array<number | string>>_keys);
        return new Observable((observer: any) => {
            let uri = keys && keys.length > 0 ? this.storageUrl + '?keys=' + keys.join(this.separator) : this.storageUrl + '/api/user-preferences/all';
            this.httpService
                .get(uri)
                .pipe(map((response: any) => {
                    return response.body;
                }))
                .subscribe(
                    (data: { Key: string, Value: string }[]) => {
                        $.each(data, (i, k) => {
                            // let v = k.Value?k.Value.replace(/['"]+/g, ''):'';
                            let v = k.Value ? k.Value : '';
                            // let storageService = type==='session'?this.sessionStorageService:this.localStorageService;
                            if (k.Key === 'default_page') {
                                this.localStorageService.store(this.storagePrefix + "." + k.Key, v);
                            } else {
                                this.sessionStorageService.store(this.storagePrefix + "." + k.Key, v);
                            }

                        });
                        observer.next(data);
                    }, (error) => {
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    });
        });
    }
}
