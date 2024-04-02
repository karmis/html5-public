import { Injectable } from "@angular/core";
import {forkJoin, Observable,} from "rxjs";
import { SessionStorageService } from "ngx-webstorage";
import { HttpService } from "../../../../../services/http/http.service";
import { DetailService } from "../../../../../modules/search/detail/services/detail.service";
import { map, mergeMap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import {MediaVideoPipe} from "../../../../../pipes/media.video.pipe/media.video.pipe";

@Injectable()
export class MediaLoggerTaskService extends DetailService{
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService,
                public mediaVideoPipe: MediaVideoPipe
                ) {
        super(httpService, sessionStorage, mediaVideoPipe);
    }
    save(id: number, options: any): Observable<HttpResponse<any>> {

        return this.httpService
            .post(
                '/api/v3/media-details/',
                JSON.stringify(options)
            )
            .pipe(map((res:any) => {
                return res.body;
            }));
    }
}
