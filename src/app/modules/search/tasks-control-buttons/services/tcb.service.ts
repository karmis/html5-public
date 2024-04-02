import {Injectable} from "@angular/core";
import {HttpService} from "../../../../services/http/http.service";
import {Observable} from "rxjs";
import { map } from 'rxjs/operators';
@Injectable()
export class TasksControlButtonsService {
    constructor(private httpService: HttpService) {
    }
    public saveTaskStatus(id: number, status: string, message?: string, preErrorText?: string): Observable<any> {

        return new Observable((observer: any) => {
            this.httpService.put(
                '/api/v3/task/status/' + id + '/' + status,
                JSON.stringify(message) || '',
                {},
                {preErrorText: preErrorText}
            ).pipe(map(res => res.body))
                .subscribe(
                    (res: any) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
        });
    }

    public restartTask(id: number, message?: string, preErrorText?: string): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.put(
                '/api/v3/task/' + id + '/restart',
                JSON.stringify(message) || '',
                {},
                {preErrorText: preErrorText}).pipe(
                map(res => res.body))
                .subscribe(
                    (res: any) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
        });
    }

    public restartTasks(ids: number[], message?: string, preErrorText?: string): Observable<any> {
        let _body = {
            Tasks: ids,
            Message: message
        };
        return new Observable((observer: any) => {
            this.httpService.post(
                '/api/v3/tasks/restart',
                JSON.stringify(_body) || '',
                {},
                {preErrorText: preErrorText}).pipe(
                map(res => res.body))
                .subscribe(
                    (res: any) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
        });
    }

    public unlockTask(id: number): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.put(
                '/api/v3/task/unlock/' + id,
                ''
            ).pipe(map((res:any) => res.body))
                .subscribe(
                    (res: any) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
        });
    }

    public assignTaskTo(taskId, userId): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.post(
                '/api/v3/tasks/assign/',
                JSON.stringify({
                    "jobs": [
                        taskId
                    ],
                    "assignTo": {
                        "type": "User",
                        "id": userId
                    },
                    "action": "pass"
                })
            ).pipe(map((res:any) => res.body))
                .subscribe(
                    (res: any) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
        });
    }
}
