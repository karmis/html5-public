
import {map} from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { HttpService } from "../../../services/http/http.service";
import { Observable } from 'rxjs';

@Injectable()
export class QueuesService {
    constructor(private httpService: HttpService) {
    }

    savePositionBefore(id: number, beforeId: number): Observable<any> {
        return this.httpService.put(
            '/api/v3/queues/reorder/' + id + '/before/' + beforeId,
            null
        ).pipe(map((res: any) => res.body));
    }

    savePositionFirst(id: number): Observable<any> {
        return this.httpService.put(
            '/api/v3/queues/reorder/'+id+'/first',
            null
        ).pipe(map((res: any) => res.body));
    }

    savePositionLast(id: number): Observable<any> {
        return this.httpService.put(
            '/api/v3/queues/reorder/'+id+'/last',
            null
        ).pipe(map((res: any) => res.body));
    }

    setPriority(id: number, priority: number): Observable<any> {
        return this.httpService.put(
            '/api/v3/queues/'+id+'/priority/'+priority,
            null
        ).pipe(map((res: any) => res.body));
    }

    clearQueueId(id: number): Observable<any> {
        return this.httpService.post(
            `/api/v3/queues/${id}/clearqueueid`,
            ''
        ).pipe(map((res: any) => res.body));
    }
    setQueueId(id: number, queueId: number): Observable<any> {
        return this.httpService.post(
            `/api/v3/queues/${id}/set/${queueId}`,
            ''
        ).pipe(map((res: any) => res.body));
    }
}
