import {CoreService} from "../../../../../core/core.service";
import {Inject, Injectable} from "@angular/core";
import {HttpService} from "../../../../../services/http/http.service";
import {Observable} from "rxjs";

@Injectable()
export class MediaStatusService extends CoreService {
    httpService: HttpService;

    constructor(@Inject(HttpService) _httpService: HttpService) {
        super(_httpService)
    }

    saveMediaStatus(mediaId:number, statusId:number|string): Observable<any> {
        return this.httpService
            .post('/api/v3/media/'+mediaId+'/status/'+statusId, JSON.stringify({}) )
            .map((res:any) => {
                return res.body;
            })
    }
}
