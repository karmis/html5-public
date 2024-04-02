/**
 * Created by IvanBanan 22.11.2019.
 */
import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { MappingItemListForSaveType } from '../../views/media-associate/comps/attach-confirm/attach-confirm-modal.component';

@Injectable()
export class MediaService {
    constructor(private httpService: HttpService) {
    }

    bindMediaToVersion(verId: number, prepared: {ItemList: MappingItemListForSaveType[]}): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.post(
                '/api/v3/version/' + verId + '/attach-media',
                JSON.stringify(prepared, this.httpService.getCircularReplacer())
                // JSON.stringify(prepared)
            ).pipe(map(response => (<HttpResponse<any>>response).body))
                .subscribe(
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
    bindMediaToMedia(mediaId: number, sourceId: number): Observable<any> {
        return new Observable((observer: any) => {

            this.httpService.post(
                '/api/v3/media/' + mediaId + '/associate/' + sourceId,
                ''
            ).pipe(map(response => (<HttpResponse<any>>response).body))
                .subscribe(
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

    unbindMedia(midId: number) {
        return new Observable((observer: any) => {

            this.httpService.post(
                '/api/v3/media/' + midId + '/unattach',
                ''
            ).pipe(map(response => (<HttpResponse<any>>response).body))
                .subscribe(
                    (resp) => {
                        observer.next(resp);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    }
                );
        });
        // api/v3/media/{id}/unattach
    }
    unbindMediaArray(midIds: number[]) {
        return new Observable((observer: any) => {

            this.httpService.post(
                '/api/v3/media/unattach',
                JSON.stringify(midIds)
            ).pipe(map(response => (<HttpResponse<any>>response).body))
                .subscribe(
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

}
