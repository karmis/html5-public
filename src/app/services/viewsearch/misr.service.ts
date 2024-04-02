/**
 * Created by Sergey Klimenko on 15.03.2017.
 */
import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import { map } from 'rxjs/operators';

/**
 * Misr service
 */

@Injectable()
export class MisrSearchService {

  constructor(public httpService: HttpService) {
  }

  getMediaData(id:string) {
    return this.httpService
      .get(
        '/api/v3/misr/' + id + '/media'
      )
      .pipe(map((resp: any) => {
        return resp.body;
      }));
  }

  getChartData(params) {
      let searchStr = '';
      let amp = '';
      let search = '';
      if(params) {
      if(params.channel || params.form){
        search = '?';
      }
      if(params.channel && params.form){
        amp = '&';
      }
      searchStr = "" + search + (params.channel ?'channel='+ params.channel : '') + amp + (params.form ? 'form=' + params.form : '');// + '&_='+new Date().getTime();
    }
    console.log(searchStr);
    return this.httpService
      .get(
        '/api/v3/misr/chart' + searchStr
      )
      .pipe(map((resp: any) => {
        return resp.body;
      }));
  }
}
