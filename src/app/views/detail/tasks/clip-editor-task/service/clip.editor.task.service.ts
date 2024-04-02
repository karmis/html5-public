import {Inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {DetailService} from "../../../../../modules/search/detail/services/detail.service";
import {HttpService} from "../../../../../services/http/http.service";
import {SessionStorageService} from "ngx-webstorage";
import {MediaVideoPipe} from "../../../../../pipes/media.video.pipe/media.video.pipe";


@Injectable()
export class CETaskService extends DetailService {
    constructor(
        @Inject(HttpService) public _httpService: HttpService,
        @Inject(SessionStorageService) public  sessionStorage: SessionStorageService,
        public mediaVideoPipe: MediaVideoPipe
    ) {
        super(_httpService, sessionStorage, mediaVideoPipe);
    }

    saveTask(id, reqsData){
        return new Observable((observer: any) => {
            return this.httpService
                .post(
                    '/api/v3/task/clip-editor/' + id,
                    JSON.stringify(reqsData),
                    {},
                    {},
                    false
                )
                .pipe(map((resp: any) => {
                    return resp.body;
                }))
                .subscribe(
                    (resp) => {
                        observer.next(resp);
                    },
                    (err) => {
                        observer.error(err);
                    },
                    () => {
                        observer.complete();
                    }
                );
        });
    }
}
