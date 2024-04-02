import { Injectable } from "@angular/core";
import {Observable} from "rxjs";
import { HttpService } from '../../../../services/http/http.service';
import {LayoutManagerModel, LayoutType} from "../models/layout.manager.model";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class LayoutManagerService {
  constructor(private httpService: HttpService) {
  }

    getSharedLayoutsForType(typeId: LayoutType): Observable<HttpResponse<any>> {
        return this.httpService.get('/api/v3/layout/allshared/' + typeId)
            .pipe(map((res: any) => {
                return res.body;
            }));
    };

  getLayouts(typeId: LayoutType): Observable<HttpResponse<any>> {
    return this.httpService.get('/api/v3/layouts/' + typeId)
      .pipe(map((res: any) => {
        return res;
      }));
  };

  getLayout(id): Observable<HttpResponse<any>> {
    return this.httpService.get('/api/v3/layout/' + id)
      .pipe(map((res: any) => {
        return res.body;
      }));
  };

  getDefaultLayout(typeId: LayoutType): Observable<HttpResponse<any>> {
    return this.httpService.get('/api/v3/layout/default/' + typeId)
      .pipe(map((res: any) => {
        return res.body;
      }));
  };

  deleteLayout(id): Observable<HttpResponse<any>> {
    return this.httpService.delete('/api/v3/layout/' + id)
      .pipe(map((res: any) => {
        return res.body;
      }));
  }

  saveLayout(model: LayoutManagerModel): Observable<HttpResponse<any>> {

    return this.httpService
      .post(
        '/api/v3/layout/' + model.Id,
        JSON.stringify(model)
      )
      .pipe(map((res: any) => {
        return res.body;
      }));
  }
}
