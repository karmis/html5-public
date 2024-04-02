/**
 * Created by Sergey Trizna on 23.01.2018.
 */
import { Inject, Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import {
    ColumnOrderSetupsType,
    SlickGridService
} from "../../../../../modules/search/slick-grid/services/slick.grid.service";
import { SearchModel } from '../../../../../models/search/common/search';
import { SlickGridProvider } from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { FinalSearchRequestType } from '../../../../../modules/search/slick-grid/types';
import { HttpResponse } from '@angular/common/http';
import { HttpService } from '../../../../../services/http/http.service';

@Injectable()
export class TitlesSlickGridService extends SlickGridService {
    constructor(@Inject(HttpService) public httpService: HttpService, @Inject(Injector) public injector: Injector) {
        super(httpService, injector);
    }

    getRowsByIdTitlesToVersions(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<any> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/title/' + id + '/versions';
            if (provider)
                provider.lastSearchModel = searchModel;
            return this.search('title', searchModel, undefined, undefined, undefined, url, extColumns).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getRowsByIdAssocMedia(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<HttpResponse<any>> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/media/related/' + id;
            if (provider)
                provider.lastSearchModel = searchModel;
            return this.search(
                'Media',
                searchModel,
                undefined,
                undefined,
                undefined,
                url,
                extColumns
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getRowsByIdLinkedMedia(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<HttpResponse<any>> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/media/linked/' + id;
            if (provider)
                provider.lastSearchModel = searchModel;
            return this.search(
                'Media',
                searchModel,
                undefined,
                undefined,
                undefined,
                url,
                extColumns
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getRowsByIdChildMedia(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<HttpResponse<any>> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/media/' + id + '/media';
            if (provider)
                provider.lastSearchModel = searchModel;
            return this.search(
                'Media',
                searchModel,
                undefined,
                undefined,
                undefined,
                url,
                extColumns
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getRowsByIdVersionsToMedia(id: number,
                               extColumns: string[] = [],
                               page: number = 1,
                               provider: SlickGridProvider = null,
                               colOrderSetups?: ColumnOrderSetupsType
    ): Observable<HttpResponse<any>> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/version/' + id + '/media';
            let requestForSearch: FinalSearchRequestType = null;
            if (provider) {
                provider.lastSearchModel = searchModel;
                requestForSearch = provider.getRequestForSearch(searchModel);
            }

            return this.search(
                'Media',
                searchModel,
                page,
                (requestForSearch && requestForSearch.SortField) || undefined,
                (requestForSearch && requestForSearch.SortDirection) || undefined,
                url,
                extColumns,
                colOrderSetups
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getRowsByIdCarrierToMedia(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<HttpResponse<any>> {

        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/carrier/' + id + '/media';
            if (provider)
                provider.lastSearchModel = searchModel;
            return this.search(
                'Media',
                searchModel,
                undefined,
                undefined,
                undefined,
                url,
                extColumns
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getRowsByIdCarrierToVersions(id: number, extColumns: string[] = [], provider: SlickGridProvider = null): Observable<HttpResponse<any>> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const url = '/api/v3/carrier/' + id + '/versions';
            if (provider)
                provider.lastSearchModel = searchModel;
            return this.search(
                'Versions',
                searchModel,
                undefined,
                undefined,
                undefined,
                url,
                extColumns
            ).subscribe((res: any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
}
