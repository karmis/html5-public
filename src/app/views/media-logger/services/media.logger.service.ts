import { Injectable } from "@angular/core";
import { Observable, forkJoin } from "rxjs";
import { HttpService } from '../../../services/http/http.service';
import { SessionStorageService } from "ngx-webstorage";
import { map, mergeMap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { DetailService } from '../../../modules/search/detail/services/detail.service';
import {MediaVideoPipe} from "../../../pipes/media.video.pipe/media.video.pipe";

@Injectable()
export class MediaLoggerService extends DetailService {
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService,
                public mediaVideoPipe: MediaVideoPipe) {
        super(httpService, sessionStorage, mediaVideoPipe);
    }

    /**
     * Get detail info by id
     * @param r_params route params with ID
     * @param typeDetails
     */
    getDetail(r_params, typeDetails): Observable<HttpResponse<any>> {
        return this.httpService
            .get(
                '/api/v3/' + typeDetails + '/' + r_params.value.id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    };


    getDetails(id, subtypes, typeDetails, detailsviewType)  {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if(lang) {
          lang = lang.replace(/\"/g,"");
        }
        return this.httpService.get('/api/v3/' + typeDetails + '/'+id)
            .pipe(map((res:any) => res.body))
            .pipe(mergeMap(resp =>
                      this.httpService.get('/api/v3/detailsview/'+ detailsviewType + '/' + (subtypes[resp.MEDIA_TYPE]||subtypes[0]) + '?lang=' + lang)
                        .pipe(map(
                            res1 => res1.body
                        )),
                        (res, res1) =>{
                            this.checkFields(res);
                            return [res, res1];
                        }
                    ))
    };

    getDetailsView(subtype, detailsviewType): Observable<any> {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if(lang) {
          lang = lang.replace(/\"/g,"");
        }
        return this.httpService
                .get('/api/v3/detailsview/'+ detailsviewType + '/' + subtype + '?lang=' + lang)
                .pipe(map((res: any) => {
                    return res.body;
                }));
    };

    getDetailsAsync(id, subtype, typeDetails, detailsviewType) {
        let lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/\"/g, '');
        }
        let selector = `detailsview.${detailsviewType}_${lang}.${subtype}`;
        let data = this.sessionStorage.retrieve(selector);
        return forkJoin(
            new Observable((observer: any) => {
                if (!data) {
                    this.httpService.get('/api/v3/detailsview/' + detailsviewType + '/' + subtype + '?lang=' + lang)
                        .pipe(map(res => res.body))
                        .subscribe(
                            (res: any) => {
                                this.sessionStorage.store(selector, res);
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
            }),
            this.httpService
                .get('/api/v3/detailsview/' + detailsviewType + '/' + subtype + '?lang=' + lang)
                .pipe(map((res: any) => {
                    return res.body;
                }))
        );
    };

    checkFields(file){
        if(!file.TITLE && file.LI_TTL_text){
            file.TITLE = file.LI_TTL_text;
        }
    };

    /**
    * Get friendly names from storage (if not -> load&save)
    */
    getLookups(id:string): Observable<HttpResponse<any>> {
        let data = this.sessionStorage.retrieve(id);
        return new Observable((observer: any) => {
            if (!data) {
                let lookup = id.split('.')[0];
                this.httpService.get('/api/lookups/' + lookup)
                    .pipe(map((res:any) => res.body))
                    .subscribe(
                        (res: any) => {
                            let path = id.split('.');
                            let d = res;
                            for (let i in path) {
                                d = d[path[i]];
                            }
                            this.sessionStorage.store(id, d);
                            observer.next(d);
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

}
