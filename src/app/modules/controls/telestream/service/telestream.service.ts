import { Injectable } from '@angular/core';
import { HttpService } from 'app/services/http/http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

export type TelestreamClipStatusResponse = {
    "ResultObject": {
        "ClipStatus": string    //'Unknown', 'Playing', 'Paused', 'Stopped'
    },
    "ID": number,               //0.0,
    "Result": boolean,          //true,
    "Error": any,               //null,
    "ErrorCode": any,           //null,
    "ErrorDetails": any,        //null
};

@Injectable()
export class TelestreamService {
    constructor(private httpService: HttpService) {

    }

    testConnectivity(id): Observable<any> {
        return this.httpService
            .get(
                `/api/playout/${id}/test`
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getStatus(id): Observable<TelestreamClipStatusResponse> {
        return this.httpService
            .get(
                `/api/playout/${id}/status`
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    playClip(id, options): Observable<any> {
        return this.httpService
            .post(
                `/api/playout/${id}/playclip`,
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    stop(id): Observable<any> {
        return this.httpService
            .post(
                `/api/playout/${id}/stop`,
                '{}'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    pause(id): Observable<any> {
        return this.httpService
            .post(
                `/api/playout/${id}/pause`,
                '{}'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    play(id): Observable<any> {
        return this.httpService
            .post(
                `/api/playout/${id}/play`,
                '{}'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
}
