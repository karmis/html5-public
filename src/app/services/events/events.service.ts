import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { map } from 'rxjs/operators';
import {forkJoin, Observable, Subscription} from 'rxjs';


@Injectable({providedIn: 'root'})
export class EventsService {
    productionId: number = null;

    constructor(private httpService: HttpService) {
    }
    removeEvent(id) {
        return this.httpService
            .delete(`/api/v3/eventrequest/${id}`)
            .pipe(map((res: any) => res.body));
    }

    getEventById(id, isMulti) {
        if (isMulti) {
            return this.httpService
                .get(`/api/v3/eventrequest/multi/${id}`)
                .pipe(map((res: any) => {
                    return res.body;
                }));
        } else {
            return this.httpService
                .get(`/api/v3/eventrequest/${id}`)
                .pipe(map((res: any) => {
                    return res.body;
                }));
        }
    }

    getEventByProdId(prodId) {
        return this.httpService
            .get(`/api/v3/eventrequest/multi/prod/${prodId}`)
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getEventConfig(eventMode) {
        return forkJoin(
            this.httpService
                .get(`/api/v3/config/eventreqdetails/view`)
                .pipe(map((res: any) => {
                    return res.body;
                })),
            this.httpService
                .get(`/api/v3/config/eventreqdetails/lookups`)
                .pipe(map((res: any) => {
                    return res.body;
                })),
            this.httpService
                .get('/api/v3/config/eventreqdetails')
                .pipe(map((res: any) => {
                    return res.body;
                })),
            this.httpService
                .get(`/api/v3/mfx-settings/${eventMode}/value`)
                .pipe(map((res: any) => {
                    return res.body;
                }))
        );
    }

    saveEvent(data): Observable<Subscription> {
        return this.httpService
            .post(`/api/v3/eventrequest`, JSON.stringify(data, this.httpService.getCircularReplacer()))
            .pipe(map((res: any) => {
                return res.body;
            }))
    }
    saveMultiEvent(prodId, data): Observable<Subscription> {
        return this.httpService
            .post(`/api/v3/eventrequest/multi/${prodId}`, JSON.stringify(data))
            .pipe(map((res: any) => {
                return res.body;
            }))
    }

    checkAttachProd(prodId): Observable<Subscription> {
        return this.httpService
            .post(`/api/v3/eventrequest/multi/${prodId}`, JSON.stringify(prodId))
            .pipe(map((res: any) => {
                return res.body;
            }))
    }

}
