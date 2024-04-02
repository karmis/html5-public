import { Injectable } from '@angular/core';
import {HttpService} from "../../../../../../services/http/http.service";
import { map } from 'rxjs/operators';


@Injectable()
export class LoadMasterService {
    constructor(private httpService: HttpService) {

    }

    getTable() {
        return this.httpService
            .get(
                '/api/v3/config/loadmaster'
            )
            .pipe(map((res: any) => {
                return res.body;
            }));

    }

    deleteTask(itemToDelete) {
        return this.httpService
            .post(
                '/api/v3/config/loadmaster',
                JSON.stringify(itemToDelete)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));

    }

    editTask(data) {

        return this.httpService
            .post(
                '/api/v3/config/loadmaster',
                JSON.stringify(data)
            ).pipe(
            map((res: any) => {
                return res.body;
            }));

    }
}
