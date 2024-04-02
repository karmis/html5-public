/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import { Inject, Injectable, Injector } from "@angular/core";
import {HttpService} from "../../../../../services/http/http.service";
import {Observable} from "rxjs";
import {SlickGridService} from "../../../../../modules/search/slick-grid/services/slick.grid.service";
import { map } from 'rxjs/operators';

@Injectable()
export class MediaGridService extends SlickGridService {
    constructor(@Inject(HttpService) public httpService: HttpService, @Inject(Injector) public injector: Injector) {
        super(httpService, injector);
    }

    getRowsById(id: number): Observable<any> {
        return this.httpService
            .get(
                '/api/v3/version/' + id + '/media',
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }
}
