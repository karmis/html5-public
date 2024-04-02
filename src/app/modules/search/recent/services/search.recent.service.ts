/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import {Injectable} from "@angular/core";
import {RecentModel} from '../models/recent';
import {ServerStorageService} from "../../../../services/storage/server.storage.service";
import {Observable,  Subscription } from "rxjs";
import { MappingRaiseWfSettings } from '../../../../views/mapping/providers/mapping.slick.grid.provider';
import { JsonProvider } from '../../../../providers/common/json.provider';


export interface SearchRecentServiceInterface {
    serverStorage: any;
    jsonProvider: any;

    addRecentSearch(prefix: string, data: RecentModel, itemsLimit): Observable<Subscription>;
    storeRecentSearches(prefix: string, data: Array<RecentModel>): Observable<Array<RecentModel>>;
    retrieveRecentSearches(prefix, itemsLimit): Observable<Array<RecentModel>>;
    clearRecentSearches(prefix): Observable<Subscription>;
}

@Injectable()
export class SearchRecentService implements SearchRecentServiceInterface {
    constructor(public jsonProvider: JsonProvider,
                public serverStorage: ServerStorageService) {
    }

    addRecentSearch(prefix, data, itemsLimit): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.serverStorage.add(prefix, data, itemsLimit).subscribe((resp) => {
                observer.next(resp);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
    storeRecentSearches(prefix, data): Observable<Array<RecentModel>> {
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

    retrieveRecentSearches(prefix, itemsLimit): Observable<Array<RecentModel>> {
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

    clearRecentSearches(prefix): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.serverStorage.clear(prefix).subscribe(() => {
                observer.next(true);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
}
