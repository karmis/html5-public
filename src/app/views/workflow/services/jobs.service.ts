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

    public assign(id: number, type: string, jobs: any[] = [], action: 'pass' | 'share' | 'passclear', route:'tasks'|'jobs'): Observable<Subscription> {
        let reqsData = {
            jobs: jobs,
            assignTo: {type, id},
            action: action
        };

        return new Observable((observer: any) => {
            return this.httpService
                .post(
                    '/api/v3/'+route+'/assign',
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

    public unassign(jobs: any[] = [], route:'tasks'|'jobs'): Observable<Subscription> {
        let reqsData = {
            jobs: jobs
        };

        return new Observable((observer: any) => {
            return this.httpService
                .post(
                    '/api/v3/' + route + '/unassign',
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
                    '/api/v3/jobs/priority',
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

    markResolved(model: any[]): Observable<Subscription> {
        return new Observable((observer: any) => {
            return this.httpService
                .post(
                    '/api/v3/jobs/markResolved',
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

    // delete(id): Observable<Subscription>  {
    delete(id): Observable<Subscription>  {

        return this.httpService
            .delete(
                '/api/v3/job/' + id
            )
            .pipe(map((res: any) => {
                return res.body;
            }));

    }

    deleteMulti(ids: number[]): Observable<Subscription>  {
        return this.httpService
            .post(
                '/api/v3/jobs/delete',
                JSON.stringify(ids)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
}
