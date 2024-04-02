/**
 * Created by Sergey Trizna on 10.10.2017.
 */
import { Injectable } from '@angular/core';
import { HttpService } from '../../../services/http/http.service';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class ExportService {
    httpService;

    constructor(_httpService: HttpService) {
        this.httpService = _httpService;
    }

    getExportData(data, params): Observable<Blob> {
        return new Observable((observer: any) => {
            let apiUrl = '/api/v3/search/export';
            if (params.useCustomApiUrl) {
                apiUrl = params.customApiUrl;
            }
            this.httpService.post(
                apiUrl,
                JSON.stringify(data),
                {
                    responseType: 'blob'
                })
                .pipe(map(response => (<HttpResponse<Blob>>response).body))
                .subscribe(
                    (resp) => {
                        observer.next(resp);
                    },
                    (error) => {
                        observer.error(error);
                    },
                    () => {
                        observer.complete();
                    }
                );
        });
    }
}
