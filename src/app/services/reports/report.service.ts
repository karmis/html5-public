/**
 * Created by Sergey Trizna on 25.05.2017.
 */
import { Injectable } from "@angular/core";
import { HttpService } from "../http/http.service";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

/**
 * Report service
 */
@Injectable()
export class ReportService {
    public moduleContext;

    constructor(private httpService: HttpService) {

    }

    // public getListOfReports() {
    //     return new Observable((observe) => {
    //         this.profileService.getUserProfile().subscribe((resp: any) => {
    //             this.httpService
    //                 .get('/api/rp/user/' + resp.UserID)
    //                 .pipe(map((listOfReports) => {
    //                     return listOfReports.body;
    //                 })).subscribe((listOfReports) => {
    //                 observe.next(listOfReports);
    //                 observe.complete();
    //             });
    //         });
    //
    //     });
    //
    // }

    public getListOfReports() {
        return new Observable((observer: any) => {
            this.httpService
                .get('/api/rp/user')
                .pipe(map((listOfReports: HttpResponse<any>) => {
                    return listOfReports.body;
                })).subscribe((listOfReports) => {
                observer.next(listOfReports);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });

        });
    }

    public getParamsByReport(id) {
        return this.httpService.get('/api/rp/params/' + id)
            .pipe(map((paramsForReport: HttpResponse<any>) => {
                return paramsForReport.body;
            }));
    }

    public generateReport(id, params) {
        let _params = JSON.stringify(params);
        return this.httpService.post('/api/rp/' + id + '/async/', _params)
            .pipe(map((resp: HttpResponse<any>) => {
                return resp.body;
            }));
    }

    public getReportByGUID(guid): any {
        return new Observable((observer: any) => {
            return this.httpService.get('/api/rp/status/' + guid, {responseType: 'blob'}).subscribe(
                (report: HttpResponse<Blob>) => {
                    let fr = new FileReader();
                    let self = this;
                    fr.onload = function () {
                        if (this.result == "false") {
                            observer.complete();
                            setTimeout(() => {
                                self.moduleContext.tryGetReport(guid);
                            }, 3000);
                        } else {
                            try {
                                let err = JSON.parse(this.result as any);
                                observer.error(err);
                            } catch (e) {
                                observer.next(report);
                            } finally {
                                observer.complete();
                            }
                        }
                    };
                    fr.readAsText(report.body);
                },
                (err) => {
                    observer.error(err);
                });
        });
    }
}
