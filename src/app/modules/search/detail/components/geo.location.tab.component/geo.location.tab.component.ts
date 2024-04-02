import {
    Component,
    ViewEncapsulation, Injectable, ChangeDetectorRef, Injector, ChangeDetectionStrategy, ViewChild, ElementRef, Inject
} from '@angular/core';
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';
import {GeoService} from "./services/geo.location.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {GoogleMapsConfig} from "./config/geo.google.maps.config";
import {NotificationService} from "../../../../notification/services/notification.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'geo-location-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [GeoService, GoogleMapsConfig]
})
@Injectable()
export class GeoLocationTabComponent {
    config: any;
    compIsLoaded = false;
    lat: number = 0;
    lng: number = 0;
    private geolocationAvailable: boolean = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(
                @Inject(TranslateService) protected translate: TranslateService,
                private cdr: ChangeDetectorRef,
                private service: GeoService,
                private googleConfig: GoogleMapsConfig,
                private notificationService: NotificationService) {
    }
    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.loadGeo();
        }
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    private loadGeo() {
        if(!this.googleConfig.apiKey || this.googleConfig.apiKey == '') {
            this.notificationService.notifyShow(2, this.translate.instant('media_details.geolocation_no_api_key'));
        }
        this.service.getGeoLocation(this.config.file['ID']).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
                if (res) {
                    this.lat = parseFloat(res.Lat);
                    this.lng = parseFloat(res.Lon);
                    this.geolocationAvailable = true;
                } else {
                    this.geolocationAvailable = false;
                }
                this.compIsLoaded = true;
                this.cdr.detectChanges();
            }
        );
    };
    public loadComponentData() {
        if (!this.compIsLoaded) {
           this.loadGeo();
        }
    };
}
