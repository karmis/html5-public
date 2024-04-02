import { Inject, Injectable, Injector } from '@angular/core';
import {HttpService} from '../../../../../../services/http/http.service';
import {SlickGridService} from "../../../../slick-grid/services/slick.grid.service";
import {ServerGroupStorageService} from "../../../../../../services/storage/server.group.storage.service";
import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Observable} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {SearchModel} from "../../../../../../models/search/common/search";
import {TitlesSlickGridService} from "../../../../../../views/titles/modules/versions/services/slickgrid.service";
import {SlickGridRowData} from "../../../../slick-grid/types";

@Injectable()
export class TitlesTabGridService extends TitlesSlickGridService {
    constructor(@Inject(HttpService) httpService: HttpService, @Inject(Injector) public injector: Injector) {
        super(httpService, injector);
    }

    getRowsByIdCarrierToTitles(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<SlickGridRowData[]> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/carrier/' + id + '/titles';

            return this.search(
                'title',
                searchModel,
                undefined,
                undefined,
                undefined,
                url,
                extColumns
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
}
