import {Observable} from "rxjs";
import {CoreService} from "../../../../../core/core.service";
import {Inject, Injectable} from "@angular/core";
import {HttpService} from "../../../../../services/http/http.service";
import {ManualDecisionTaskPartialType} from "../comp";
import { map } from 'rxjs/operators';


export type ManualDecisionType = {
    IsMandatory: boolean,
    Job: any,
    Task: any,
    Medias: any,
    Options: ManualDecisionOptionType[]
}

export type ManualDecisionOptionType = {
    Index: number,
    OptionName: string,
    ShortCode: string
}

@Injectable()
export class WorkflowDecisionService extends CoreService {
    constructor(@Inject(HttpService) _httpService: HttpService) {
        super(_httpService);
    }

    getManualDecision(id: number): Observable<ManualDecisionType> {
        return new Observable((observer: any) => {
            return this.httpService.get('/api/v3/task/manual-decision/' + id)
                .pipe(map((res:any) => res.body))
                .subscribe(
                    (res: ManualDecisionType) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    })
        })
    }

    saveManualDecision(id: number, data: ManualDecisionTaskPartialType): Observable<ManualDecisionType> {
        return new Observable((observer: any) => {
            return this.httpService.post('/api/v3/task/manual-decision/' + id,
                JSON.stringify(data))
                .pipe(map((res:any) => res.body))
                .subscribe(
                    (res: ManualDecisionType) => {
                        observer.next(res);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    })
        })
    }
}
