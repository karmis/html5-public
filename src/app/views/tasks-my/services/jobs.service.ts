/**
 * Created by Sergey Trizna on 22.02.2018.
 */

import {SessionStorageService} from "ngx-webstorage";
import {Injectable} from "@angular/core";
import {Observable,  Subscription } from "rxjs";
import {HttpService} from "../../../services/http/http.service";
import {WorkflowChangePriorityModel} from "../comps/wizards/priority/types";
import { map } from 'rxjs/operators';


@Injectable()
export class JobService {
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {
    }

    public assign(id: number, type: string, jobs: any[] = [], action: 'pass' | 'share' | 'passclear'): Observable<Subscription> {
        let reqsData = {
            jobs: jobs,
            assignTo: {type, id},
            action: action
        };

        return new Observable((observer: any) => {
            return this.httpService
                .post(
                    '/api/v3/tasks/assign',
                    JSON.stringify(reqsData),
                    {},
                    {},
                    false
                )
                .pipe(map((resp: any) => {
                    return resp.body;
                }))
                .subscribe(
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

    changePriority(model: WorkflowChangePriorityModel): Observable<Subscription> {
        return new Observable((observer: any) => {

            return this.httpService
                .post(
                    '/api/v3/tasks/priority',
                    JSON.stringify(model),
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
