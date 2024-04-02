import { CoreService } from '../../../../core/core.service';
import { HttpService } from '../../../../services/http/http.service';
import { Observable, Subscription } from 'rxjs';
import { RecentModel } from '../../recent/models/recent';
import { JsonProvider } from '../../../../providers/common/json.provider';
import { ServerStorageService } from '../../../../services/storage/server.storage.service';
import { Inject, Injectable } from '@angular/core';
import { AscDescType } from '../columns.order';

@Injectable()
export class ColumnsOrderService extends CoreService {
    constructor(
        @Inject(HttpService) public httpService: HttpService,
        public jsonProvider: JsonProvider,
        public serverStorage: ServerStorageService
    ) {
        super(httpService);
    }

    update(prefix, data): Observable<Array<RecentModel>> {
        return new Observable((observer: any) => {
            this.serverStorage.store(prefix, data).subscribe((resp) => {
                observer.next(resp);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    retrieve(prefix, itemsLimit = 0): Observable<{ [key: string]: AscDescType }> {
        return new Observable((observer: any) => {
            this.serverStorage.retrieve([prefix], true, itemsLimit).subscribe((res: any) => {
                let data = res && res[0].Value;
                data = this.jsonProvider.isValidJSON(data)
                    ? JSON.parse(data)
                    : data || null;
                observer.next(data);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
}
