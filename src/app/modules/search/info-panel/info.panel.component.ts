/**
 * Created by Ivan Banan on 12.01.2019.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { InfoPanelProvider } from './providers/info.panel.provider';

import * as $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { SecurityService } from '../../../services/security/security.service';
import { LocalStorageService } from 'ngx-webstorage';
import { HTMLPlayerService } from '../../controls/html.player/services/html.player.service';
import { InfoPanelConfig } from './info.panel.config';
import { InfoPanelThumbProvider } from './providers/info.panel.thumb.provider';
import { Observable, Subject } from 'rxjs';
import { DetailService } from '../detail/services/detail.service';
import { PanelMetadataComponent } from '../panel-metadata/panel.metadata';
import { SettingsGroupsService } from '../../../services/system.config/settings.groups.service';
import { SlickGridProvider } from '../slick-grid/providers/slick.grid.provider';
import { takeUntil } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { BaseSearchUtil } from '../utils/utils';

@Component({
    selector: 'search-info-panel',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailService,
        InfoPanelThumbProvider,
        HTMLPlayerService
    ]
})

export class InfoPanelComponent extends  BaseSearchUtil{
    public config = <InfoPanelConfig>{
        componentContext: <any>null,
        options: {
            _accordions: [],
            tabsData: [],
            file: {},
            // userFriendlyNames: {},
            mediaParams: {
                addPlayer: false,
                addMedia: false,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            },
            typeDetailsLocal: '',
            timecodeFormatString: 'Pal',
            // providerDetailData: <any>null,
            provider: <InfoPanelProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            showAccordions: false,
            externalSearchTextForMark: '',
            isOpenDetailPanel: false,
            searchType: 'media'
        },
        moduleContext: this
    };

    @ViewChild('detailVideo', {static: false}) public detailVideo;
    @ViewChild('accordion', {static: false}) public accordion;

    @ViewChild('subtitlesGrid', {static: false}) public subtitlesGrid; // tab 1
    @ViewChild('subtitlesPacGrid', {static: false}) public subtitlesPacGrid;
    @ViewChild('subTitlesWrapper', {static: false}) public subTitlesWrapperEl: any;
    @ViewChild('subTitlesWrapperTab', {static: false}) public subTitlesWrapperTabEl: any;
    @ViewChild('subTitlesOverlay', {static: false}) public subTitlesOverlayEl;
    @ViewChild('subTitlesOverlayTab', {static: false}) public subTitlesOverlayTabEl;

    @ViewChild('mediaTagging', {static: false}) public mediaTaggingEl; // tab 2
    @ViewChild('taggingOverlay', {static: false}) public taggingOverlayEl;
    @ViewChild('taggingOverlayTab', {static: false}) public taggingOverlayTabEl;
    @ViewChild('taggingWrapperTab', {static: false}) public taggingWrapperTabEl;

    @ViewChild('metadata', {static: false}) public metadataEl: PanelMetadataComponent; // tab 3
    @ViewChild('metadataOverlay', {static: false}) public metadataOverlayEl;
    @ViewChild('metadataOverlayTab', {static: false}) public metadataOverlayTabEl;
    @ViewChild('metadataWrapperTab', {static: false}) public metadataWrapperTabEl;

    @Input('gridProviders') gridProviders: SlickGridProvider[] = null;
    @Input('infoConfigs') infoConfigs = null; //Use if have two (or more) types of content view kind (media item ,version item)
    @Input('config') set setConfig(config) {
        $.extend(true, this.config, config);
        this.initTimecodeChangeUpdate();
    }

    protected loadingSubtitlesMessage: string;
    public activeTab = 0;
    protected destroyed$: Subject<any> = new Subject();

    constructor(@Inject(DetailService) protected service: DetailService,
                @Inject(InfoPanelProvider) protected provider: InfoPanelProvider,
                public securityService: SecurityService,
                public cd: ChangeDetectorRef,
                public translate: TranslateService,
                protected settingsGroupsService: SettingsGroupsService,
                protected localStorage: LocalStorageService,
                public injector: Injector
                ) {
        super();
    }

    protected file: any = {};
    protected timecodeChangeUpdateInited: boolean = false;
    public mediaTaggingConfig = {};
    protected isReady: boolean = false;

    protected tabsOrder = null;
    protected defaultSchema = null;
    protected defaultTab = null;

    public hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    ngOnInit() {
        this.initializeData(this, 'provider');
        this.initializeData(this, 'service');
        this.passConfigToProvider(this);

        this.provider.injector = this.injector;
        // let self = this;
    };

    ngAfterViewInit() {
        this.isReady = true;
        this.settingsGroupsService.getSettingsUserById('searchLayoutConfig').pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) =>{
            if(res && res.length > 0) {
                if(res[0].DATA) {
                    var data = JSON.parse(res[0].DATA);
                    if(data != null && !!data[this.config.options.tabsLayoutSettings]) {
                        this.tabsOrder = [];
                        this.tabsOrder[0] = data[this.config.options.tabsLayoutSettings].tabsOrder.findIndex(x=>x.Id == 0);
                        this.tabsOrder[1] = data[this.config.options.tabsLayoutSettings].tabsOrder.findIndex(x=>x.Id == 1);
                        this.tabsOrder[2] = data[this.config.options.tabsLayoutSettings].tabsOrder.findIndex(x=>x.Id == 2);
                        this.tabsOrder[3] = data[this.config.options.tabsLayoutSettings].tabsOrder.findIndex(x=>x.Id == 3);
                        this.defaultSchema = data[this.config.options.tabsLayoutSettings].defaultSchema;
                        this.defaultTab = data[this.config.options.tabsLayoutSettings].defaultTab;
                        this.cd.detectChanges();
                    }
                }
            }
            this.commonDetailInit();
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    commonDetailInit() {
        this.config.options.provider.infoPanelInit();
    }

    mediaTagging_onSetNode = o => {
        this.detailVideo.setMarkers({markers: o.markers, m_type: 'locator', id: o.id});
    };

    mediaTagging_onAfterReceiveMediaTagging = res => {
        this.toggleOverlayForTagging(false, res);
    };

    metadata_onAfterReceiveMetadata = res => {
        this.toggleOverlayForMetadata(false, res);
    };

    initTimecodeChangeUpdate() {
        let compRef = this;
        if (!this.timecodeChangeUpdateInited) {
            if (this.detailVideo) {
                this.detailVideo.timecodeChange.subscribe(tcStr => {
                    this.subtitlesGrid && this.subtitlesGrid.selectRow(tcStr);
                });
                this.timecodeChangeUpdateInited = true;
            }
        }
    }

    showPlayer() {
        return this.config.options.mediaParams.mediaType == 'htmlPlayer';
    }

    //TODO: БРАТЬ НАСТРОЙКИ ОТСЮДА
    //this.settingsGroupsService.getSettingsGroupById(0, true).subscribe((res: any) => {
    //     if (res) {
    //         let hotkeysData = res.TM_SETTINGS_KEYS['htmlplayerhotkeys'];
    //
    //         if (hotkeysData) {
    //             self.hotkeysProvider.setHotkeys(JSON.parse(hotkeysData.DATA));
    //             // self.hotkeysProvider.setHotkeys = <LoggerData>JSON.parse(loggerData.DATA);
    //             // this.cdr.detectChanges();
    //         }
    //     }
    // });

    /**
     * Check file properties
     */
    checkDetailExistance(file) {
        return this.config.options.provider.checkDetailExistance(file);
    }

    onSelectSubtitle(res) {
        if(this.detailVideo){
            this.detailVideo.setTimecode(res);
        }
    };

    toggleDetailActiveTab(index, callGridRefresh: boolean = false) {
        this.activeTab = index;
        this.cd.detectChanges();
        if(callGridRefresh) {
            this.refreshGrid(index);
        }
        this.localStorage.store("activetab." + this.config.options.typeDetails, this.activeTab);
    }

    toggleOverlayForMetadata(show, res) {
        if (this.metadataOverlayEl && this.metadataOverlayTabEl) {
            let overlayEl = $(this.metadataOverlayEl.nativeElement);
            let tabEl = $(this.metadataOverlayTabEl.nativeElement);
            let wrapperTabEl = $(this.metadataWrapperTabEl.nativeElement);
            if(show) {
                wrapperTabEl.show();
                overlayEl.show();
                tabEl.show();
            }
            else {
                if(res) {
                    wrapperTabEl.show();
                    this.metadataEl.setTabData(res);
                    let lsActiveTab = this.localStorage.retrieve("activetab." + this.config.options.typeDetails);
                    if((lsActiveTab !== undefined) && (lsActiveTab !== null)) {
                        if(lsActiveTab == 3 && this.activeTab != 3) {
                            setTimeout(()=>{this.activeTab = 3; this.cd.detectChanges();},0);
                        }
                    }
                    else if(this.defaultTab) {
                        setTimeout(()=>{this.activeTab = this.defaultTab; this.cd.detectChanges();},0);
                    }
                }
                else {
                    wrapperTabEl.hide();
                    if(this.activeTab == 3) {
                        if(this.defaultTab) {
                            setTimeout(()=>{this.activeTab = this.defaultTab; this.cd.detectChanges();},0);
                        }
                        else {
                            setTimeout(()=>{this.activeTab = 0; this.cd.detectChanges();},0);
                        }
                    }
                }
                overlayEl.hide();
                tabEl.hide();
            }
        }
    }


    toggleOverlayForTagging(show, res) {
        if (this.taggingOverlayEl && this.taggingOverlayTabEl) {
            let overlayEl = $(this.taggingOverlayEl.nativeElement);
            let tabEl = $(this.taggingOverlayTabEl.nativeElement);
            let wrapperTabEl = $(this.taggingWrapperTabEl.nativeElement);
            if(show) {
                wrapperTabEl.show();
                overlayEl.show();
                tabEl.show();
            }
            else {
                if(res && res.length > 0) {
                    wrapperTabEl.show();
                    let lsActiveTab = this.localStorage.retrieve("activetab." + this.config.options.typeDetails);
                    if((lsActiveTab !== undefined) && (lsActiveTab !== null)) {
                        if(lsActiveTab == 2 && this.activeTab != 2) {
                            setTimeout(()=>{
                                this.activeTab = 2;
                                this.cd.detectChanges();
                            },0);
                        }
                    }
                    else if(this.defaultTab) {
                        setTimeout(()=>{this.activeTab = this.defaultTab; this.cd.detectChanges();},0);
                    }
                }
                else {
                    wrapperTabEl.hide();
                    if(this.activeTab == 2) {
                        if(this.defaultTab) {
                            setTimeout(()=>{this.activeTab = this.defaultTab; this.cd.detectChanges();},0);
                        }
                        else {
                            setTimeout(()=>{
                                this.activeTab = 0;
                                this.cd.detectChanges();
                            },0);
                        }
                    }
                }
                overlayEl.hide();
                tabEl.hide();
            }
        }
    }

    hideOverlayForSubtitles(res) {
        if (this.subTitlesOverlayEl && this.subTitlesWrapperEl) {
            let overlayEl = $(this.subTitlesOverlayEl.nativeElement);
            let subTitlesEl = $(this.subTitlesWrapperEl.nativeElement);

            if (res && res.length > 0) {
                subTitlesEl.css({height: '', minHeight: subTitlesEl.attr('data-open-height')}).show();
                $(this.subTitlesWrapperTabEl.nativeElement).show();
                overlayEl.delay(500).hide();
                $(this.subTitlesOverlayTabEl.nativeElement).delay(500).hide();

                let lsActiveTab = this.localStorage.retrieve("activetab." + this.config.options.typeDetails);
                if((lsActiveTab !== undefined) && (lsActiveTab !== null)) {
                    if(lsActiveTab == 1 && this.activeTab != 1) {
                        setTimeout(()=>{this.activeTab = 1; this.cd.detectChanges();},0);
                    }
                }
                else if(this.defaultTab) {
                    setTimeout(()=>{this.activeTab = this.defaultTab; this.cd.detectChanges();},0);
                }
            } else {
                this.loadingSubtitlesMessage = this.translate.instant('details_item.subtitles_not_found');
                subTitlesEl.hide();
                if(this.activeTab == 1) {
                    if(this.defaultTab) {
                        setTimeout(()=>{this.activeTab = this.defaultTab; this.cd.detectChanges();},0);
                    }
                    else {
                        setTimeout(()=>{
                            this.activeTab = 0;
                            this.cd.detectChanges();
                        },0);
                    }
                }
                $(this.subTitlesWrapperTabEl.nativeElement).hide();
                overlayEl.delay(1000).hide();
                $(this.subTitlesOverlayTabEl.nativeElement).delay(1000).hide();
                this.loadingSubtitlesMessage = this.translate.instant('details_item.loading_subtitles');
            }
        }
    }

    showOverlayForSubtitles() {
        if (this.subTitlesOverlayEl && this.subTitlesWrapperEl) {
            let overlayEl = $(this.subTitlesOverlayEl.nativeElement);
            let subTitlesEl = $(this.subTitlesWrapperEl.nativeElement);
            subTitlesEl.css({height: subTitlesEl.attr('data-close-height'), minHeight: subTitlesEl.attr('data-close-height')}).show();
            this.loadingSubtitlesMessage = this.translate.instant('details_item.loading_subtitles');
            overlayEl.show();
            subTitlesEl.show();
            $(this.subTitlesOverlayTabEl.nativeElement).show();
            $(this.subTitlesWrapperTabEl.nativeElement).show();
        }
    }
    updateSize(): void {
        this.detailVideo && this.detailVideo.resizeProvider.onResize()
    }
    public refreshGrid(tabId?: number) {
        if(tabId == 1){
            if(!this.subtitlesGrid){
                return;
            }
            this.subtitlesGrid.refreshGrid();
        } else if(tabId == 2){
            if(!this.mediaTaggingEl){
                return;
            }
            this.mediaTaggingEl.refreshGrid();
        } else {
            if(!this.mediaTaggingEl){
                return;
            }
            this.mediaTaggingEl.refreshGrid();
        }
    }

    requestBrowseCopy() {
        console.log('requestBrowseCopy');
    }

    getMediaUrl(file): Observable<HttpResponse<any>> {
        return new Observable((observer: any) => {
            let url = file.PROXY_URL;
            if (file.UsePresignedUrl) {
                let htmlPlayerService = this.injector.get(HTMLPlayerService);
                htmlPlayerService.getPresignedUrl(file.ID).subscribe((res: any) => {
                    url = res;
                    observer.next(url);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                        observer.next(url);
                        observer.complete();
                    // });
            }

        });
    };

    publicSetConfig(config) {
        $.extend(true, this.config, config);
    }

    isMedia () {
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        return (this.config.options.file && this.config.options.file.MEDIA_TYPE == mediaSubtypes.Media);

    }

    isSubtile () {
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        return (this.config.options.file && this.config.options.file.MEDIA_TYPE && this.config.options.file.MEDIA_TYPE == mediaSubtypes.Subtile);
    }

    isImage () {
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        return (this.config.options.file && this.config.options.file.MEDIA_TYPE && this.config.options.file.MEDIA_TYPE == mediaSubtypes.Image);
    }

    isAudio () {
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        return (this.config.options.file && this.config.options.file.MEDIA_TYPE && this.config.options.file.MEDIA_TYPE == mediaSubtypes.Audio);
    }

    isDoc () {
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        return (this.config.options.file &&
            this.config.options.file.MEDIA_TYPE &&
            mediaSubtypes.Doc.find(id => id === this.config.options.file.MEDIA_TYPE) !== undefined);
    }
}
