import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HttpService } from '../http/http.service';
import { SessionStorageService } from "ngx-webstorage";
import { map, tap } from 'rxjs/operators';
import { SettingsGroupType } from "../../views/system/config/types";


@Injectable()
export class SettingsGroupsService {
    public addedNewGroup: EventEmitter<SettingsGroupType | null> = new EventEmitter<SettingsGroupType | null>();
    /**
     * Returned list of users by params
     * @returns {any}
     */
    public
    private prefixStorageSettingsGroupById = 'settings.group';
    private prefixStorage = "lookups.";

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {

    }

    getSettingsGroupsList() {
        return this.httpService
            .get(
                '/api/settings/groups/'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getLanguageSelected(id) {
        return this.httpService.get(`/api/v3/config/user/${id}/customuioptions`)
            .pipe(map(res => res.body))

    }

    getLanguageList(): Observable<{ text: string[] }> {
        const key = this.prefixStorage + 'customuioptions';
        let data = this.sessionStorage.retrieve(key);
        return new Observable((observer) => {

                if (!data) {
                    this.httpService.get(`/api/v3/customuioptions`)
                        .pipe(map(res => res.body)).subscribe(res => {
                            this.sessionStorage.store(key, res);
                            observer.next(res);
                        },
                        er => {
                            observer.error(er)
                        },
                        () => {
                            observer.complete()
                        })

                } else {
                    observer.next(data);
                    observer.complete();
                }
            }
        );
    }

    saveLanguage(id, text) {
        return this.httpService
            .post(
                `/api/v3/config/user/${id}/customuioptions`,
                {
                    text
                }
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    delete(id) {
        return this.httpService
            .delete(
                '/api/settings/group/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getSettingsGroupById(id: number, disableCache: boolean = false) {
        let storageKey = this.prefixStorageSettingsGroupById + '.' + id;
        let data = this.sessionStorage.retrieve(storageKey);
        return new Observable((observer) => {
                if (!data || disableCache) {
                    this.httpService
                        .get(
                            '/api/settings/group/' + id
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
                    //to make observable asynchronous
                    Promise.resolve()
                        .then(() => {
                            observer.next(data);
                            observer.complete();
                        });
                }
            }
        );
    }

    clearSettingsGroupById(id: number) {
        this.sessionStorage.clear(this.prefixStorageSettingsGroupById + '.' + id);
    }

    getSettingsUserById(id, withCache: boolean = true) {
        const storageKey = 'settings.user.by.id.' + id;
        let data = this.sessionStorage.retrieve(storageKey);
        return new Observable((observer) => {
                if (!data || withCache) {
                    this.httpService
                        .get(
                            '/api/settings/user/' + id
                        )
                        .pipe(map((res: any) => {
                            return res.body;
                        })).subscribe((res) => {
                        this.sessionStorage.store(storageKey, res);
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
                } else {
                    observer.next(data);
                    observer.complete();
                }
            }
        );
    }

    getSearchFields() {
        return this.httpService
            .get(
                '/api/v3/search/search-fields/'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getFacets() {
        return this.httpService
            .get(
                '/api/v3/search/facets/'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getFieldsForConsumer(clearCache: boolean = false): Observable<Subscription> {
        let storageKey = 'settings.consumer.fields';
        let data = this.sessionStorage.retrieve(storageKey);
        // @TODO  reuse the src/app/modules/search/views/services/views.service.ts:93 (getViews method)
        return new Observable((observer) => {
                if (!data || clearCache) {
                    // this.httpService.get('/api/lookupsearch/users?search=' + param)
                    this.httpService.get('/api/view/info/ChameleonSearch')
                        .pipe(map((res: any) => res.body))
                        .subscribe(
                            (res) => {
                                this.sessionStorage.store(storageKey, res);
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

    saveSettingsGroup(group) {
        // if(group && group.Id){
        //     group.ID = group.Id
        // }
        return (group.ID !== undefined
                ? this.httpService.put('/api/settings/group/' + group.ID, group)
                    .pipe(
                        map((res: any) => {
                            return res.body;
                        }),
                        tap((resp) => {
                            let storageKey = this.prefixStorageSettingsGroupById + '.' + resp.ID;
                            this.sessionStorage.store(storageKey, resp);
                        }),
                    )
                : this.httpService.post('/api/settings/group/', group)
                    .pipe(map((res: any) => {

                        console.log('subSelectSettingsGroup,', res.body);
                        this.addedNewGroup.next(res.body)
                        return res.body;
                    }))
        );
    }

    resetTermsAndConditions(id) {
        return this.httpService
            .post(
                `/api/settings/group/${id}/reset-terms`,
                {}
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    saveSessionStorage(id, resp) {
        let storageKey = this.prefixStorageSettingsGroupById + '.' + id;
        this.sessionStorage.store(storageKey, resp);
    }

}
