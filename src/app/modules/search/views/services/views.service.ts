/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {Inject, Injectable} from "@angular/core";
import {HttpService} from "../../../../services/http/http.service";
import {Observable} from "rxjs";
import {ViewSaveResp, ViewsOriginalType, ViewType} from "../types";
import {SessionStorageService} from "ngx-webstorage";
import {ReturnRequestStateType} from "../../../../views/base/types";
import { map } from 'rxjs/operators';

/**
 * Interface for views search
 */
export interface ViewsServiceInterface {
    // httpService: HttpService;
    //
    // /**
    //  *
    //  * @param viewType
    //  */
    // getViews(viewType: string): Observable<HttpResponse<any>>;
    //
    // /**
    //  *
    //  * @param viewType
    //  * @param id
    //  */
    // getView(viewType: string, id: string): Observable<HttpResponse<any>>;
    //
    // /**
    //  * @param view
    //  * @returns {Observable<R>}
    //  */
    // setAsDefaultView(o: any): Observable<HttpResponse<any>>;
    //
    // /**
    //  * @param view for deleting
    //  * @returns {Observable<R>}
    //  */
    // deleteView(o: any): Observable<HttpResponse<any>>;
    // /**
    //  * @param view
    //  * @returns {Observable<R>}
    //  */
    // saveView(o: any): Observable<HttpResponse<any>>;
}

/**
 * Views search service
 */
@Injectable()
export class ViewsService {
    httpService: HttpService;
    private storageKey: string = 'grid.views';

    constructor(@Inject(HttpService) _httpService: HttpService,
                private sessionStorage: SessionStorageService) {
        this.httpService = _httpService;
    }


    /**
     * Get view by type and Id
     * @param {string} viewType
     * @param {number} id
     * @returns {Observable<ViewType>}
     */
    loadViewById(viewType: string, id: number): Observable<ViewType> {
        return new Observable((observer) => {
            if (!id) {
                observer.next(null);
                observer.complete();
                return
            }
                this.getView(viewType, id).subscribe(
                    (resp) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
            }
        );
    }

    /**
     *
     * @param viewType
     * @returns {Observable<R>}
     */
    getViews(viewType: string): Observable<ViewsOriginalType> {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if (lang) {
            lang = lang.replace(/\"/g, "");
        }
        let key = this.storageKey + '.' + viewType + '.' + lang;
        let data: ViewsOriginalType = this.sessionStorage.retrieve(key);

        return new Observable((observer: any) => {
                if (!data) {
                    this.httpService
                        .get(
                            '/api/view/info/' + viewType + '?lang=' + lang
                        )
                        .pipe(map((resp: any) => {
                            return resp.body;
                        }))
                        .subscribe((res: ViewsOriginalType) => {
                            this.sessionStorage.store(key, res);
                            observer.next(res);
                        }, (err) => {
                            observer.error(err);
                        }, () => {
                            observer.complete();
                        })

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
     *
     * @param viewType
     * @param id
     * @returns {Observable<R>}
     */
    getView(viewType: string, id: number): Observable<ViewType> {
        let key = this.storageKey + '.' + viewType + '.' + id;
        let data: ViewType = this.sessionStorage.retrieve(key);
        return new Observable((observer: any) => {
            if (!data) {
                return this.httpService
                    .get(
                        '/api/view/' + viewType + '/' + id
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe((view: ViewType) => {
                        this.saveViewToStorage(view);
                        observer.next(view);
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
        })
    }

    /**
     *
     * @param {ViewType} view
     * @returns {Observable<ViewSaveResp>}
     */
    setAsDefaultView(view: ViewType): Observable<ViewSaveResp> {
        return this.saveView(view, true);
    };


    deleteView(view: ViewType): Observable<ReturnRequestStateType> {
        return new Observable((observer: any) => {
            this.httpService
                .delete(
                    '/api/view/' + (view.Id || 0)
                )
                .pipe(map((resp: any) => {
                    return resp.body;
                }))
                .subscribe((resp) => {
                    this.deleteViewFromStorage(view.Id, view.Type);
                    this.clearOriginalView(view.Type)
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    }

    /**
     *
     * @param {ViewType} view
     * @param {boolean} isDefault
     * @returns {Observable<ViewSaveResp>}
     */
    saveView(view: ViewType, isDefault: boolean = false): Observable<ViewSaveResp> {
        if (!view.Id && view.Id != 0) {
            view.Id = 0;
        }

        if(view.Id && view.Id > 0){
            this.deleteViewFromStorage(view.Id, view.Type);
        }

        this.clearOriginalView(view.Type);
        let url = isDefault?'/api/view/' + view.Type + '/' + view.Id + '/setdefault':'/api/view';

        return new Observable((observer: any) => {
            this.httpService
                .post(
                    url,
                    JSON.stringify(view)
                )
                .pipe(map((resp: any) => {
                    return resp.body;
                }))
                .subscribe((resp: ViewSaveResp) => {
                    this.saveViewToStorage(view);
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    }

    saveViewAsGlobal(view: ViewType): Observable<ViewSaveResp> {
        if(view.Id && view.Id > 0){
            this.deleteViewFromStorage(view.Id, view.Type);
        }

        this.clearOriginalView(view.Type);

        let url = view.IsPublic
            ? `/api/view/${view.Id}/SetAsGlobal`
            : `/api/view/${view.Id}/SetAsPrivate`;

        return new Observable((observer: any) => {
            this.httpService
                .post(
                    url,
                    ''
                    // JSON.stringify(view)
                )
                .pipe(map((resp: any) => {
                    return resp.body;
                }))
                .subscribe((resp: ViewSaveResp) => {
                    this.saveViewToStorage(view);
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    }

    public deleteViewFromStorage(id: number, viewType: string) {
        let key = this.storageKey + '.' + viewType + '.' + id;
        this.sessionStorage.clear(key);
    }

    private saveViewToStorage(view: ViewType) {
        let key = this.storageKey + '.' + view.Type + '.' + view.Id;
        this.sessionStorage.store(key, view);
    }

    public clearOriginalView(viewType: string, lang: string = null) {
        if(lang === null){
            lang = localStorage.getItem("tmd.base.settings.lang");
        }
        lang = lang.replace(/\"/g, "");
        let key = this.storageKey + '.' + viewType + '.' + lang;
        this.sessionStorage.clear(key);
    }

    // private clearCache(viewType: string,){
    //     this.clearOriginalView(viewType)
    // }
}
