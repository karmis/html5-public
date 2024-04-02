import { Injectable, EventEmitter } from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import { map } from 'rxjs/operators';
import {HttpService} from "../../../../../../services/http/http.service";

@Injectable()
export class ChannelsGroupsService {
    private prefixStorageChannelsGroups = 'settings.channels-groups';
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {

    }

    getChannels() {
        return this.httpService
            .get(
                '/api/v3/config/channels'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getChannelsGroupsTable() {
        return this.httpService
            .get(
                '/api/v3/config/channel-groups'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changeConfigItem(item) {
        return this.httpService
            .post(
                '/api/v3/config/channel-group',
                item
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    clearChannelsGroupsTable(id: number){
        this.sessionStorage.clear(this.prefixStorageChannelsGroups + '.' + id);
    }

    saveSessionStorage(id, resp){
        let storageKey = this.prefixStorageChannelsGroups + '.' + id;
        this.sessionStorage.store(storageKey, resp);
    }
}
