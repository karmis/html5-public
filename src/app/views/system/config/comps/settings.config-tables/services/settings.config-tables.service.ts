import { Injectable, EventEmitter } from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import {HttpService} from "../../../../../../services/http/http.service";
import { map } from 'rxjs/operators';

@Injectable()
export class ConfigTablesService {
    private prefixStorageConfigTables = 'settings.config-tables';
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {

    }

    getConfigTables() {
        return this.httpService
            .get(
                '/api/v3/config-tables'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));

    }

    getConfigTable(id) {
        return this.httpService
            .get(
                '/api/v3/config-table/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    changeConfigTableItem(tableid, item) {
        return this.httpService
            .post(
                '/api/v3/config-table/' + tableid,
                item
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    clearSettingsConfigTablesById(id: number){
        this.sessionStorage.clear(this.prefixStorageConfigTables + '.' + id);
    }

    saveSessionStorage(id, resp){
        let storageKey = this.prefixStorageConfigTables + '.' + id;
        this.sessionStorage.store(storageKey, resp);
    }
}
