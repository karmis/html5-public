/**
 * Created by Sergey Trizna on 22.09.2017.
 */


import { Inject, Injectable } from "@angular/core";
import { HttpService } from "../../../../services/http/http.service";
import { Observable } from "rxjs";
import { SessionStorageService } from "ngx-webstorage";
import { SavedSearchList, SaveSearchResponse } from "../types";
import { AdvancedCriteriaListTypes } from "../../advanced/types";
import { SearchTypesType } from "../../../../services/system.config/search.types";
import { map } from 'rxjs/operators';
import {isArray} from "rxjs/internal-compatibility";


/**
 * Search Settings service
 */
@Injectable()
export class SearchSavedService {
    httpService: HttpService;
    sessionStorage;
    storagePrefix = 'advanced.search.saved.searches.';

    constructor(@Inject(HttpService) _httpService: HttpService,
                @Inject(SessionStorageService) _sessionStorage: SessionStorageService) {
        this.httpService = _httpService;
        this.sessionStorage = _sessionStorage;
    }

    clearSavedSearches(searchType: string): void {
        let namespace = this.storagePrefix + searchType;
        let stored = this.sessionStorage.retrieve(namespace + '.all');
        if (stored && isArray(stored)) {
            stored.forEach((st) => {
                this.sessionStorage.clear(namespace + '.' + st.ID);
            });
        }

        this.sessionStorage.clear(namespace + '.all');
    }

    getListOfSavedSearches(searchType: string, clearCache: boolean = false): Observable<SavedSearchList> {
        let storagePrefix = this.storagePrefix + searchType + '.all';
        let data = this.sessionStorage.retrieve(storagePrefix);
        return new Observable((observer: any) => {
            //  data.length < 2 ||
                if (!data || clearCache == true) {
                    let url = '/api/view/searches/' + searchType;
                    this.httpService
                        .get(url)
                        .pipe(map((res: any) => res.body))
                        .subscribe(
                            (res: any) => {
                                let _res = JSON.parse(JSON.stringify(res));
                                this.sessionStorage.store(storagePrefix, _res);
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

    getItemOfSavedSearch(searchType: string, id: number, clearCache: boolean = false): Observable<AdvancedCriteriaListTypes> {
        let storagePrefix = this.storagePrefix + searchType + '.' + id;
        let data = this.sessionStorage.retrieve(storagePrefix);
        return new Observable((observer: any) => {
                if (!data || !data.length || clearCache === true) {
                    let url = '/api/view/search/' + searchType + '/' + id;
                    this.httpService
                        .get(url)
                        .pipe(map((res: any) => res.body))
                        .subscribe(
                            (res: any) => {
                                this.sessionStorage.store(storagePrefix, res);
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

    removeSavedSearch(searchType: SearchTypesType, id: number): Observable<SaveSearchResponse> {
        return new Observable((observer: any) => {
                let url = '/api/view/search/' + searchType + '/' + id;
                this.httpService
                    .delete(url)
                    .pipe(map((res: any) => res.body))
                    .subscribe(
                        (res: any) => {
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        });
            }
        );
    }

    getSavedSearches(searchType: string, id: number | string = 'all', clearCache: boolean = false): Observable<Array<any>> {
        let storagePrefix = this.storagePrefix + searchType + '.' + id;
        let data = this.sessionStorage.retrieve(storagePrefix);
        return new Observable((observer: any) => {
                if (!data || clearCache == true) {
                    let url = '/api/view/search/' + searchType + '/' + id;
                    if (id == 'all') {
                        url = '/api/view/searches/' + searchType;
                    }
                    this.httpService
                        .get(url)
                        .pipe(map((res: any) => res.body))
                        .subscribe(
                            (res: any) => {
                                this.sessionStorage.store(storagePrefix, res);
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
     * Save parametes of search
     * @param id
     * @param name
     * @param type
     * @param data
     * @returns {Observable<R>}
     */
    saveSearch(id = -1, name, type, data): Observable<SaveSearchResponse> {
        if (id > -1) {
            let storagePrefix = this.storagePrefix + type + '.' + id;
            this.sessionStorage.store(storagePrefix, data);
        }

        return this.httpService
            .post(
                '/api/view/search/' + type + '/' + id + '?name=' + name,
                JSON.stringify(data)
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }
}
