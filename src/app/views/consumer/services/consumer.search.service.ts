import { SlickGridService } from '../../../modules/search/slick-grid/services/slick.grid.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConsumerSearchModel } from '../../../models/search/common/consumer.search';
import { ConsumerSearchResponse } from '../../../models/consumer/consumer.search.response';
import { Inject, Injector } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';
import { FinalSearchRequestType } from '../../../modules/search/slick-grid/types';
import { facetConsumerMapper } from '../../../modules/search/facets1/models/consumer.facets';

export class ConsumerSearchService extends SlickGridService {
    constructor(@Inject(HttpService) public httpService: HttpService, @Inject(Injector) public injector: Injector) {
        super(httpService, injector);
        // debugger
    }

    // searchSuggestion(text: string): Observable<HttpResponse<any>> {
    //     let reqsData = {
    //         'Text': text
    //     };
    //
    //     return this.httpService
    //         .post(
    //             '/api/v3/search-suggestion/',
    //             JSON.stringify(reqsData),
    //             {headers: headers}
    //         )
    //         .pipe(map((res: any) => {
    //             return res.body;
    //         }));
    // }

    doConsumerSearch(searchModel: ConsumerSearchModel, page: number = 1): Observable<ConsumerSearchResponse> {

        const options = this.getParamsForSearch(searchModel, page);

        if (searchModel.hasSpecialFields() && searchModel.hasCritsFromSuggestion()) {
            options.Text = '';
        }

        this.sessionStorage.retrieve({local: ['defaultSearchColumnsSimple']}).subscribe((setups) => {
            if (setups && setups.local && setups.local.defaultSearchColumnsSimple) {
                options['DefaultSearchColumns'] = JSON.parse(setups.local.defaultSearchColumnsSimple) || [];
            }
        });

        return this.httpService
            .post(
                '/api/unifiedsearch/',
                JSON.stringify(options)
            ).pipe(
                map((res: any) => {
                    return res.body;
                }),
                map((res: any) => {
                     res.Facets = (res.Facets==null) ? [] : facetConsumerMapper(res.Facets);
                     return res;
                }));
    }

    getParamsForSearch(
        searchModel: ConsumerSearchModel,
        page?,
        sortFieldVal?,
        sortDirectionVal?
    ): FinalSearchRequestType {
        const _sortDirection = sortDirectionVal ? sortDirectionVal : 'desc';
        const _sortFieldVal = sortFieldVal ? sortFieldVal : '';
        const _page = page ? page : 1;

        const json = Object.assign((searchModel as ConsumerSearchModel)._toJSON('ConsumerSearchModel'), {
            'Page': _page,
            'SortField': _sortFieldVal,
            'SortDirection': _sortDirection,
            'ExtendedColumns': this.extendedColumns
        });
        delete json.fromSuggestion;
        return json;
    }
}
