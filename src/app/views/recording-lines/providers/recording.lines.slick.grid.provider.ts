import {Inject, Injector} from "@angular/core";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import {Observable} from "rxjs";
import {FinalSearchRequestType, SlickGridResp} from "../../../modules/search/slick-grid/types";
import {SearchModel} from "../../../models/search/common/search";

export class RecordingLinesSlickGridProvider extends SlickGridProvider {

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }
    getRowsById(id: number): Observable<SlickGridResp> {
        return new Observable((observer: any) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/version/' + id + '/media';
            let requestForSearch: FinalSearchRequestType = this.getRequestForSearch(searchModel);
            this.lastSearchModel = searchModel;

            this.config.componentContext.slickGridComp.service.search(
                'Media',
                searchModel,
                1,
                (requestForSearch && requestForSearch.SortField) || undefined,
                (requestForSearch && requestForSearch.SortDirection) || undefined,
                url,
                this.extendedColumns
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
