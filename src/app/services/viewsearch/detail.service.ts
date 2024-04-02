/**
 * Created by initr on 31.10.2016.
 */
import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import {Observable} from "rxjs";
import {map, mergeMap} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';
import {MediaVideoPipe} from "../../pipes/media.video.pipe/media.video.pipe";

/**
 * Detail service
 */

@Injectable()
export class DetailData {
    constructor(private httpService: HttpService, public mediaVideoPipe: MediaVideoPipe) {
    }

    /**
     * Search by id
     * @param id - id
     * @param typeDetails
     * @returns {Observable<R>}
     */
    search(id: any, typeDetails): Observable<HttpResponse<any>> {
        return this.httpService
            .get(
                '/api/v3/' + typeDetails + '/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getDetails(id, subtypes, typeDetails, detailsviewType) {
        let lang = localStorage.getItem("tmd.base.settings.lang");
        if (lang) {
            lang = lang.replace(/"/g, "");
        }
        return this.httpService.get('/api/v3/' + typeDetails + '/' + id)
            .pipe(map((res: any) => res.body))
            .pipe(mergeMap(resp =>
                    this.httpService.get('/api/v3/detailsview/' + detailsviewType + '/' + (subtypes[resp.MEDIA_TYPE] || subtypes[0]) + '?lang=' + lang)
                        .pipe(map(
                            res1 => res1.body
                        )),
                (res, res1) => {
                    this.checkFields(res);
                    return [res, res1];
                }
            ))
    };

    getVideoDetails(id, typeDetails) {
        // return this.httpService.get('/api/file/'+id+'/meida')
        return this.httpService.get('/api/v3/' + typeDetails + '/' + id)
        //.pipe(map((res:any) => res.body))
    };

    checkFields(file) {
        if (!file.TITLE && file.LI_TTL_text) {
            file.TITLE = file.LI_TTL_text;
        }
    }

    getDetailHistory(type, id) {
        return this.httpService.get('/api/v3/history/' + type + '/' + id)
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getVideoInfo(id: number, options?: {
        smudge: boolean,
        scene?: boolean,
        waveform?: boolean
    }) {
        let params = [];
        for (let i in options) {
            if (options[i]) {
                params.push(i)
            }
        }

        return this.httpService.get('/api/v3/mediavideo/' + id + '?info=' + params.join(",")).pipe(
            map((res: any) => {
                return this.mediaVideoPipe.transform(res);
            }));
    }
}
