/**
 * Created by Sergey Trizna on 22.02.2018.
 */

import {SessionStorageService} from "ngx-webstorage";
import {Injectable} from "@angular/core";
import {Observable,  Subscription } from "rxjs";
import {HttpService} from "../../../services/http/http.service";
import { map } from 'rxjs/operators';


@Injectable()
export class WorkOrdersService {
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {
    }

    ResetChecks(id: number): Observable<Subscription> {
        return new Observable((observer: any) => {
            return this.httpService
                .post(
                    `/api/v3/resource-req/item/${id}/reset`,
                    '',
                    {},
                    {},
                    false
                ).pipe(map((resp: any) => {
                    return resp.body;
                })).subscribe(
                    (resp) => {
                        observer.next(resp);
                    },
                    (err) => {
                        observer.error(err);
                    },
                    () => {
                        observer.complete();
                    }
                );
        });
    }

}
