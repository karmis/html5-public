import {DetailService} from "../../../../../modules/search/detail/services/detail.service";
import {Injectable} from "@angular/core";
import {HttpService} from "../../../../../services/http/http.service";
import {SessionStorageService} from "ngx-webstorage";
import {MediaDetailResponse} from "../../../../../models/media/detail/media.detail.response";
import {MediaDetailDetailsViewResponse} from "../../../../../models/media/detail/detailsview/media.detail.detailsview.response";
import {Observable} from "rxjs";
import { map, mergeMap } from 'rxjs/operators';
import {MediaVideoPipe} from "../../../../../pipes/media.video.pipe/media.video.pipe";

@Injectable()
export class ComponentQCService extends DetailService{
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService,
                public mediaVideoPipe: MediaVideoPipe) {
        super(httpService, sessionStorage, mediaVideoPipe);
    }

    getDetails(id, subtypes, typeDetails, detailsviewType): Observable<(MediaDetailResponse | MediaDetailDetailsViewResponse)[]>  {
        var lang = localStorage.getItem('tmd.base.settings.lang');
        if (lang) {
            lang = lang.replace(/\"/g, '');
        }
        return this.httpService.get('/api/v3/task/componentqc/' + id)
            .pipe(map(res => res.body))
            .pipe(mergeMap(resp =>
                    this.httpService.get('/api/v3/detailsview/' + detailsviewType + '/0' /* + (subtypes[resp.MEDIA_TYPE]||subtypes[0])*/ + '?lang=' + lang).pipe(
                        map(
                            res1 => res1.body
                        )),
                (res, res1) => {
                    this.checkFields(res);
                    return [res, res1];
                }
            ));
    };
}
