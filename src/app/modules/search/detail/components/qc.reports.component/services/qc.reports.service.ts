import {map} from 'rxjs/operators';
import {HttpService} from '../../../../../../services/http/http.service';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class QcReportsService {

    constructor(public httpService: HttpService) {
    }

    getQcReports(taskId): Observable<any> {
        return this.httpService
            .get(
                '/api/v3/task/assess/' + taskId
            ).pipe(
                map((res: any) => {
                    return res.body;
                }));
    }

    getReportDetail(id, type) {
        return new Observable((observer: any) => {
            observer.next({
                id: 100,
                file: 'Some file',
                summary: 'Some summary',
                name: 'Product Name',
                version: 'Product Version',
                instance: 'Instance',
                creationDate: '12.12.2021',
                job: '1234567890',
                status: 'Report Status',
                rows: [
                    {
                        Synopsis: 'Bla bla bla for synopsis',
                        Check: 'Bla bla bla for synopsis',
                        Timecode: '10:10:10:10 - 10:11:11:11',
                        Level: 2,
                        selected: false
                    },
                    {
                        Synopsis: 'bla bla',
                        Check: 'NO NO NO bla bla bla bla',
                        Timecode: '23:23:23:23 - 23:23:23:23',
                        Level: 2,
                        selected: false
                    }, {
                        Synopsis: 'Synopsis Synopsis Synopsis Synopsis Synopsis',
                        Check: 'Check Check Check Check Check',
                        Timecode: '99:99:99:99 - 99:99:99:99',
                        Level: 0,
                        selected: false
                    }, {
                        Synopsis: 'Bla bla bla for synopsis',
                        Check: 'Bla bla bla for synopsis',
                        Timecode: '10:10:10:10 - 10:11:11:11',
                        Level: 1,
                        selected: false
                    }, {
                        Synopsis: 'dhdhfd dfdfkkdf dflaw wpw wpw wp w wp wp w',
                        Check: 'dgffdg gdfgdf gd yuko uhoerire eo3o3 458',
                        Timecode: '10:10:10:10 - 10:11:11:11',
                        Level: 2,
                        selected: false
                    }
                ]
            })
        })
    }
}
