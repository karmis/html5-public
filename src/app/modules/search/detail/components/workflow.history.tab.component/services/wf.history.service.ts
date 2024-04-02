import { Inject, Injectable, Injector } from "@angular/core";
import {SlickGridService} from "../../../../slick-grid/services/slick.grid.service";
import {Observable} from "rxjs";
import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {map} from "rxjs/operators";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../../../services/http/http.service";

@Injectable()
export class WFHistorySlickGridService extends SlickGridService {
    constructor(@Inject(HttpService) public httpService: HttpService, @Inject(Injector) public injector: Injector) {
        super(httpService, injector);
    }
    getRowsByIdWFHistory(ids: Array<number>) : Observable<any> {
        return new Observable((observer) => {
            this.httpService.post(
                '/api/v3/search/workflow/carriers?includeLinkedMedia=true&showInactiveWorkflows=true',
                JSON.stringify(ids))
                .pipe(map(response => (<HttpResponse<any>>response).body))
                .subscribe(
                    (resp) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    }
                );
        });
    }
}

