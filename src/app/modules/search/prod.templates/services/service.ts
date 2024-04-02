/**
 * Created by Sergey Trizna on 22.11.2017.
 */
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {SessionStorageService} from "ngx-webstorage";
import { map } from 'rxjs/operators';
import { HttpService } from 'app/services/http/http.service';

@Injectable()
export class ProductionTemplatesService {
    constructor(private httpService: HttpService,
                private sessionStorage: SessionStorageService) {
    }

    getProductionTemplatesService(): Observable<[]> {
        let key = 'prod.templates';
        let data = this.sessionStorage.retrieve(key);
        return new Observable((observer: any) => {
            if (!data) {
                return this.httpService
                    .get(
                        '/api/lookup/ProdTemplates'
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
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
        });
    };

}
