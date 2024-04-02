import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../http/http.service';
import { SessionStorageService } from "ngx-webstorage";
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { jsonParseHelper } from '../../utils/imfx.common';


@Injectable()
export class ServiceConfigService {
    private prefixStorageServiceConfigById = 'settings.service-config';
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {

    }

    getSettingsServiceConfigTypesList() {
        return this.httpService
            .get(
                '/api/v3/config/servicexml/types'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getVersionClient(): Observable<DBSettings> {
        return this.httpService.get('/api/v3/config/dbsettings')
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    saveVersionClient(payload: DBSettings) {

        return this.httpService.put(
            '/api/v3/config/dbsettings',
            JSON.stringify(payload))
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    saveServiceConfig(data, id) {
        return this.httpService
            .post(
                '/api/v3/config/servicexml/' + id,
                JSON.stringify(data, function(key, value) {
                    return jsonParseHelper(key, value)
                })
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getSettingsServiceConfigById(id: number, disableCache: boolean = true) {
        let storageKey = this.prefixStorageServiceConfigById + '.type.' + id;
        let data = this.sessionStorage.retrieve(storageKey);
        return new Observable((observer) => {
                if (!data || disableCache) {
                    this.httpService
                        .get(
                            '/api/v3/config/servicexml?typeid=' + id
                        )
                        .pipe(map((res: any) => {
                            return res.body;
                        }))
                        .subscribe((resp) => {
                            this.sessionStorage.store(storageKey, resp);
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
                            observer.next(data);
                            observer.complete();
                        // });
                }
            }
        );
    }

    getSettingsServiceConfigDetailById(id: number, disableCache: boolean = true) {
        let storageKey = this.prefixStorageServiceConfigById + '.detail.' + id;
        let data = this.sessionStorage.retrieve(storageKey);
        return new Observable((observer) => {
                if (!data || disableCache) {
                    this.httpService
                        .get(
                            '/api/v3/config/servicexml/' + id
                        )
                        .pipe(map((res: any) => {
                            return res.body;
                        }))
                        .subscribe((resp) => {
                            this.sessionStorage.store(storageKey, resp);
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
                            observer.next(data);
                            observer.complete();
                        // });
                }
            }
        );
    }

    deleteServiceConfigById(id: number): Observable<Subscription> {
        return new Observable((observer) => {
                this.httpService
                    .delete(
                        '/api/v3/config/servicexml/' + id
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe((resp) => {
                        observer.next(resp);
                    },(err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            }
        );
    }

    getNewSchemaByType(type: number) {
        return new Observable((observer) => {
                this.httpService
                    .get(
                        '/api/v3/config/servicexml/new?typeId=' + type
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe((resp) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            }
        );
    }

    clearSettingsServiceConfigById(id: number){
        this.sessionStorage.clear(this.prefixStorageServiceConfigById + '.' + id);
    }

    saveSessionStorage(id, resp){
        let storageKey = this.prefixStorageServiceConfigById + '.' + id;
        this.sessionStorage.store(storageKey, resp);
    }
}

export type DBSettings  = {
    "MinRequiredAppVersion": {
        "Major": number,
        "Minor": number,
        "Release": number,
        "Build": number
    },
    "DbSchema": "183" | string,
    "DbName": "DEMO DB" | string,
}
