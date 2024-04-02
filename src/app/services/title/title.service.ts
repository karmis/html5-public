import {Injectable} from '@angular/core';
import {HttpService} from "../http/http.service";
import {Observable} from "rxjs";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TitleService {
    constructor(private httpService: HttpService) {

    }

    createEpisodeTitle(options): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/episode',
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
    createSeasonName(options): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/season',
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
    createSeries(options): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/series',
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
    createTitle(options): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/title',
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
}
