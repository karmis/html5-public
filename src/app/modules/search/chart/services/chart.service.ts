import {Injectable, Inject} from "@angular/core";
import {Observable,  Subscription } from "rxjs";
import {HttpService} from "../../../../services/http/http.service";
import { map } from 'rxjs/operators';


/**
 * Interface for Charts
 */
export interface ChartServiceInterface {
    httpService: HttpService;

    getMediaData(id:string): Observable<Subscription>;
    getChartData(params): Observable<Subscription>;
  /*
   DELETE
   DELETE
   DELETE
   DELETE
   */
    getReportings(): Observable<Subscription>;
    generateReporting(): Observable<Subscription>;
    getReportingParams(): Observable<Subscription>;
    getGeneratedReporting(guid): Observable<Subscription>;

  /*
   DELETE
   DELETE
   DELETE
   DELETE
   */
}
/**
 * Charts service
 */
@Injectable()
export class ChartService implements ChartServiceInterface {
    httpService;
    constructor(@Inject(HttpService) _httpService: HttpService) {
        this.httpService = _httpService;
    }
    getMediaData(id:string): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.httpService
                .get(
                '/api/v3/misr/' + id + '/media'
            )
                .pipe(map((resp: any) => {
                return resp.body;
            })).subscribe(
                (resp) => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });
    }

    getChartData(params): Observable<Subscription> {
        return new Observable((observer: any) => {
            var searchStr = '';
            var amp = '';
            var search = '';
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
            this.httpService
                .get(
                    '/api/v3/misr/chart' + searchStr
                )
                .pipe(map((resp: any) => {
                    return resp.body;
                })).subscribe(
                (resp) => {
                    observer.next(resp);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });
    }
  /*
   DELETE
   DELETE
   DELETE
   DELETE
   */
    getReportings(): Observable<Subscription>  {
      return this.httpService
        .get(
          '/api/get-reportings/1'
        )
        .pipe(map((resp: any) => {
          return resp.body;
        }));
    }

    getReportingParams(): Observable<Subscription>  {
      return this.httpService
        .get(
          '/api/reporting-params/180'
        )
        .pipe(map((resp: any) => {
          return resp.body;
        }));
    }



    generateReporting(): Observable<Subscription>  {
      return this.httpService
        .post(
          '/api/generate-reporting/179',
          JSON.stringify("")
        )
        .pipe(map((resp: any) => {
          return resp.body;
        }));
    }

    getGeneratedReporting(guid): Observable<Subscription>  {
      return this.httpService
        .get(
          '/api/get-reporting/' + guid
        )
        .pipe(map((resp: any) => {
          return resp;
        }));
    }
  /*
   DELETE
   DELETE
   DELETE
   DELETE
   */
}
