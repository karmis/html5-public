/**
 * Created by Sergey Trizna on 28.12.2016.
 */
import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ServerGroupStorageService} from "../storage/server.group.storage.service";
import {SlickGridService} from "../../modules/search/slick-grid/services/slick.grid.service";


/**
 * Media search service
 */
@Injectable()
export class TableSearchService {
    private extendsFields;

    constructor(public httpService: HttpService, public sessionStorage: ServerGroupStorageService, public slickGridService: SlickGridService) {
    }

    /**
     * Search by parameters
     * @param searchType - search type as part of url
     * @param text - the string for search
     * @param page - page number
     * @param sortField - sort type for fields (asc or desc)
     * @param sortDirection sort type for direction (asc or desc)
     * @param searchCriteria - params from adv search
     * @returns {Observable<HttpResponse<any>>}
     */
    search(searchType: string,
           text: string,
           page: number,
           sortField?: string,
           sortDirection?: string,
           searchCriteria?: string | Array<string>) {
        let sortFieldVal = sortField ? sortField : '';
        let sortDirectionVal = sortDirection ? sortDirection : 'desc';
        let critsVal = searchCriteria ? searchCriteria : [];

        let reqsData = {
            'Text': text,
            'Page': page,
            'SortField': sortFieldVal,
            'SortDirection': sortDirectionVal,
            'SearchCriteria': critsVal,
            'ExtendedColumns': this.extendsFields
        };

        return this.httpService
            .post(
                '/api/v3/search/' + searchType,
                JSON.stringify(reqsData)
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }

    // getTableViews(tableViewType: string) {
    //     let lang = localStorage.getItem('tmd.base.settings.lang');
    //     if (lang) {
    //       lang = lang.replace(/\"/g,"");
    //     }
    //     return this.httpService
    //         .get(
    //             '/api/view/info/' + tableViewType + '?lang=' + lang
    //         )
    //         .pipe(map((resp: any) => {
    //             return resp.body;
    //         }));
    // }
    //
    // getTableView(tableViewType: string, id: string) {
    //     return this.httpService
    //         .get(
    //             '/api/view/' + tableViewType + '/' + id
    //         )
    //         .pipe(map((res: any) => {
    //             return res.body;
    //         }));
    //
    // }
    //
    // setExtendsColumns(columns) {
    //     this.extendsFields = columns;
    // }
    //
    // searchSuggestion(text: string) {
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
    //
    // doConsumerSearch(searchModel: ConsumerSearchModel): Observable<ConsumerSearchResponse> {
    //     let options = this.slickGridService.getParamsForSearch(searchModel);
    //     this.sessionStorage.retrieve({local: ['defaultSearchColumnsSimple']}).subscribe((setups) => {
    //         if (setups && setups.local && setups.local.defaultSearchColumnsSimple) {
    //             options['DefaultSearchColumns'] = JSON.parse(setups.local.defaultSearchColumnsSimple) || [];
    //         }
    //     });
    //
    //     return this.httpService
    //         .post(
    //             '/api/unifiedsearch/',
    //             JSON.stringify(options),
    //             {headers: headers}
    //         )
    //         .pipe(map((res: any) => {
    //             return res.body;
    //         }));
    // }
}
