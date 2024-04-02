import { Injectable } from "@angular/core";
import {forkJoin, Observable,} from "rxjs";
import { SessionStorageService } from "ngx-webstorage";
import { HttpService } from "../../../../../services/http/http.service";
import { DetailService } from "../../../../../modules/search/detail/services/detail.service";
import { MediaDetailMediaCaptionsResponse } from "../../../../../models/media/detail/caption/media.detail.media.captions.response";
import { MediaDetailPacSubtitlesResponse } from "../../../../../models/media/detail/pacsubtitles/media.detail.pac.subtitiles.response";
import { map, mergeMap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import {MediaVideoPipe} from "../../../../../pipes/media.video.pipe/media.video.pipe";

@Injectable()
export class SegmentingService extends DetailService{
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService,
                public mediaVideoPipe: MediaVideoPipe) {
        super(httpService, sessionStorage, mediaVideoPipe);
    }

    /**
     * Get detail info by id
     * @param r_params route params with ID
     */
    getDetail(id): Observable<any> {
        return this.httpService
            .get(
                '/api/v3/task/assess/' + id
            )
            .pipe(map((res:any) => {
                return res.body;
            }));
    };


    getDetails(id, subtypes, typeDetails, detailsviewType) {
        return super.getDetailsAssess(id, subtypes, typeDetails, detailsviewType);
    };

    getWaveformsJson(url) {
        return this.httpService.get(url).pipe(map((res:any) => {
            return res.body;
        }));
    }

    checkFields(file) {
        if (!file.TITLE && file.LI_TTL_text) {
            file.TITLE = file.LI_TTL_text;
        }
    };

    getDetailMediaTagging(guid) {
        return this.httpService.get('/api/v3/media-tagging/' + guid)
            .pipe(map((res:any) => {
                return res.body;
            }));
    };

    getSubtitles(id: number): Observable<Array<MediaDetailMediaCaptionsResponse>> {
        return this.httpService.get('/api/v3/media-captions/' + id)
            .pipe(map((res:any) => {
                let response = res.body;
                return response;
            }));
    }

    getPacSubtitles(id: number, params: string = ''): Observable<Array<MediaDetailPacSubtitlesResponse>> {
        return this.httpService.get('/api/v3/subtitles/' + id + params)
            .pipe(map((res:any) => {
                let response = res.body;
                return response;
            }));
    };

    save(id: number, options: any): Observable<HttpResponse<any>> {

        return this.httpService
            .post(
                '/api/v3/task/assess/',
                JSON.stringify(options)
            )
            .pipe(map((res:any) => {
                return res.body;
            }));
    }

    doTaskAction(taskId, actionId): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/task/' + taskId + '/actions/' + actionId, ""
            )
            .pipe(map((res:any) => {
                return res.body;
            }));
    }

    refreshMediaItems(id, excludeMediaIds): Observable<any> {
        return this.httpService
            .post(
                '/api/v3/task/assess/' + id + '/media',
                JSON.stringify({
                    excludeMediaIds: excludeMediaIds
                })
            )
            .pipe(map((res:any) => {
                return res.body;
            }));
    }
}
