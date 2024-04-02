/**
 * Created by Pavel on 27.03.2017.
 */
import {Injectable} from '@angular/core';
import {HttpService} from "../http/http.service";
import {Observable} from "rxjs";
import { map} from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
/**
 * Workflow service
 */
@Injectable()
export class WorkflowService {

    constructor(private httpService: HttpService) {

    }

    getWorkflowDetails(id) {
        return this.httpService
            .get(
                '/api/v3/job/' + id
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getWorkflowDetailsBasic(id) {
        return this.httpService
            .get(
                '/api/v3/job/'+id+'/basic'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getWorkflowTaskDetails(id) {
        return this.httpService
            .get(
                '/api/v3/task/' + id + '/history'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getSampleWorkflowDetails() {
        return this.httpService
            .get(
                '/api/v3/job/132257'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }

    getWorkflowTaskAdvancedLog(id, ms: number, d?: string) {
        let _d = (d) ? '&d=' + d : '',
            _ms = (ms) ? ms : 0;

        return this.httpService
            .get(
                '/api/ums/logs/-/' + _ms + '?maxrows=100&level=50&taskid=' + id + _d
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }
    saveComponentQC(options): Observable<HttpResponse<any>> {
        return this.httpService
            .post(
                '/api/v3/task/componentqc',
                // '/api/v3/task/subtitleqc',
                JSON.stringify(options)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }
}
