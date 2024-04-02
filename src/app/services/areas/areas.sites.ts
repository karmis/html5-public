/**
 * Created by Sergey Trizna on 21.02.2018.
 */
/**
 * Created by Sergey Trizna on 21.02.2018.
 */

import {SessionStorageService} from "ngx-webstorage";
import {HttpService} from "../http/http.service";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import { map } from 'rxjs/operators';

@Injectable()
export class AreasSitesService {
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {
    }

    getAreas(val: string) {
        let key = 'areas.sites.' + val;
        let data: any = this.sessionStorage.retrieve(key);

        return new Observable((observer: any) => {
                if (!data) {
                    this.httpService.get('/areas/sites/' + val)
                        .pipe(map((res:any) => res.body))
                        .subscribe(
                            (res: any) => {
                                this.sessionStorage.store(key, res);
                                observer.next(res);
                            }, (err) => {
                                observer.error(err);
                            }, () => {
                                observer.complete();
                            });
                } else {
                    //toDo support async init
                    //to make observable asynchronous
                    // Promise.resolve()
                    //     .then(() => {
                            observer.next(data);
                            observer.complete();
                        // });
                }
            }
        );
    }
}
