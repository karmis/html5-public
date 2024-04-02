import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpService } from '../../../../services/http/http.service';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class LocatorsService {
  constructor(private httpService: HttpService) {
  }
  getDetailMediaTagging(guid): Observable<HttpResponse<any>> {
    return this.httpService.get('/api/v3/media-tagging/' + guid)
      .pipe(map((res: any) => {
        return res.body;
      }));
  };
  saveMediaTagging(options, guid): Observable<HttpResponse<any>> {
    return this.httpService
      .post(
        '/api/v3/media-tagging/' + guid ,
        JSON.stringify(options)
      )
      .pipe(map((res: any) => {
        return res.body;
      }));
  }
}
