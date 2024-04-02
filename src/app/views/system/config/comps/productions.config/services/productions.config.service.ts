import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpService} from "../../../../../../services/http/http.service";


@Injectable()
export class ProductionsConfigService {
    constructor(private httpService: HttpService) {

    }

    getProductionConfigsList() {
        return this.httpService
            .get(
                '/api/v3/config/production/templates'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getViewByTemplateConfigId(id) {
        return this.httpService
            .get(
                '/api/v3/config/production/templateconfig/'+id+'/view'
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    getProductionConfigById(id) {
        return this.httpService
            .get(
                '/api/v3/config/production/template/' + id
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    updateProductionConfig(data) {
        return this.httpService
            .post(
                '/api/v3/config/production/template',
                JSON.stringify(data)
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    deleteProductionConfigById(id) {
        return this.httpService
            .delete(
                '/api/v3/config/production/template/' + id
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }
}
