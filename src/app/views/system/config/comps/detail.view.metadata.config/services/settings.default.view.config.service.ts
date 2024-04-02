import { Injectable } from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import { HttpService } from '../../../../../../services/http/http.service';
import { LookupService } from '../../../../../../services/lookup/lookup.service';
import { map } from 'rxjs/operators';


@Injectable()
export class DetailViewConfigService {
    private prefixStorageUserManager = 'settings.detailviewconfig';

    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService,
                private lookupService: LookupService) {

    }

    getViewsTree() {
        return this.httpService
            .get(
                '/api/v3/config/detailsviews'
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    resetConfigData(type, subtype, settingsGroupId) {
        return this.httpService
            .delete(
                '/api/v3/config/detailsview/'+settingsGroupId+'/'+type+'/' + subtype
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getConfigData(type, subtype, settingsGroupId) {
        return this.httpService
            .get(
                '/api/v3/config/detailsview/'+settingsGroupId+'/'+type+'/' + subtype
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }
    getEventAllConfigColumns() {return this.httpService
        .get(
            '/api/v3/config/eventreqdetails/configtypes'
        ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getEventConfigData() {
        return this.httpService
            .get(
                '/api/v3/config/eventreqdetails'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }
    updateEventConfig(data) {
        return this.httpService
            .post(
                '/api/v3/config/eventreqdetails',
                JSON.stringify(data)
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    saveFieldsForDetail(data, settingsGroupId) {
        return this.httpService
            .post(
                '/api/v3/config/detailsview/'+settingsGroupId,
                JSON.stringify(data)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }
}
