import { EventEmitter, Inject, Injector, Output } from "@angular/core";
import { DetailProvider } from "../../../modules/search/detail/providers/detail.provider";
import { ConfigService } from "../../../services/config/config.service";
import { DetailConfig } from "../../../modules/search/detail/detail.config";
import { TaxonomyService } from "../../../modules/search/taxonomy/services/service";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionStorageService } from "ngx-webstorage";
import { Location } from "@angular/common";
import { MediaDetailResponse } from '../../../models/media/detail/media.detail.response';
import {
    MediaDetailDetailsViewResponse
} from '../../../models/media/detail/detailsview/media.detail.detailsview.response';
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import { LocatorsService } from "../../../modules/controls/locators/services/locators.service";
import { NotificationService } from "../../../modules/notification/services/notification.service";

export class MediaLoggerProvider extends DetailProvider {
    @Output() onGetMediaTaggingForSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSavedMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    config: DetailConfig;
    itemsMediaSeries: Array<any>;
    itemsMediaList: Array<any>;
    public locatorsService: LocatorsService = null;

    constructor(@Inject(TaxonomyService) public taxonomyService: TaxonomyService,
                @Inject(ActivatedRoute) public route: ActivatedRoute,
                @Inject(Location) public location: Location,
                @Inject(SessionStorageService) public storage: SessionStorageService,
                @Inject(Router) public router: Router,
                @Inject(TranslateService) public translate: TranslateService,
                @Inject(Injector) public injector: Injector,
                protected notificationRef: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationRef);
        this.locatorsService = this.injector.get(LocatorsService);
    }

    commonDetailInit() {
        this.itemsMediaSeries = [];
        this.itemsMediaList = [];
        // request for init cache
        this.taxonomyService.getTaxonomy().subscribe();
        this.moduleContext.config.options.allRequetsReady = 0;
        // get file info from rest
        this.config.options.service.getDetails(
            this.getDetailId(),
            this.config.options.appSettings.getSubtypes(),
            this.config.options.typeDetails,
            this.config.options.detailsviewType).subscribe(
            (resp: (MediaDetailResponse & MediaDetailDetailsViewResponse)[]) => {
                this.config.options.file = resp[0];

                this.setThumb(this.config.options.file);

                this.config.options.provider.setVideoBlock();
                this.moduleContext.goldenConfig = $.extend(true, {}, this.moduleContext.defaultGoldenConfig, {
                    componentContext: <any>null,
                    moduleContext: this,
                    appSettings: this.config.options.appSettings,
                    providerType: this.config.providerType,
                    options: {
                        file: this.config.options.file || {},
                        columnData: resp[1].Groups,
                        lookup: this.config.options.friendlyNamesForDetail,
                        typeDetailsLocal: this.config.options.typeDetailsLocal,
                        typeDetails: this.config.options.typeDetails,
                        tabs: this.config.options.tabsData,
                        params: this.config.options.mediaParams,
                        layoutConfig: this.config.layoutConfig,
                        titleForStorage: 'mediaLogger',
                        series: []//resp[1] // this.itemsMediaSeries
                    },
                });

                this.moduleContext.golden && this.moduleContext.golden.changeLayout.emit(this.moduleContext.goldenConfig.options.file);
                this.moduleContext.cd.markForCheck();
                this.moduleContext.cd.detectChanges();
                console.log('Done');
            }
        );
    }

    setThumb(file) {
        if (Object.keys(file).length === 0) {
            return;
        }
        if (file.THUMBID === -1) {
            file.THUMBURL = this.config.options.defaultThumb;
        } else {
            file.THUMBURL = ConfigService.getAppApiUrl() + '/getfile.aspx?id=' + file.THUMBID;
        }
    };

    /**
     * get columns friendly names from rest or storage
     */
    getColumnsFriendlyNames(): any {
        this.config.options.service.getLookups(this.config.options.friendlyNamesForDetail).subscribe(
            (resp) => {
                this.config.options.userFriendlyNames = resp;
                this.setColumnsFriendlyNames(resp);
            }
        );
    };

    setColumnsFriendlyNames(names): any {
        this.moduleContext.goldenConfig.options.friendlyNames = names;
        this.moduleContext.cd.detectChanges();
    };

    loadTagging(id): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.locatorsService.getDetailMediaTagging(id).subscribe(resp => {
                observer.next(resp);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

}
