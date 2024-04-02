import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Inject,
    ViewChild
} from '@angular/core';
import {ActivatedRoute, Router } from "@angular/router";
import { MediaLoggerService } from "./services/media.logger.service";
import { MediaAppSettings } from '../media/constants/constants';
import { Location } from '@angular/common';
import { DetailConfig } from '../../modules/search/detail/detail.config';

import { MediaLoggerProvider } from "./providers/media.logger.provider";
import { DetailService } from '../../modules/search/detail/services/detail.service';

import { TimecodeProvider } from '../../modules/controls/html.player/providers/timecode.provider';
import { NotificationService } from '../../modules/notification/services/notification.service';
import { TaxonomyService } from "../../modules/search/taxonomy/services/service";

import { LocatorsProvider } from '../../modules/controls/locators/providers/locators.provider';
import {AudioSynchProvider} from "../../modules/controls/html.player/providers/audio.synch.provider";
import {LocatorsService} from "../../modules/controls/locators/services/locators.service";
import {Subject} from "rxjs";
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import {GoldenProvider} from "../../modules/search/detail/providers/gl.provider";
import { MLComponent } from '../../modules/abstractions/media.logger.component';

@Component({
    selector: 'media-logger',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../modules/search/detail/styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MediaAppSettings,
        MediaLoggerService,
        MediaLoggerProvider,
        DetailService,
        TimecodeProvider,
        TaxonomyService,
        LocatorsProvider,
        AudioSynchProvider,
        LocatorsService,
        GoldenProvider
    ],
    entryComponents: [
        // IMFXTaxonomyComponent
    ]
})

export class MediaLoggerComponent extends MLComponent {
    @ViewChild('gl', {static: false}) public golden;
    onSaveLogger: Subject<any> = new Subject();
    public config = <DetailConfig>{
        componentContext: <any>null,
        options: {
            _accordions: [],
            tabsData: [],
            file: {},
            userFriendlyNames: {},
            mediaParams: {
                addPlayer: false,
                addMedia: false,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            },
            typeDetailsLocal:'media_logger',
            providerDetailData: <any>null,
            provider: <MediaLoggerProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            typeDetails: "media-details",
            detailsviewType: "MediaDetails",
            friendlyNamesForDetail: "FriendlyNames.TM_MIS",
            defaultThumb: './assets/img/default-thumb.png',
            clipBtns: true,
            disabledClipBtns: false
        },
        moduleContext: this,
        providerType: GoldenProvider
    };

    private defaultGoldenConfig = {
        componentContext: this,
        appSettings: <any>null,
        providerType: <GoldenProvider>null,
        options: {
            file: {},
            groups: [],
            friendlyNames: {},
            typeDetailsLocal: 'media_logger',
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: <any>null,
            titleForStorage: 'mediaLogger'
        }
    };

    public goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);

    constructor(public route: ActivatedRoute,
                protected appSettings: MediaAppSettings,
                private mediaLoggerService: DetailService,
                private cd: ChangeDetectorRef,
                private location: Location,
                private detailProvider: MediaLoggerProvider,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                @Inject(LocatorsProvider) public locatorsProvider: LocatorsProvider) {
        super();
        // detail provider
        this.config.options.provider = this.detailProvider;
        this.config.options.provider.moduleContext = this;
        this.config.options.service = this.mediaLoggerService;
        this.config.options.appSettings = this.appSettings;
    }

    ngOnInit() {
        super.ngOnInit(this);
    }

    ngOnDestroy() {
      if (this.parametersObservable != null) {
        this.parametersObservable.unsubscribe();
      }
    }
    commonDetailInit(firstInit) {
      this.config.options.provider.commonDetailInit(firstInit);
    }

    isFirstLocation () {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    /**
    * Calling on Back button clicking. Go back to Media page
    */
    clickBack() {
        this.config.options.provider.clickBack();
    }
  /**
   * Calling on Save button clicking.
   */
    save() {
      // this.locatorsProvider.onGetMediaTaggingForSave.emit();
      this.onSaveLogger.next();
    }
    /**
     * Calling on Reload button clicking.
     */
    reload() {
        this.locatorsProvider.onReloadMediaTagging.emit();
      }
    /**
     * Calling for validate Save button.
     */
    isValid(): boolean {
      return this.locatorsProvider.isSaveValid();
    }

    /**
       * Check file properties
       */
    public checkDetailExistance(file) {
        return this.config.options.provider.checkDetailExistance(file);
    }
}
