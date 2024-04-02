import { Injectable, EventEmitter } from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import { map } from 'rxjs/operators';
import {HttpService} from "../../../../../../services/http/http.service";

@Injectable()
export class ChannelsService {
    private prefixStorageChannels = 'settings.channels';
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {

    }

    getChannelsTable() {
        return this.httpService
            .get(
                '/api/v3/config/channels'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changeConfigItem(item) {
        return this.httpService
            .post(
                '/api/v3/config/channel',
                item
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    clearChannelsTable(id: number){
        this.sessionStorage.clear(this.prefixStorageChannels + '.' + id);
    }

    saveSessionStorage(id, resp){
        let storageKey = this.prefixStorageChannels + '.' + id;
        this.sessionStorage.store(storageKey, resp);
    }
}
