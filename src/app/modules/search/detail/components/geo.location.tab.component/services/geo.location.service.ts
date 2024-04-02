
import {map} from 'rxjs/operators';
// api/v3/media/129336/geolocation
import {HttpService} from "../../../../../../services/http/http.service";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class GeoService {
    constructor(public httpService: HttpService) { }
    getGeoLocation(id): Observable<any> {
        return this.httpService
            .get(
                '/api/v3/media/' + id + '/geolocation'
            ).pipe(
            map((res: any) => {
                return res.body;
            }));
    }
}
