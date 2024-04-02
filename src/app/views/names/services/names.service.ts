import {Injectable} from '@angular/core';
import {HttpService} from "../../../services/http/http.service";
import { map } from 'rxjs/operators';


/**
 * Media basket service
 */
@Injectable()
export class NamesService {

    constructor(private httpService: HttpService) {
    }

    getData(data) {
        let req = {"Text": data, "Page": "1"};
        return this.httpService
            .post(
                '/api/v3/search/names',
                JSON.stringify(req)
            ).pipe(map((res: any) => {
                return res.body;
            }));
    }

    getChildData(id, parentId) {
        return this.httpService
            .get(
                '/api/v3/search/names/' + id  + '?treeParentId=' + parentId
            ).pipe(map((res: any) => {
                return res.body;
            }));
    }

    addName(data) {
        return this.httpService
            .post(
                '/api/v3/name',
                JSON.stringify(data)
            ).pipe(map((res: any) => {
                return res.body;
            }));
    }

    editName(data, id) {
        return this.httpService
            .put(
                '/api/v3/name/' + id,
                JSON.stringify(data)
            )
            .pipe(map((res: any) => {
                return res.body;
            }));
    }

    getDetail(id) {
        return this.httpService
            .get(
                '/api/v3/name/' + id
            ).pipe(map((res: any) => {
                return res.body;
            }));
    }
}
