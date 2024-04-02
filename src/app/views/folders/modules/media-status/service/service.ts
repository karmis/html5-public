
import {map} from 'rxjs/operators';
import {CoreService} from "../../../../../core/core.service";
import {Inject, Injectable} from "@angular/core";
import {HttpService} from "../../../../../services/http/http.service";
import {Observable} from "rxjs";

@Injectable()
export class MediaStatusService extends CoreService {
    httpService: HttpService;

    constructor(@Inject(HttpService) _httpService: HttpService) {
        super(_httpService);
    }

    saveMediaStatus(mediaIds: number[], statusId: number): Observable<any> {
            const re = `[${mediaIds.join(',')}]`;
        return this.httpService
            .post('/api/v3/media/status/' + statusId,
                re
            ).pipe(
                map((res: any) => {
                    return res.body;
                })
            );
    }
}
