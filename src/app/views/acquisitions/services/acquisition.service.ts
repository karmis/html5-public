import { Injectable } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';
import { map } from 'rxjs/operators';


/**
 * Media basket service
 */
@Injectable()
export class AcquisitionService {

  constructor(private httpService: HttpService) {
  }

  getData(searchString) {

    return this.httpService
      .post(
        '/api/v3/search/acq',
        JSON.stringify({'Text':searchString})
      )
      .pipe(map((res: any) => {
        return res.body;
      }));
  }

  getDetail(id) {
    return this.httpService
      .get(
        '/api/v3/acq/' + id
      )
      .pipe(map((res: any) => {
        return res.body;
      }));
  }
}
