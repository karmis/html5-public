
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import { HttpService } from '../../../../../../services/http/http.service';
import { LookupService } from '../../../../../../services/lookup/lookup.service';


@Injectable()
export class DetailViewCustommetadataConfigService {
    private prefixStorageUserManager = 'settings.detailviewcustomconfig';

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService,
                private lookupService: LookupService) {

    }

    resetConfigData(id) {
        return this.httpService
            .delete(
                '/api/v3/config/detailsview/'+id
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getConfigData(type, subtype) {
        return this.httpService
            .get(
                '/api/v3/config/detailsview/'+type+'/' + subtype
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    saveFieldsForDetail(data) {
        return this.httpService
            .post(
                '/api/v3/config/detailsview',
                JSON.stringify(data)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }
}
