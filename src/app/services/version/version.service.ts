/**
 * Created by IvanBanan 01.10.2019.
 */
import {Injectable} from '@angular/core';
import {HttpService} from "../http/http.service";
import {Observable} from "rxjs";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class VersionService {
    constructor(private httpService: HttpService) {

    }

    createSubversion(options): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/title-version',
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
}
