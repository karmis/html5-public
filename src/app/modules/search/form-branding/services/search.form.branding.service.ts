/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {Injectable, Inject} from "@angular/core";
import {Observable} from "rxjs";
import { Subscription } from 'rxjs';
import {HttpService} from "../../../../services/http/http.service";
import { map } from 'rxjs/operators';


/**
 * Search form service search
 */
export interface SearchFormServiceInterface {
    httpService: HttpService;

    /**
     * Search suggestions
     * @param text
     */
    searchSuggestion(text: string, searchType: string): Observable<Subscription>;
}
/**
 * Search form service
 */
@Injectable()
export class SearchFormBrandingService implements SearchFormServiceInterface {
    constructor(@Inject(HttpService) public httpService: HttpService) {
    }

    searchSuggestion(text: string, searchType: string): Observable<Subscription> {
        return Observable.create((observer) => {
            let reqsData = {
                'Text': text,
                'SearchType': searchType
            };

            this.httpService.post(
                '/api/v3/search-suggestion/',
                JSON.stringify(reqsData)
            ).pipe(map((res: any) => {
                return res.body;
            })).subscribe(
                (resp) => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            )
        });
    }
}
