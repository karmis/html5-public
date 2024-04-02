import { Injectable } from "@angular/core";
import {Observable} from "rxjs";
import {HttpService} from "../../../../../../services/http/http.service";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class AiTabService {
  constructor(private httpService: HttpService) {
  }

  getAiData(id): Observable<HttpResponse<any>> {
    return this.httpService.get('/api/v3/ai-tags/' + id)
      .pipe(map((res: any) => {
        return res.body;
      }));
  };
}
