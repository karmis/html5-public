import { Injectable } from "@angular/core";
import { HttpService } from "../../../../../services/http/http.service";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CarriesInsideTitlesService {

    constructor(private httpService: HttpService) {
    }

    getDigital(id: number): Observable<any> {
        return this.httpService
            .post(
                '/api/v3/media/' + id + '/carriers/digital',
                {
                    "Text": "",
                    "SearchCriteria": [],
                    "Page": 1,
                    "SortField": "",
                    "SortDirection": "desc",
                    "ExtendedColumns": [],
                    "DefaultSearchColumns": []
                }
            )
            // api/v3/media/{id}/carriers/digital
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }

    getPhysical(id: number): Observable<any> {
        return this.httpService
            .post(
                '/api/v3/media/' + id + '/carriers/physical',
                {
                    "Text": "",
                    "SearchCriteria": [],
                    "Page": 1,
                    "SortField": "",
                    "SortDirection": "desc",
                    "ExtendedColumns": [],
                    "DefaultSearchColumns": []
                }
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }

    getDigitalColumns(): Observable<any> {
        return this.httpService
            .get(
                '/api/view/info/digitalcarriers',
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }

    getPhysicalColumns(): Observable<any> {
        return this.httpService
            .get(
                '/api/view/info/TapeGrid',
            )
            .pipe(map((resp: any) => {
                return resp.body;
            }));
    }

}
