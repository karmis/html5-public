import { Injectable } from '@angular/core';
import { NotificationService } from "../../modules/notification/services/notification.service";
import { HttpService } from '../http/http.service';
import { catchError, map } from 'rxjs/operators';
import { MakeItems, MakeOfficer } from '../../views/production/constants/production.types';
import { Observable, throwError } from 'rxjs';
import {
    ResponseMadeItems,
    ResponseMadeItemsDetail,
    ResponseProductionDetail,
    TemplateFields
} from './production.types';
import $ from "jquery";
import * as _ from 'lodash';

@Injectable({providedIn: 'root'})
export class ProductionService {
    productionId: number = null;

    constructor(private httpService: HttpService,
                private notificationService: NotificationService) {
    }

    getTemplates(): Observable<any> {
        return this.httpService.get('/api/v3/config/production/templates')
            .pipe(map((res:any) => {
                    return res.body;
                }),
                catchError(res => {
                    this.notificationService.notifyShow(2, res.error.Error, true, 5000);
                    return throwError(res)
                }));
    };

    getTemplateGroups(id): Observable<any> {
        return this.httpService.get('/api/v3/config/production/templateconfig/' + id)
            .pipe(map((res:any) => {
                    // res.body.ConfigTypeText = 'Cleans and Versions'
                    return res.body;
                }),
                catchError(res => {
                    this.notificationService.notifyShow(2, res.error.Error, true, 5000);
                    return throwError(res)
                }));
    };

    getTemplate(id): Observable<TemplateFields> {
        //
        // return new Observable(obs => {
        //     obs.next(TEMPLATE_DEBUG);
        //     obs.complete()
        // })

        return this.httpService.get('/api/v3/config/production/template/' + id)
            .pipe(map((res:any) => {
                    return res.body;
                }),
                catchError(res => {
                    this.notificationService.notifyShow(2, res.error.Error, true, 5000);
                    return throwError(res)
                }));
    };

    getProductionDetail(id): Observable<ResponseProductionDetail> {
        return this.httpService
            .get(`/api/v3/production/${id}`)
            .pipe(map((res: any) => {
                return this.clearingResponse(res.body);
            }));
    }

    saveProductionDetail(payload) {
        const clonePayload =_.cloneDeep(payload);
        this.clearingResponse(clonePayload);
        return this.httpService
            .post(`/api/v3/production`, clonePayload)
            .pipe(map((res: any) => {
                    if (res.body.Items) {
                        this.notificationService.notifyShow(1, 'Success');
                        return this.clearingResponse(res.body)
                    }
                }),
                catchError(res => {
                    this.notificationService.notifyShow(2, res.error.Error);
                    $('.loadingoverlay').hide();
                    return throwError(res);
                })
            );
    }

    getMadeItems(id): Observable<ResponseMadeItems[]> {
        return this.httpService
            .get(`/api/v3/production/makeitem/${id}/madeitems`)
            .pipe(map((res: any) => this.clearingResponse(res.body)));

    }

    getMadeItemDetail(id): Observable<ResponseMadeItemsDetail> {
        return this.httpService
            .get(`/api/v3/media-details/${id}`)
            .pipe(map((res: any) => this.clearingResponse(res.body)));

    }

    removeProduction(id) {
        return this.httpService
            .delete(`/api/v3/production/${id}`)
            .pipe(map((res: any) => res.body));
    }

    makeOfficer(payload: MakeOfficer) {
        return this.httpService
            .post(`/api/v3/production/makeofficer`,
                payload)
            .pipe(map((res: any) => res.body));
    }

    makeItems(itemsId, type: MakeItems, reason) {
        return this.httpService
            .post(`/api/v3/production/${this.productionId}/makeitems/${type.toLocaleLowerCase()}`,
                {
                    "MakeItemIds": itemsId,
                    "RejectReason": reason
                })
            .pipe(map((res: any) => res.body));
    }

    madeItemsRemake(itemsId: Array<number>) {
        return this.httpService
            .post(`/api/v3/production/${this.productionId}/makeitems/remake`,
                {
                    "MadeItemIds": itemsId
                })
            .pipe(map((res: any) => res.body));
    }

    makeOfficerApprove(MakeItemIds: number[]) {
        return this.httpService
            .post(`/api/v3/productions/makeitems/approve`,
                {MakeItemIds})
            .pipe(map((res: any) => res.body));
    }

    // TODO:ROMAN Too large object everything breaksы
    clearingResponse(res) {
        const isObject = (obj) => {
            return {}.toString.call(obj).slice(8, -1) === 'Object';
        }
        const del = (obj) => {
            delete obj['$id'];
            delete obj['id'];
            delete obj['EntityKey'];
            delete obj['__contexts'];
            delete obj['__ID'];
            delete obj['__ISNEW'];
        }

        const check = obj => {
            for (let key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                if (Array.isArray(obj[key])) {
                    check(obj[key])

                } else if (isObject(obj[key])) {
                    del(obj[key])
                    check(obj[key])

                }
            }
        }

        del(res);
        check(res)
        return res
    }
    getMediaByVersionId(id: number): Observable<any> {
        return this.httpService
            .get(
                '/api/v3/version/' + id + '/media',
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }
}

