import { Inject, Injectable, Injector } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';
import { Observable } from 'rxjs';
import {SlickGridService} from "../../../modules/search/slick-grid/services/slick.grid.service";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class CachemanagerService extends SlickGridService {
    constructor(@Inject(HttpService) public httpService: HttpService, @Inject(Injector) public injector: Injector) {
        super(httpService, injector);
    }

    lockItemInCache(id, devid, flag): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.post(
                '/api/v3/cachemanager/lock?id=' + id + '&devid=' + devid + '&flag=' + flag,
                '')
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
    forceItemInCache(id, flag): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.post(
                '/api/v3/cachemanager/force?id=' + id + '&flag=' + flag,
                '')
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
    resetChecksInSubRow(id, devid): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.post(
                '/api/v3/cachemanager/reset-checks?id=' + id + '&devid=' + devid,
                '')
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
