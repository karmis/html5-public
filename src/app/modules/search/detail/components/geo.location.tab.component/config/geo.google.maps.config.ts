import {
    Component,
    ViewEncapsulation, Injectable, ChangeDetectorRef, Injector, ChangeDetectionStrategy
} from '@angular/core';
import {ServerGroupStorageService} from "../../../../../../services/storage/server.group.storage.service";
import {NotificationService} from "../../../../../notification/services/notification.service";

@Injectable()
export class GoogleMapsConfig {
    apiKey: string = '';
    constructor(private serverGroupStorageService: ServerGroupStorageService) {
        this.serverGroupStorageService.retrieve({global: [], local: ['googleMapsApiSettings']}).subscribe((res:any) => {
            if (!res.local['googleMapsApiSettings']) {
                return;
            }
            let temp = JSON.parse(res.local['googleMapsApiSettings'] || null);
            if(temp && temp.apiKey !== '') {
                this.apiKey = temp.apiKey;
            }
        });

        // this.apiKey = 'AIzaSyAbd0nt7c2ug3sv_0KxojfDTwIqCTqpE74';
    }
}
