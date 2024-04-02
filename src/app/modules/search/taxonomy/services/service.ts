/**
 * Created by Sergey Trizna on 22.11.2017.
 */
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SessionStorageService } from "ngx-webstorage";
import { HttpService } from "../../../../services/http/http.service";
import { TaxonomyType } from "../types";
import { map } from 'rxjs/operators';
import { SlickGridRequestError } from '../../slick-grid/types';

@Injectable()
export class TaxonomyService {
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {
    }

    getTaxonomy(): Observable<Array<TaxonomyType>> {
        let key = 'taxonomy';
        let data = this.sessionStorage.retrieve(key);
        return new Observable((observer: any) => {
            if (!data) {
                return this.httpService
                    .get(
                        '/api/v3/taxonomy'
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (res: any) => {
                            this.sessionStorage.store(key, res);
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
        });
    };

    getTaxonomyConfig(fromCache: boolean = true): Observable<TaxonomyType> {
        let key = 'taxonomy';
        let data;
        if (fromCache) {
            data = this.sessionStorage.retrieve(key);
        }
        return new Observable((observer: any) => {
            if (!data) {
                return this.httpService
                    .get(
                        '/api/v3/config/taxonomy'
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (res: any) => {
                            this.sessionStorage.store(key, res);
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
        });
    };

    getLowerLevelValuesOfTaxonomy(taxonomy): Array<TaxonomyType> {
        let res = [];
        if (taxonomy && taxonomy[0] && taxonomy[0].Children) {
            res = this.searchInNextLevel(taxonomy[0].Children, res, true);
        }

        return res;
    }

    searchInNextLevel(childs, res, lowerOnly: boolean): Array<TaxonomyType> {
        $.each(childs, (i, child) => {
            if (child.Children && child.Children.length > 0) {
                if (!lowerOnly) {
                    res.push({ID: child.ID, Name: child.Name})
                }
                this.searchInNextLevel(child.Children, res, lowerOnly)
            } else {
                res.push(child);
            }
        });

        return res;
    }

    searchInNextLevelByConfig(childs, res, lowerOnly: boolean): Array<TaxonomyType> {
        $.each(childs, (i, child) => {
            if (child.Children && child.Children.length > 0) {
                if (!lowerOnly) {
                    res.push({ID: child.ID, SUBJECT_NAME: child.SUBJECT_NAME})
                }
                this.searchInNextLevelByConfig(child.Children, res, lowerOnly)
            } else {
                res.push(child);
            }
        });

        return res;
    }

    getAllTagsOfTaxonomy(taxonomy, isConfig: boolean = false): Array<TaxonomyType> {
        let res = [];
        if (taxonomy && taxonomy[0] && taxonomy[0].Children) {
            if (isConfig){
                res = this.searchInNextLevelByConfig(taxonomy[0].Children, res, false);
            } else {
                res = this.searchInNextLevel(taxonomy[0].Children, res, false);
            }
        }

        return res;

    }

    createNode(parentNodeId, struct): Observable<any[] | string> {
        return new Observable((obs) => {
            const url = `/api/v3/config/taxonomy/${parentNodeId}/children`;
            this.httpService.post(
                url,
                [struct]
            ).pipe(map((res) => res.body))
                .subscribe((res: any[]) => {
                    obs.next(res);
                    obs.complete();
                }, (err: SlickGridRequestError) => {
                    if (err.Error) {
                        obs.next(err.Error);
                    } else {
                        obs.error('Unknown Error');
                    }
                    obs.complete();
                })
        });
    }

    public updateNode(node, newName): Observable<string> {
        node.data.dirtyObj.SUBJECT_NAME = newName;
        const url = `/api/v3/config/taxonomy/${node.data.dirtyObj.ID}`
        return new Observable((obs) => {
            this.httpService.post(
                url,
                {"SUBJECT_NAME": node.data.dirtyObj.SUBJECT_NAME, "PARENT_ID": node.data.dirtyObj.PARENT_ID}
            ).subscribe((res: any) => {
                if (!res.Error) {
                    obs.next('ok');
                } else {
                    obs.error(res.Error);
                }
                obs.complete();
            }, (err) => {
                if (err.Error) {
                    obs.next(err.Error);
                } else {
                    obs.error('Unknown Error');
                }
                obs.complete();
            })
        })
    }

    public removeNode(node): Observable<any[] | string> {
        return new Observable((obs) => {
            const url = `/api/v3/config/taxonomy/${node.data.dirtyObj.ID}`;
            this.httpService.delete(url)
                .pipe(map((res) => res.body))
                .subscribe((res: any[]) => {
                    obs.next(res);
                    obs.complete();

                }, (errRes: any) => {
                    const err: SlickGridRequestError = errRes.error;

                    obs.error(err.Error || 'Unknown Error')
                });
        })
    }
}
