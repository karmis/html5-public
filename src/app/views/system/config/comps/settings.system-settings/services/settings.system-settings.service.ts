import { Injectable } from '@angular/core';
import {HttpService} from "../../../../../../services/http/http.service";
import { catchError, map } from 'rxjs/operators';
import { NotificationService } from "../../../../../../modules/notification/services/notification.service";
import { throwError } from "rxjs";


@Injectable()
export class SystemSettingsService {
    constructor(private httpService: HttpService,
                private notificationService: NotificationService) {

    }

    getTable() {
        return this.httpService
            .get(
                '/api/v3/mfx-settings',
            )
            .pipe(map((res: any) => {
                return res.body;
            }), catchError(this.handlerError));

    }

    getGroups() {
        return this.httpService
            .get(
                '/api/v3/mfx-settings/groups'
            )
            .pipe(map((res: any) => {
                return res.body;
            }), catchError(this.handlerError));

    }

    saveSetting(item) {
        return this.httpService
            .put(
                '/api/v3/mfx-settings',
                JSON.stringify(item)
            )
            .pipe(map((res: any) => {
                return res.body;
            }), catchError(this.handlerError));
    }

    export(items) {

        return this.httpService
            .put(
                '/api/v3/mfx-settings/export',
                JSON.stringify(items)
            )
            .pipe(map((res: any) => {
                return res.body;
            }), catchError(this.handlerError));

    }

    import(item) {
        return this.httpService
            .put(
                '/api/v3/mfx-settings/import',
                "\"" + item.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + "\""
            )
            .pipe(map((res: any) => {
                return res.body;
            }), catchError(this.handlerError));

    }

    private handlerError = (error) => {
        this.notificationService.notifyShow(2, "settings_group.error", true, 1200)
        return throwError(error)
    }
}
