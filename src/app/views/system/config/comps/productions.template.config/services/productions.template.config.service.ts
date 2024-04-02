import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import {HttpService} from "../../../../../../services/http/http.service";


@Injectable()
export class ProductionsTemplateConfigService {
    constructor(private httpService: HttpService) {

    }

    getTemplateConfigList() {
        return this.httpService
            .get(
                '/api/v3/config/production/templateconfigs'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getTemplateConfigTypes() {
        return this.httpService
            .get(
                '/api/v3/config/production/templateconfigtypes'
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    getTemplateConfigById(id) {
        return this.httpService
            .get(
                '/api/v3/config/production/templateconfig/' + id
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    updateTemplateConfig(data) {
        return this.httpService
            .post(
                '/api/v3/config/production/templateconfig',
                JSON.stringify(data)
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    deleteTemplateConfigById(id) {
        return this.httpService
            .delete(
                '/api/v3/config/production/templateconfig/' + id
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }
}
