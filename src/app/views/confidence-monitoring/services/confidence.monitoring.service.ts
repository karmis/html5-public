import {Injectable} from "@angular/core";
import {HttpService} from "../../../services/http/http.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class ConfidenceMonitoringService {
    httpService: HttpService;
    constructor(public _httpService: HttpService)
    {
        this.httpService = _httpService;
    }
    getVideoUrls(data): Observable<any> {
        // return this.httpService.get('/v3/test-video-urls')
        //     .pipe(map(res => {
        //         return res.body;
        //     }));
        return this.httpService.post(
            '/api/v3/ConfidenceFeed',
            JSON.stringify(data))
            .pipe(map(res => {
                return res.body;
            }));
    }
}
