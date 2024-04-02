import { Inject, Injectable } from '@angular/core';
import { CoreService } from '../../../core/core.service';
import { HttpService } from '../../../services/http/http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';


@Injectable()
export class MisrService extends CoreService {
    constructor(@Inject(HttpService) _httpService: HttpService) {
        super(_httpService);
        // debugger
    }

    getWorkflowsBy(ids: number[], type: 'media'|'version'|'tasks' = 'media'): Observable<any[]> {
        if(type == 'tasks') {
            return this.httpService.get(
                '/api/v3/search/workflow/raisedfrom/' + ids[0]
            ).pipe(map((res:any) => res.body));
        }
        else {
            return this.httpService.post(
                '/api/v3/search/workflow/' + type,
                JSON.stringify(ids)
            ).pipe(map((res:any) => res.body));
        }

    }

    getWorkflowsByVersions(ids: number[]): Observable<any[]> {
        return this.getWorkflowsBy(ids, 'version');
    }

    getWorkflowsByMedias(ids: number[]): Observable<any[]> {
        return this.getWorkflowsBy(ids, 'media');
    }

    getWorkflowsByTape(ids: number[], includelinkedmedia: boolean = true): Observable<any[]> {
        return this.httpService.post(
            '/api/v3/search/workflow/carriers?includelinkedmedia=' + includelinkedmedia,
            JSON.stringify(ids)
        ).pipe(map((res:any) => res.body));
    }

    getWorkflowsByTask(id: number): Observable<any[]> {
        return this.getWorkflowsBy([id], 'tasks');
    }

    getMisrForMediaById(id: number): Observable<any>{
        return this.httpService.get('/api/v3/misr/search/media/' + id).pipe(
            map(res => res.body))
    }

    raisePreviewWorkflow(id: number): Observable<any> {
        return this.httpService.post(
            '/api/v3/misr/raisepreview/' + id,
            JSON.stringify({})
        ).pipe(map((res:any) => res.body));
    }

    canRaisePreviewWf(): Observable<any>{
        return this.httpService.get('/api/v3/misr/canraisepreview').pipe(
            map(res => res.body))
    }
}
