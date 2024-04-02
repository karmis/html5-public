/**
 * Created by Sergey Trizna on 23.03.2017.
 */
import {Inject, Injectable} from '@angular/core';
import {HttpService} from '../../../services/http/http.service';
import {Observable} from "rxjs";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
/**
 * Interface for accordion of grid
 */
export interface AccordionServiceInterface {
    httpService: HttpService;
    getMediaData(id:string): Observable<HttpResponse<any>>
}
/**
 * Service for accordion of grid
 */
@Injectable()
export class AccordionService implements AccordionServiceInterface {
    httpService;
    constructor(@Inject(HttpService) _httpService: HttpService) {
        this.httpService = _httpService;
    }
    getMediaData(id:string): Observable<HttpResponse<any>> {
        return this.httpService.get('/api/v3/misr/' + id + '/media' )
                .pipe(map((resp: any) => {
                    return resp.body;
                }))
    }
}
