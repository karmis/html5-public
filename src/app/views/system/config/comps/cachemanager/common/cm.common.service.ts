import { HttpService } from '../../../../../../services/http/http.service';
import { SessionStorageService } from 'ngx-webstorage';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

export type CacheManagerAvailableTypes = 'destinationdevices' | 'destinationdevice' |
    'sourcedevices' | 'sourcedevice' |
    'channeltemplates' | 'channeltemplate' | 'workflowmatrix' |
    // misr
    'TM_CFG_MISR' | 'TM_CFG_MISR_ITEMS' | 'channels' | 'channelschedule'
    null;

@Injectable()
export class CacheManagerCommonService {
    constructor(public httpService: HttpService,
                public sessionStorage: SessionStorageService) {
    }
    public path: string = 'config/cachemanager';

    getList(name: CacheManagerAvailableTypes) {
        return this.httpService
            .get(
                `/api/v3/${this.path}/${name}`
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    save(name: CacheManagerAvailableTypes, data, path: string = null) {
        delete data['id'];
        return this.httpService
            .post(
                `/api/v3/${path?path:this.path}/${name}`,
                JSON.stringify(data)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    delete(name: CacheManagerAvailableTypes, data) {
        delete data['id'];
        data.ID = '-' + data.ID;
        return this.httpService
            .post(
                `/api/v3/${this.path}/${name}`,
                JSON.stringify(data)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
}
