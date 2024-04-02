import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Injector,
    Input,
    ViewContainerRef
} from '@angular/core';
import * as $ from 'jquery';
import {SplashProvider} from '../../../providers/design/splash.provider';
import {IMFXAccordionComponent} from './components/accordion.component/imfx.accordion.component';
import {IMFXHtmlPlayerComponent} from '../../controls/html.player/imfx.html.player';
import {IMFXNotAvailableComponent} from '../../controls/not.available.comp/imfx.not.available.comp';
import {IMFXDefaultTabComponent} from './components/default.tab.component/imfx.default.tab.component';
import {IMFXMetadataTabComponent} from './components/metadata.tab.component/imfx.metadata.tab.component';
import {IMFXHistoryTabComponent} from './components/history.tab.component/imfx.history.tab.component';
import {IMFXNotesTabComponent} from './components/notes.tab.component/imfx.notes.tab.component';
import {IMFXImageComponent} from './components/image.component/imfx.image.component';
import {IMFXMediaTaggingTabComponent} from './components/media.tagging.tab.component/imfx.media.tagging.tab.component';
import {IMFXMediaTabComponent} from './components/media.tab.component/imfx.media.tab.component';
import {IMFXVersionsTabComponent} from './components/versions.tab.component/imfx.versions.tab.component';
import {IMFXReportTabComponent} from './components/report.tab.component/imfx.report.tab.component';

import {DOCXViewerComponent} from '../../viewers/docx/docx';
import {TIFViewerComponent} from '../../viewers/tif/tif';
import {PDFViewerComponent} from '../../viewers/pdf/pdf';
import {TGAViewerComponent} from '../../viewers/tga/tga';
import {FlashViewerComponent} from '../../viewers/flash/flash';
import {CodePrettiffyViewerComponent} from '../../viewers/codeprettify/codeprettify';
import {DownloadViewerComponent} from '../../viewers/download/download';

import {LocalStorageService} from "ngx-webstorage";
import {TranslateService} from '@ngx-translate/core';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import 'script-loader!golden-layout/lib/jquery.js';
import 'script-loader!./overrides/goldenlayout.js';

import { GoldenConfig, TabData } from './detail.config';
import {IMFXSubtitlesGrid} from './components/subtitles.grid.component/subtitles.grid.component';
import {SubtitlesPacGrid} from './components/subtitles.pac.grid.component/subtitles.pac.grid.component';
import {LivePlayerComponent} from '../../controls/live.player/live.player';
import {IMFXAttachmentsComponent} from "./components/attachments.tab.component/imfx.attachments.tab.component";
import {IMFXEventsTabComponent} from "./components/events.tab.component/imfx.events.tab.component";
import {IMFXSegmentsTabComponent} from "./components/segments.tab.component/imfx.segments.tab.component";
import {IMFXAudioTracksTabComponent} from "./components/audio.tracks.tab.component/imfx.audio.tracks.tab.component";
import {IMFXAiTabComponent} from "./components/ai.tab.component/ai.tab.component";
import {IMFTabComponent} from "./components/imf.tab.component/imf.tab.component";
import {SearchSettingsProvider} from "../settings/providers/search.settings.provider";
import {SlickGridProvider} from "../slick-grid/providers/slick.grid.provider";
import {AVFaultsTabComponent} from "./components/av.faults.tab.component/av.faults.tab.component";
import {HTMLPlayerService} from "../../controls/html.player/services/html.player.service";
import {Observable, Subject} from "rxjs";
import {NotificationService} from "../../notification/services/notification.service";
import {IMFXModalProvider} from "../../imfx-modal/proivders/provider";
import {SaveDefaultLayoutModalComponent} from "./components/modals/save.default.layout.modal/save.default.layout.modal.component";
import {IMFXModalEvent} from "../../imfx-modal/types";
import {GeoLocationTabComponent} from "./components/geo.location.tab.component/geo.location.tab.component";
import {takeUntil} from 'rxjs/operators';
import {IMFXMisrTabComponent} from './components/misr.tab.component/imfx.misr.tab.component';
import {DetailService} from "./services/detail.service";
import {IMFXProTimelineComponent} from "../../controls/imfx.pro.timeline/imfx.pro.timeline";
import {IMFXProTimeline, IMFXProTimelineType} from "../../controls/imfx.pro.timeline/models/imfx.pro.timeline.model";
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";
import {JsonViewerComponent} from "../../viewers/jsonviewer/jsonviewer";
import {IMFXTitlesTabComponent} from "./components/titles.tab.component/imfx.titles.tab.component";
import {IMFXTasksTabComponent} from "./components/tasks.tab.component/imfx.tasks.tab.component";
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {lazyModules} from "../../../app.routes";
import {IMFXFileExplorerTabComponent} from "./components/file.explorer.tab.component/imfx.file.explorer.tab.component";

import {IMFXWFHistoryTabComponent} from './components/workflow.history.tab.component/imfx.wf.history.tab.component';
import { SimpleListComponent } from '../../controls/simple.items.list/simple.items.list';
// import {GoldenProvider} from "./providers/gl.provider";

declare var GoldenLayout: any;

@Component({
    selector: 'golden-layout',
    templateUrl: './tpl/gl-index.html',
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXMetadataTabComponent,
        IMFXHistoryTabComponent,
        IMFXNotesTabComponent,
        IMFXSegmentsTabComponent,
        IMFXAudioTracksTabComponent,
        IMFXSubtitlesGrid,
        SubtitlesPacGrid,
        IMFXImageComponent,
        IMFXMediaTaggingTabComponent,
        IMFXMediaTabComponent,
        IMFXNotAvailableComponent,
        IMFXVersionsTabComponent,
        IMFXReportTabComponent,
        IMFXAttachmentsComponent,
        DOCXViewerComponent,
        TGAViewerComponent,
        PDFViewerComponent,
        FlashViewerComponent,
        DownloadViewerComponent,
        CodePrettiffyViewerComponent,
        JsonViewerComponent,
        LivePlayerComponent,
        IMFXEventsTabComponent,
        IMFXAiTabComponent,
        IMFTabComponent,
        AVFaultsTabComponent,
        SaveDefaultLayoutModalComponent,
        GeoLocationTabComponent,
        IMFXMisrTabComponent,
        IMFXProTimelineComponent,
        IMFXTitlesTabComponent,
        IMFXTasksTabComponent,
        IMFXWFHistoryTabComponent
    ],
    providers: [
        SlickGridProvider,
        SearchSettingsProvider,
        HTMLPlayerService,
        // GoldenProvider
    ]
})
export class GLComponent {
    /*
    * Default config
    * @type {GoldenConfig}
    */
    config = <GoldenConfig> {
        componentContext: this,
        moduleContext: this,
        appSettings: <any>null,
        providerType: <any>null,
        options: {
            file: Object,
            groups: [],
            friendlyNames: Object,
            typeDetailsLocal: <string>null,
            typeDetails: <string>null,
            tabs: [],
            params: <any>null
        },
    };
    protected provider: any = null;

    /**
     * Extend default config
     * @param config
     */
    @Input('config')
    set setConfig(config) {
        this.config = $.extend(true, this.config, config);
        // this.config.componentContext = this;
        if (this.config.providerType) {
            this.provider = this.injector.get(this.config.providerType);
            this.provider.config = this.config;
        }
    }

    @Input('subtitles') private subtitles: Array<any>;
    @Input('pacsubtitles') private pacsubtitles: Array<any>;
    @Input() videoInfo: any;

    public isEmpty: boolean = true;
    public height: any;
    layoutConfig: any;
    layout: any;
    storagePrefix: string;
    traslateKey: string;
    menuOpened = false;
    newTabs: TabData[] = [];
    oldSelectedTabs = []; // active tabs. It changes during handling "activeContentItemChanged" gl event
    tabsType;
    playerComponents: any;
    taggingComponent: any;
    subtitlesGrid;
    subtitlesPacGrid;
    videoInfoComponent;
    editLayoutMode: boolean = false;
    public destroyed$: Subject<any> = new Subject();

    changeLayout: EventEmitter<any> = new EventEmitter<any>();
    refreshComponent: EventEmitter<any> = new EventEmitter<any>();
    protected isPopout = false;
    private popoutLayout = {
        content: [{
            type: 'row',
            content: [
                {
                    type: 'component',
                    componentName: 'Media',
                    tTitle: 'Media'
                }
            ]
        }]
    }

    constructor(@Inject(ElementRef) protected el: ElementRef,
                @Inject(ViewContainerRef) protected viewContainer: ViewContainerRef,
                @Inject(ComponentFactoryResolver) protected componentFactoryResolver: ComponentFactoryResolver,
                @Inject(LocalStorageService) protected storageService: LocalStorageService,
                @Inject(ChangeDetectorRef) protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(SplashProvider) protected splashProvider: SplashProvider,
                @Inject(DetailService) protected detailService: DetailService,
                @Inject(Injector) protected injector: Injector,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        (<any>window).location.hash = decodeURIComponent((<any>window).location.hash);
        let matches = location.hash.match(new RegExp('gl-window' + '=([^&]*)'));
        if (matches) {
            this.isPopout = true;
        }
    }

    ngOnInit() {
        var self = this;
        setTimeout(() => {
            if (self.destroyed$.isStopped) {
                return;
            }
            self.cd.detectChanges();
        }, 0);
        if (!this.isPopout) {
            this.CommonGoldenInit();
            let self = this;
            this.changeLayout
                .pipe(takeUntil(self.destroyed$))
                .subscribe((res: any) => {
                    setTimeout(() => {
                        if (self.destroyed$.isStopped) {
                            return;
                        }

                        self.layout.off('itemDestroyed');
                        self.layout.destroy();
                        self.config.options.file = res; // toDo temporary fix for px-4136. Need refactoring like px-3472.
                        self.CommonGoldenInit();
                    }, 0);
                });
            this.refreshComponent.pipe(takeUntil(self.destroyed$))
                .subscribe((compTitle) => {
                    let element = this.layout.root.getItemsByFilter(function (elem) {
                        return elem.config.title == compTitle.title;
                    })[0];
                    if(element){
                        element.container.compRef.instance.refresh(compTitle.file);
                    }
                });
            (<any>window).GoldenLayout.__lm.items.Stack.prototype._highlightHeaderDropZone = this._highlightHeaderDropZoneOverride;
            (<any>window).GoldenLayout.__lm.LayoutManager.prototype._$createRootItemAreas = this._$createRootItemAreasOverride;

            this.provider.setCreatePopoutMethod();
        }
        else {
            this.layout = new GoldenLayout(this.popoutLayout, $(this.el.nativeElement).find('#layout'));
            // this.provider.layout = this.layout;
            var self = this;
            this.addMediaLayout(self);
            // this.setEvents();
            this.layout.init();
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                // this.layout.updateSize();
                this.splashProvider.onHideSpinner.emit();
                this.cd.detectChanges();
            }, 2000);

        }

    };

    ngOnDestroy() {
        if (this.layout) {
            this.layout.off('stateChanged');
            this.layout.off('itemDestroyed');
            this.layout.destroy();
        }
        this.destroyed$.next();
        this.destroyed$.complete();
    };

    ngOnChanges() {
        this.cd.detectChanges();
    }

    /**
     * just add new source into player
     */
    addPlayerData(instance, targetFile, mediaType) {
        switch (mediaType) {
            case 'htmlPlayer': {
                instance.id = targetFile['ID'];
                instance.isLive = targetFile['IsLive']; // LIVE
                instance.src = targetFile['PROXY_URL'];
                instance.type = targetFile['MEDIA_TYPE'];
                instance.subtitles = targetFile['Subtitles'];
                instance.file = targetFile;
                break;
            }
            case 'livePlayer': {
                instance.apiSrc = targetFile['PROXY_URL'];
                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * refresh layout - use for media tab (version) and accos media (media) after select media item
     */
    refreshLayout(outsideUpdate = null) {
        // if media tab already exists
        if (this.provider.findMediaTab()) {
            let instance = this.playerComponents.compRef.instance;
            let mediaType = outsideUpdate.MediaType;
            let targetFile = outsideUpdate.Data || {};
            //cut secure token subvalue after '..'
            let currUrl = instance.src && instance.src.split('..')[0] || null;
            let newUrl = targetFile.PROXY_URL && targetFile.PROXY_URL.split('..')[0] || null;

            this.addPlayerData(instance, targetFile, mediaType);
            //checking player reinit is need
            (currUrl !== newUrl) && this.layout.emit('playerRefresh');
            return;
        }
        // ----delete media button from drag buttons
        let mediaDragBtnInd = -1;
        this.newTabs.forEach((el, k) => {
            if (el.tTitle == 'Media') {
                mediaDragBtnInd = k;
            }
        });
        $('li #tab-drag-Media').parent().remove();
        console.log('string 302, title mmmmm');
        if (mediaDragBtnInd > -1) {
            this.newTabs.splice(mediaDragBtnInd, 1);
        }
        // -----------------
        // if we must add media player block
        let oldElement = this.layout.root.getItemsByFilter(function (elem) {
            return elem.config.tTitle == 'vMedia';
        })[0].parent;
        let newElement = this.layout.createContentItem({
            type: 'column',
            content: [
                {
                    type: 'stack',
                    content: []
                },
                {
                    type: 'stack',
                    content: []
                }
            ]
        });
        let mediaComp = {
            type: 'component',
            componentName: 'Media',
            tTitle: 'Media'
        };
        // add player block
        newElement.contentItems[0].addChild(mediaComp);
        // add old tabs
        for (var i = 0; i < oldElement.contentItems.length; i++) {
            newElement.contentItems[1].addChild(oldElement.contentItems[i]);
        }
        ;
        let activeItemIndex = oldElement.config.activeItemIndex;
        newElement.contentItems[1].setActiveContentItem(newElement.contentItems[1].contentItems[activeItemIndex]);
        oldElement.parent.replaceChild(oldElement, newElement);
        this.layout.off('itemDestroyed');
        this.setItemDestroyEvent();
        this.layout.updateSize();
        let instance = this.playerComponents.compRef.instance;
        let mediaType = outsideUpdate.MediaType;
        let targetFile = outsideUpdate.Data || {};
        this.addPlayerData(instance, targetFile, mediaType);
    }

    resetLayout() {
        this.storageService.clear(this.storagePrefix);
        this.layout.off('itemDestroyed');
        this.layout.off('stateChanged');
        this.layout.destroy();
        this.newTabs = [];
        $('.drag-btns-wraper #tabbed-nav li').remove();
        this.createNewLayout();
        this.setView();
    }

    updateData(data) {
        this.config.options.file = data;
        this.cd.detectChanges();
    }

    CommonGoldenInit() {
        (<any>window).imfxGolden = this;
        this.tabsType = this.config.appSettings.getTabs();
        this.traslateKey = this.config.options.typeDetailsLocal + '.tabs';
        let mediaSubtypes = this.config.appSettings.getMediaSubtypes();
        let mSubtypeStr = '';
        for (var e in mediaSubtypes) {
            if (Array.isArray(mediaSubtypes[e])) {
                for (var j in mediaSubtypes[e]) {
                    if (mediaSubtypes[e][j] == this.config.options.file['MEDIA_TYPE']) {
                        mSubtypeStr = '.' + e;
                    }
                }
            } else if (mediaSubtypes[e] == this.config.options.file['MEDIA_TYPE']) {
                mSubtypeStr = '.' + e;
            }
        }
        this.storagePrefix = this.config.options.typeDetails.replace('-', '.') + mSubtypeStr + '.saved.state';
        let state = this._deepCopy(this.storageService.retrieve(this.storagePrefix));
        if (state) {
            this.layoutConfig = JSON.parse(state);
            this.checkAndTranslateTabTitle(this.layoutConfig.content, this);
            this.newTabs = this.addNewTabs(this.layoutConfig.content);
            if (this.newTabs.length) {
                this.cd.detectChanges();
            }
            this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
        } else {
            this.createNewLayout();
        }
        this.layoutConfig.settings.reorderEnabled = false;
        this.setView();
    };

    // create layout if it was not saved
    createNewLayout() {
        let _tabs = [],
            self = this;
        this.config.options.tabs.forEach(function (tab, ind) {
            if (!tab.hide) {
                let fullKey = self.traslateKey + '.' + tab.title;
                self.translate.get(fullKey)
                    .pipe(takeUntil(self.destroyed$))
                    .subscribe(
                        (res: string) => {
                            _tabs.push({
                                type: 'component',
                                componentName: 'Tab',
                                title: res,
                                tTitle: tab.title,
                                _isHidden: ind != 0 ? true : false
                            });
                        });
            }
        });
        this.layoutConfig = this._deepCopy(this.config.options.layoutConfig);
        this.insertTabsIntoLayout(this.layoutConfig.content, _tabs, this);
    }

    /*
    *   Insert tabs from rest into layout
    */
    insertTabsIntoLayout(content, tabs, self) {
        // find tabs stack
        let stack = content.filter(function (el) {
            return el.id === 'stackOfTabs';
        });
        if (stack.length) {
            stack[0].content = tabs;
            return;
        } else {
            let index = content.length - 1;
            while (index >= 0) {
                if (content[index].content && content[index].content.length > 0) {
                    self.insertTabsIntoLayout(content[index].content, tabs, self);
                }
                index -= 1;
            }
        }
    }

    // deep copy object
    _deepCopy(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this._deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = Object.create(obj);
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this._deepCopy(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type is not supported.');
    }

    setSubtitles(subtitles: Array<any>) {
        this.subtitles = subtitles;
        this.subtitlesGrid.setSubtitles && this.subtitlesGrid.setSubtitles(subtitles, this.config.options.file["Subtitles"]);
        this.cd.detectChanges();
    }

    setPacSubtitles(subtitles: Array<any>) {
        this.pacsubtitles = subtitles;
        this.subtitlesPacGrid && this.subtitlesPacGrid.instance.setPacSubtitles(subtitles);
        this.cd.detectChanges();
    }

    unsubscribeLayoutEvent(e){
        if (this.layout._mSubscriptions[e] && this.layout._mSubscriptions[e].length) {
            this.layout.off(e);
        }
    }

    public mediaPlayerCompRef: any;
    /**
     * Add media (player) tab
     */
    addMediaLayout(self, file = null) {
        this.layout.registerComponent('Media', (container, componentState) => {
            if (self.isPopout && componentState.params) {
                self.config.options.params = componentState.params;
            }
            if (!self.config.options.params.addMedia) {
                return;
            }
            let targetFile = <any>{};
            if (self.isPopout && componentState.file) {
                targetFile = componentState.file;
            } else {
                targetFile = self.config.options.file;
            }
            if (file) {
                targetFile = file.Data;
            }
            let compRef;
            if (this.config.options.typeDetailsLocal) {
                let fullKey = this.config.options.typeDetailsLocal + '.media';
                this.translate.get(fullKey)
                    .pipe(takeUntil(self.destroyed$))
                    .subscribe(
                        (res: string) => {
                            container._config.title = res;
                        });
            }
            let url = targetFile.PROXY_URL;

            this.getMediaUrl(targetFile)
                .pipe(takeUntil(self.destroyed$))
                .subscribe((res: any) => { // use Presigned Url
                    if ((<any>res).error) {
                        self.config.options.params.mediaType = 'defaultViewer'; // not available
                    }
                    url = res.url;
                    switch (self.config.options.params.mediaType) {
                        case 'htmlPlayer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXHtmlPlayerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance.id = targetFile.ID;
                            compRef.instance.isLive = targetFile.IsLive;// LIVE
                            compRef.instance.src = targetFile.PROXY_URL;
                            compRef.instance.type = targetFile.MEDIA_TYPE;
                            compRef.instance.subtitles = targetFile.Subtitles;
                            compRef.instance.file = targetFile;
                            compRef.instance.isCreateThumbnail = true;
                            compRef.instance.externalVideoDetails = this.videoInfo;
                            // compRef.instance.typeDetails = self.config.options.typeDetails || componentState.typeDetails;
                            if (self.isPopout) { // if popout
                                compRef.instance.clipBtns = !self.getReadOnlyModeForTab(targetFile) && componentState.clipBtns;
                                compRef.instance.disabledClipBtns = componentState.disabledClipBtns;
                            } else {
                                compRef.instance.clipBtns = !self.getReadOnlyModeForTab(targetFile) && self.config.moduleContext.config.options.clipBtns;
                                compRef.instance.disabledClipBtns = self.config.moduleContext.config.options.disabledClipBtns;
                            }
                            this.unsubscribeLayoutEvent('setMarkers');
                            this.layout.on('setMarkers', function (data) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setMarkers(data);
                                } else {
                                    compRef._component.setMarkers(data);
                                }
                            });
                            this.unsubscribeLayoutEvent('clearClipBntsState');
                            this.layout.on('clearClipBntsState', function () {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.clearClipBntsState();
                                } else {
                                    compRef._component.clearClipBntsState();
                                }
                            });
                            this.unsubscribeLayoutEvent('clearMarkers');
                            this.layout.on('clearMarkers', function (data) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.clearMarkers(data);
                                } else {
                                    compRef._component.clearMarkers(data);
                                }
                            });
                            this.unsubscribeLayoutEvent('selectClipStateBtns');
                            this.layout.on('selectClipStateBtns', function () {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.selectClipStateBtns();
                                } else {
                                    compRef._component.selectClipStateBtns();
                                }
                            });
                            this.unsubscribeLayoutEvent('disableAllMarkersButtons');
                            this.layout.on('disableAllMarkersButtons', function () {
                                // for popout
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.disableAllMarkersButtons();
                                } else {
                                    compRef._component.disableAllMarkersButtons();
                                }
                            });
                            this.unsubscribeLayoutEvent('setPercent');
                            this.layout.on('setPercent', function (percent) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setPersent(percent);
                                } else {
                                    compRef._component.setPercent(percent);
                                }
                            });
                            this.unsubscribeLayoutEvent('setTimecode');
                            this.layout.on('setTimecode', function (tc) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setTimecode(tc);
                                } else {
                                    compRef._component.setTimecode(tc);
                                }
                            });
                            this.unsubscribeLayoutEvent('setTimecodeFrames');
                            this.layout.on('setTimecodeFrames', function (frame) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setTimecodeFrames(frame);
                                } else {
                                    compRef._component.setTimecodeFrames(frame);
                                }
                            });
                            this.unsubscribeLayoutEvent('setTimecodeMs');
                            this.layout.on('setTimecodeMs', function (ms) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setTimecodeMs(ms);
                                } else {
                                    compRef._component.setTimecodeMs(ms);
                                }
                            });
                            this.unsubscribeLayoutEvent('setTimedText');
                            this.layout.on('setTimedText', function (url) { // by url
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setTimedText(url);
                                } else {
                                    compRef._component.setTimedText(url);
                                }
                            });
                            this.unsubscribeLayoutEvent('setTimedTextById');
                            this.layout.on('setTimedTextById', function (id) {  // by id
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setTimedTextById(id);
                                } else {
                                    compRef._component.setTimedTextById(id);
                                }
                            });
                            this.unsubscribeLayoutEvent('setAudioTrackByIndex');
                            this.layout.on('setAudioTrackByIndex', function (index) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.setAudioTrackByIndex(index);
                                } else {
                                    compRef._component.setAudioTrackByIndex(index);
                                }
                            });
                            container.on('refresh', function () {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.refresh();
                                } else {
                                    compRef._component.refresh();
                                }
                            });
                            this.unsubscribeLayoutEvent('updateAudioSrc');
                            this.layout.on('updateAudioSrc', function (data) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.updateAudioSrc(data);
                                } else {
                                    compRef._component.updateAudioSrc(data);
                                }
                            });
                            this.unsubscribeLayoutEvent('updateAudioVolume');
                            this.layout.on('updateAudioVolume', function (vol) {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.updateAudioVolume(vol);
                                } else {
                                    compRef._component.updateAudioVolume(vol);
                                }
                            });
                            this.unsubscribeLayoutEvent('playerRefresh');
                            this.layout.on('playerRefresh', function () {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.refresh();
                                } else {
                                    compRef._component.refresh();
                                }
                            });
                            this.unsubscribeLayoutEvent('getInOutTimecodesFromPlayer');
                            this.layout.on('getInOutTimecodesFromPlayer',(replace) => {
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxPlayer.getInOutTimecodesFromPlayer(replace);
                                } else {
                                    compRef._component.getInOutTimecodesFromPlayer(replace);
                                }
                            });

                            compRef.instance.onInternalTrackPlaybackChange.subscribe(tcStr => {
                                self.layout.emit('internalTrackPlaybackChange', tcStr);
                            });
                            compRef.instance.onExternalTrackPlaybackChange.subscribe(tcStr => {
                                self.layout.emit('externalTrackPlaybackChange', tcStr);
                            });
                            compRef.instance.timecodeChange.subscribe(tcStr => {
                                self.layout.emit('timecodeChange', tcStr);
                            });
                            compRef.instance.percentChange.subscribe(tcStr => {
                                self.layout.emit('percentChange', tcStr);
                            });
                            compRef.instance.timedTextChange.subscribe(obj => {
                                self.layout.emit('timedTextChange', obj);
                            });
                            compRef.instance.playerReady.subscribe((data) => {
                                self.layout.emit('playerReady', data);
                            });
                            compRef.instance.thumbnailUpdated.subscribe((data) => {
                                self.layout.emit('thumbnailUpdated', data);
                            });
                            compRef.instance.clipAdded.subscribe(data => {
                                if ((<any>window)._parentImfxWindow) {
                                    (<any>window)._parentImfxWindow.imfxLocatorComponent.onAddClip && (<any>window)._parentImfxWindow.imfxLocatorComponent.onAddClip.emit(data);
                                }
                                self.onAddClip && self.onAddClip.emit(data);
                            });
                            compRef.instance.clipReplaced.subscribe(data => {
                                if ((<any>window)._parentImfxWindow) {
                                    (<any>window)._parentImfxWindow.imfxLocatorComponent.onReplaceClip && (<any>window)._parentImfxWindow.imfxLocatorComponent.onReplaceClip.emit(data);
                                }
                                self.onReplaceClip && self.onReplaceClip.emit(data);
                            });
                            compRef.instance.onAudioWaiting.subscribe(show => {
                                self.audiotracksComponent && self.audiotracksComponent.compRef.instance.showAudioLoading(show);
                            });
                            compRef.instance.onAudioError.subscribe(error => {
                                self.audiotracksComponent && self.audiotracksComponent.compRef.instance.showAudioError(error);
                            });
                            compRef.instance['elem'] = container;
                            this.mediaPlayerCompRef = compRef;
                            break;
                        }
                        case 'image': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXImageComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance.PROXY_URL = url;
                            break;
                        }
                        case 'subtitle': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(SubtitlesPacGrid);
                            compRef = this.viewContainer.createComponent(factory);
                            self.subtitlesPacGrid = compRef;
                            compRef.instance.subtitles = self.pacsubtitles || self.config.options.pacsubtitles;
                            break;
                        }
                        case 'docxViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(DOCXViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url
                            };
                            break;
                        }
                        case 'tifViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(TIFViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url
                            };
                            break;
                        }
                        case 'tgaViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(TGAViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url
                            };
                            break;
                        }
                        case 'pdfViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(PDFViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url,
                                //renderMode: 'canvas'
                            };

                            break;
                        }
                        case 'xmlViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(CodePrettiffyViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url,
                                language: 'xml'
                            };
                            break;
                        }
                        case 'jsonViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(JsonViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url
                            };
                            break;
                        }
                        case 'downloadFileViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(DownloadViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: targetFile['PROXY_URL']
                            };
                            break;
                        }
                        case 'defaultViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXNotAvailableComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            if ((<any>res).message) { // show error message
                                compRef.instance['config'] = {
                                    error: (<any>res).message
                                };
                            }
                            this.layout.on('getInOutTimecodesFromPlayer',(replace) => {
                                self.onAddClip && self.onAddClip.emit({replace: replace});
                            });
                            break;
                        }
                        case 'livePlayer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(LivePlayerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance.apiSrc = url;
                            break;
                        }
                        case 'flashPlayerViewer': {
                            let factory = this.componentFactoryResolver.resolveComponentFactory(FlashViewerComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            compRef.instance['config'] = {
                                url: url
                            };
                            break;
                        }
                        default: { // just in case
                            alert('this break;');
                            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXNotAvailableComponent);
                            compRef = this.viewContainer.createComponent(factory);
                            if ((<any>res).message) { // show error message
                                compRef.instance['config'] = {
                                    error: (<any>res).message
                                };
                            }
                            break;
                        }
                    }
                    compRef.instance['elem'] = container;
                    container.on('loadComponentData', function () {
                        compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
                    });
                    // remove old player when you switch between media items (assessment)
                    container.getElement().children().get(0) && container.getElement().children().get(0).remove();
                    container.getElement().append($(compRef.location.nativeElement));
                    self.playerComponents = container;
                    container['compRef'] = compRef;
                    if (self.isPopout) {
                        compRef.changeDetectorRef.detectChanges();
                    }
                });
            // set params for popout if currently it's not popout
            if (!self.isPopout && componentState) {
                componentState.file = self.config.options.file;
                componentState.params = self.config.options.params;
                componentState.disabledClipBtns = self.config.moduleContext.config.options.disabledClipBtns;
                componentState.clipBtns = self.config.moduleContext.config.options.clipBtns;
                container.setState(componentState);
            }
        });
    }

    getReadOnlyModeForTab(file) {
        return !!(file.IsGanged && !file.IsGangedMain);
    }

    getReadOnlyModeForMediaItem(file) {
        return !!(file.IsGanged && !file.IsGangedMain);
    }

    private fillTimelineDataDetail(file, compRef) {
        let cfg: IMFXProTimeline = {
            Name: "Timeline",
            From: file["FILE_SOM_ABSOLUTE"],
            Length: file["FILE_EOM_ABSOLUTE"] - file["FILE_SOM_ABSOLUTE"],
            Framerate: TMDTimecode.getFrameRate(TimeCodeFormat[file["TimecodeFormat"]]).frameRate,
            TimecodeFormat: file["TimecodeFormat"],
            Groups: []
        };

        /*
                cfg.Groups[0] = {
                    Name: "Images",
                    Expandable: true,
                    Expanded: true,
                    WithHeader: false,
                    Rows: []
                };
                cfg.Groups[0].Rows[0] = {
                    Name: "Thumbs",
                    Type: IMFXProTimelineType.Image,
                    Keys: null,
                    Data: {}
                };
                cfg.Groups[0].Rows[1] = {
                    Name: "Scenes",
                    Type: IMFXProTimelineType.Image,
                    Keys: null,
                    Data: {}
                };*/

        this.detailService.getVideoInfo(file["ID"], {
            smudge: true,
            scene: true,
            waveform: false,
            audiovolume: true
        }).pipe(
            takeUntil(compRef.instance['destroyed$'])
        ).subscribe(
            (resp) => {
                if(resp.Smudge) {
                    if(!cfg.Groups[0])
                        cfg.Groups.push({
                            Name: "Images",
                            Expandable: true,
                            Expanded: true,
                            WithHeader: false,
                            Rows: []
                        });
                    cfg.Groups[0].Rows.push({
                        Name: "Thumbs",
                        Type: IMFXProTimelineType.Image,
                        Keys: resp.Smudge ? resp.Smudge.Url : null,
                        Data: {
                            CanvasImageHeight: resp.Smudge ? resp.Smudge.EventData.FrameHeight : 40,
                            CanvasImageFrameWidth: resp.Smudge ? resp.Smudge.EventData.FrameWidth : 60,
                            FrameDivider: resp.Smudge ? resp.Smudge.EventData.FrameInterval : 0,
                            Collapsable: true,
                        }
                    });
                }
                if(resp.Scene) {
                    if(!cfg.Groups[0])
                        cfg.Groups.push({
                            Name: "Images",
                            Expandable: true,
                            Expanded: true,
                            WithHeader: false,
                            Rows: []
                        });
                    var timeCodes = resp.Scene ? resp.Scene.EventData.StringTimecodes.map((val) => {
                        let f = new TMDTimecode({
                            type: "string",
                            timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                            timecodeString: val
                        }).toFrames() - cfg.From;
                        return f;
                    }) : [];
                    cfg.Groups[0].Rows.push({
                        Name: "Scenes",
                        Type: IMFXProTimelineType.Image,
                        Keys: resp.Scene ? resp.Scene.Url : null,
                        Data: {
                            CanvasImageHeight: resp.Scene ? resp.Scene.EventData.FrameHeight : 0,
                            CanvasImageFrameWidth: resp.Scene ? resp.Scene.EventData.FrameWidth : 0,
                            FrameDivider: resp.Scene ? resp.Scene.EventData.FrameInterval : 0,
                            Collapsable: true,
                            TimecodesMap: {},
                            Timecodes: timeCodes,
                        }
                    });
                    for (var j = 0; j < timeCodes.length; j++) {
                        cfg.Groups[0].Rows[cfg.Groups[0].Rows.length - 1].Data.TimecodesMap[timeCodes[j]] = {
                            frame: timeCodes[j],
                            index: j
                        };
                    }
                }
                if (resp.AudioVolume) {
                    this.detailService.getWaveformsJson(resp.AudioVolume.Url).subscribe((waves) => {
                        if(resp.AudioVolume.EventData.AudioTracks > 0)
                            cfg.Groups.push({
                                Name: "Audio",
                                Expandable: true,
                                Expanded: true,
                                WithHeader: true,
                                Rows: []
                            });
                        for (var i = 0; i < resp.AudioVolume.EventData.AudioTracks; i++) {
                            cfg.Groups[cfg.Groups.length - 1].Rows[i] = {
                                Name: waves.Tracks && i < waves.Tracks.length && waves.Tracks[i] && waves.Tracks[i].length > 0 ? waves.Tracks[i] : "Track " + (i + 1),
                                Type: IMFXProTimelineType.Waveform,
                                Keys: [],
                                Data: {
                                    ScaleMax: waves.ScaleMax,
                                    TracksCount: waves.TracksCount,
                                    TimeCodeFormat: waves.TimeCodeFormat,
                                    TimeFrames: waves.TimeFrames,
                                    Values: waves.Values[i],
                                }
                            };
                            var keys = waves.TimeFrames.map((el, index) => {
                                return {
                                    Frame: el,
                                    Length: index + 1 < waves.TimeFrames.length ? (waves.TimeFrames[index + 1] == el ? 1 : waves.TimeFrames[index + 1] - el) : cfg.Length - el,
                                    Value: waves.Values[i][index],
                                    Data: null
                                };
                            });
                            for (var j = 0; j < keys.length; j++) {
                                cfg.Groups[cfg.Groups.length - 1].Rows[i].Keys[keys[j].Frame] = keys[j];
                            }
                        }
                        this.timelineConfigDetail = cfg;
                        compRef.instance.setTimelineData(this.timelineConfigDetail);
                        setTimeout(() => {
                            if (compRef.instance instanceof IMFXProTimelineComponent)
                                //console.warn("MY - Golden "  + (this.timelineConfigDetail ? this.timelineConfigDetail.Length : 0));
                                compRef.instance.Update(null, true, true);
                        });
                    });
                }
                else {
                    this.timelineConfigDetail = cfg;
                    compRef.instance.setTimelineData(this.timelineConfigDetail);
                    // compRef.changeDetectorRef.detectChanges();
                    setTimeout(() => {
                        if (compRef.instance instanceof IMFXProTimelineComponent)
                            compRef.instance.Update(null, true, true);
                    });
                }
                this.timelineConfigDetail = cfg;

                compRef.instance.setTimelineData(this.timelineConfigDetail);
                // compRef.changeDetectorRef.detectChanges();
                setTimeout(() => {
                    if (compRef.instance instanceof IMFXProTimelineComponent)
                        compRef.instance.Update(null, true, true);
                });
            }
        );

        this.timelineConfigDetail = cfg;
        compRef.instance.setTimelineData(this.timelineConfigDetail);
    }

    protected timelineConfigDetail;
    protected timelineConfig:IMFXProTimeline = new IMFXProTimeline();

    addTabsLayout(self, outsideData = null) {
        this.layout.registerComponent('Tab', (container, componentState) => {
            let tabComponent = self.selectTabComponent(container._config);
            let factory = this.componentFactoryResolver.resolveComponentFactory(tabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            let goldenRef = this;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            container.on('setMarkers', function (data) {
                self.layout.emit('setMarkers', data);
            });
            container.on('clearMarkers', function (data) {
                self.layout.emit('clearMarkers', data);
            });
            container.on('setPercent', function (data) {
                self.layout.emit('setPercent', data);
            });
            container.on('setTimecode', function (tc) {
                self.layout.emit('setTimecode', tc);
            });
            container.on('setTimecodeMs', function (ms) {
                self.layout.emit('setTimecodeMs', ms);
            });
            container.on('setTimedText', function (tc) {
                self.layout.emit('setTimedText', tc);
            });
            // container.on('updateAudioSrc', function(src){
            //     self.playerComponents && self.playerComponents.emit('updateAudioSrc', src);
            // });
            compRef.instance['config'] = {
                file: self.config.options.file,
                typeDetailsLocal: self.config.options.typeDetailsLocal,
                typeDetails: self.config.options.typeDetails,
                elem: container,
                context: this,
                // readOnly: this.getReadOnlyModeForTab(self.config.options.file)
            };


            if (container._config.tTitle === this.tabsType.MediaTagging) {
                compRef.instance['config'].columns = ['InTc', 'OutTc', 'DurationTc', 'Notes', 'Tags'];
                compRef.instance['config'].hasOuterFilter = true;
                compRef.instance['config'].hasTagColumn = true;
                compRef.instance['onSetTaggingNode'].subscribe(o => {
                    container.emit('setMarkers', o);
                });
                compRef.instance['onSetTimecodeString'].subscribe(tc => {
                    self.layout.emit('setTimecode', tc);
                });
            }
            if (container._config.tTitle === this.tabsType.Media) { // this is media tab from version detail
                compRef.instance['config'].contextFromDetail = self;
                if (outsideData) {
                    compRef.instance['config'].rowIndex = outsideData.RowIndex;
                }
                compRef.instance['config'].exportEnable = true;
            }
            if (container._config.tTitle === this.tabsType.LinkedMedia) { // this is LINKED media tab from media detail
                compRef.instance['config'].contextFromDetail = self;
                if (outsideData) {
                    compRef.instance['config'].rowIndex = outsideData.RowIndex;
                }
            }
            if (container._config.tTitle === this.tabsType.ChildMedia) { // this is CHILD media tab from media detail
                compRef.instance['config'].contextFromDetail = self;
                if (outsideData) {
                    compRef.instance['config'].rowIndex = outsideData.RowIndex;
                }
            }
            if (container._config.tTitle === this.tabsType.AssocMedia) { // this is Assoc media tab from media detail
                compRef.instance['config'].contextFromDetail = self;
                if (outsideData) {
                    compRef.instance['config'].rowIndex = outsideData.RowIndex;
                }
                compRef.instance['onSetTaggingNode'].subscribe(o => {
                    this.playerComponents
                    && this.playerComponents.compRef.instance.togglePlay
                    && this.playerComponents.compRef.instance.togglePlay(false);
                    (typeof o == 'object')
                        ? container.emit('setMarkers', {markers: o.markers, m_type: 'locator', id: o.id})
                        : container.emit('clearMarkers', 0);
                });
            }
            if (container._config.tTitle === this.tabsType.EventsActions ||
                container._config.tTitle === this.tabsType.Segments ||
                container._config.tTitle === this.tabsType.AudioTracks ||
                container._config.tTitle === this.tabsType.AVFaults
            ) {
                compRef.instance['config'].readOnly = true;
                if ((<any>compRef.instance).onUpdateAudioSrc) {
                    (<any>compRef.instance).onUpdateAudioSrc.subscribe(data => {
                        self.layout.emit('updateAudioSrc', data);
                    });
                }
                // if ((<any>compRef.instance).onUpdateAudioVolume) {
                //     (<any>compRef.instance).onUpdateAudioVolume.subscribe(vol => {
                //         self.layout.emit('updateAudioVolume', vol);
                //     });
                // }
                if (container._config.tTitle === this.tabsType.AudioTracks) {
                    self.audiotracksComponent = container;
                    (<any>compRef.instance).setAudioTrackByIndex.subscribe( index => {
                        self.layout.emit('setAudioTrackByIndex', index);
                    });
                }
            }
            if (container._config.tTitle === this.tabsType.Metadata) {
                compRef.instance['config'].readOnly = this.getReadOnlyModeForTab(self.config.options.file);
            }
            if (container._config.tTitle === this.tabsType.AssocMedia) {
                compRef.instance['config'].assocMedia = true;
                compRef.instance['config'].exportEnable = false;
            }
            if (container._config.tTitle === this.tabsType.cMedia
                || container._config.tTitle === this.tabsType.cVersions
                || container._config.tTitle === this.tabsType.cTitles) {
                compRef.instance['config'].isCarrierDetail = true;
                compRef.instance['config'].exportEnable = true;
            }
            if (container._config.tTitle === this.tabsType.LinkedMedia) {
                compRef.instance['config'].isLinkedMedia = true;
                compRef.instance['config'].exportEnable = false;
            }
            if (container._config.tTitle === this.tabsType.ChildMedia) {
                compRef.instance['config'].isChildMedia = true;
                compRef.instance['config'].exportEnable = false;
            }
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            if (container._config.tTitle === this.tabsType.SubtitlesGrid) {
                compRef.instance['timecodeFormatString'] = self.config.options.file.TimecodeFormat || 'Pal';
                goldenRef.subtitlesGrid = compRef.instance;
                compRef.instance['subtitles'] = this.subtitles;
                debugger
                if (self.config.options.file.Subtitles && self.config.options.file.Subtitles.length > 0) {
                    compRef.instance['additionalSubs'] = self.config.options.file.Subtitles;
                }
                self.layout.on('timecodeChange', tcStr => {
                    const comp = (compRef.instance as IMFXSubtitlesGrid);
                    if (comp && comp.searchTextComp) {
                        if (comp.searchTextComp.mutedFollow === false) {
                            compRef.instance['selectRow'](tcStr);
                        }
                    }
                });
                self.layout.on('timedTextChange', o => {
                    compRef.instance['setLangSubtitlesByUrl'](o.id);
                });
            }
            ;
            if (container._config.tTitle === this.tabsType.Notes) {
                compRef.instance['config'].readOnly = true;
            }

            if (container._config.tTitle === this.tabsType.VideoInfo) {
                goldenRef.videoInfoComponent = compRef.instance;

                if (compRef.instance instanceof IMFXProTimelineComponent) {
                    this.fillTimelineDataDetail(self.config.options.file, compRef);

                    compRef.instance["onDragCurrentTime"].subscribe(frame => {
                        self.layout.emit('setTimecodeFrames', frame);
                    });

                    // compRef.changeDetectorRef.detectChanges();
                    setTimeout(() => {
                        (<any>compRef.instance).Update();
                    });

                    self.layout.on('timecodeChange', (tcStr) =>
                    {
                        if(this.editLayoutMode)
                            return;
                        var tc = new TMDTimecode({
                            type: "string",
                            timecodeFormat: TimeCodeFormat[this.config.options.file["TimecodeFormat"]],
                            timecodeString: tcStr
                        });
                        this.videoInfoComponent.compRef.instance.SetTimelineTime(tc.toFrames());
                    });
                    // self.layout.on('percentChange', tcStr => {
                    //     var tc = new TMDTimecode({type:"string", timecodeFormat: TimeCodeFormat[self.config.options.file["TimecodeFormat"]], timecodeString: tcStr});
                    //     (<any>compRef.instance).SetTimelineTime(tc.toFrames());
                    // });

                    (<any>window).videoInfoComponent = self.videoInfoComponent = container;
                }
            }
            if (container._config.tTitle === this.tabsType.AI) {
                compRef.instance['config'] = {
                    file: self.config.options.file,
                    elem: container,
                    readOnly: false
                };
                container.on('setTimecode', function (data) {
                    self.layout.emit('setTimecode', data.InTc);
                });
            }
            if (container._config.tTitle === this.tabsType.FileExplorer) {
                compRef.instance['carrierId'] = self.config.options.file.ID;
            }

            // compRef.changeDetectorRef.detectChanges();
        });
    }

    setView(outsideUpdate = null) {
        this.layoutConfig = this.checkMediaBlock(this.layoutConfig);
        this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));
        this.provider.layout = this.layout;
        this.provider.setView(this, outsideUpdate);

        this.setEvents();
        this.layout.init();
        this.splashProvider.onHideSpinner.emit();
        this.createDragButtons();
        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            this.layout.updateSize();
        }, 0);
    }

    public setViewVariables() {
        this.layoutConfig = this.checkLayoutCompByName(this.layoutConfig, 'VideoInfo', true);
        this.layoutConfig = this.checkActualActiveItemIndex(this.layoutConfig);
        this.layoutConfig.settings.showCloseIcon = false;
        this.layoutConfig.settings.reorderEnabled = false;
        this.layoutConfig.settings.isClosable = false;
        this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));
    }

    addMediaTab(self, container) {
        this.translateTitle(container, '.data');
        let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
        let compRef = self.viewContainer.createComponent(factory);
        compRef.instance.file = self.config.options.file;
        compRef.instance.columnData = self.config.options.columnData;
        compRef.instance.lookup = self.config.options.lookup;
        container.getElement().append($(compRef.location.nativeElement));
        container["compRef"] = compRef;
        return compRef;
    }

    addMediaTagging(self, container, compRef, provider) {
        container.getElement().append($(compRef.location.nativeElement));
        container["compRef"] = compRef;
        compRef.instance.onSetTaggingNode.subscribe(o => {
            self.layout.emit('setMarkers', o);
            self.layout.emit('selectClipStateBtns');
        });
        compRef.instance.onSetTimecodeString.subscribe(tc => {
            self.layout.emit('setTimecode', tc);
        });
        compRef.instance['locatorsFrameSettings'] = self.config.moduleContext.taskFile.TechReport
            && self.config.moduleContext.taskFile.TechReport.Settings.Assess.LocatorsFrame;
        container.on('clearMarkers', function (data) {
            self.layout.emit('clearMarkers', data);
        });
        container.on('disableAllMarkersButtons', function () {
            self.layout.emit('disableAllMarkersButtons');
        });
        container.on('updateLocator', function (res) {
            let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
                return el.fileGuid == res.fileGuid;
            });
            if (currentLoggerSeries.length !== 0) {
                currentLoggerSeries[0].series = res.series;
            }
            if (self.config.options.file.DFILE_LINK_GUID == res.fileGuid) {
                self.config.options.series = res.series;
            }
        });

        compRef.instance.onDeleteItem.subscribe((data) => {
            self.timelineComponent && self.timelineComponent.emit('clipRemoved', data);
        });
        container.on('setFocusOnGrid', function () {
            compRef['_component'].setFocusOnGrid && compRef['_component'].setFocusOnGrid();
        });
        container.on('addTag', function (data) {
            compRef['_component'].addTag(data);
        });
        container.on('onSaveMediaTagging', function (data) {
            compRef['_component'].saveMediaTagging(data.series, data.guid, data.fileId, false).subscribe(res => {
                compRef['_component'].updateSavedMediaTagging(res, data.series, data.guid);
            });
        });
        container.on('clipAdded', function (data) {
            self.timelineComponent && self.timelineComponent.emit('clipAdded', data.el);
        });
        container.on('clipReplaced', function (data) {
            self.timelineComponent && self.timelineComponent.emit('clipReplaced', data);
        });
        // check locators when change layout
        let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
            return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
        });
        if (currentLoggerSeries.length === 0) { // if there is no loading series for current GUID
            if (self.config.options.file.DFILE_LINK_GUID != '' && self.config.options.file.DFILE_LINK_GUID != null) {
                provider.loadTagging(self.config.options.file.DFILE_LINK_GUID)
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe(res => {
                        self.config.options.series = res;

                        self.loggerSeriesArray.push({
                            fileGuid: self.config.options.file.DFILE_LINK_GUID,
                            fileId: self.config.options.file.ID,
                            series: res
                        });
                        if (compRef.instance.config) {
                            compRef.instance.config.series = res;
                            self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                file: self.config.options.file,
                                series: res
                            });

                            if (self.timelineComponent) {
                                let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                                let file = self.config.options.file;

                                self.fillTimelineData(types, file, res, self.timelineComponent["compRef"]);
                                self.timelineComponent["compRef"].instance.setVisible();
                                self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);

                                self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
                                setTimeout(() => {
                                    self.timelineComponent["compRef"].instance.Update();
                                });
                            }
                        }
                    });
            }
        }
        compRef.instance['config'] = {
            file: self.config.options.file,
            series: self.config.options.series,
            elem: container,
            componentContext: self.config.componentContext,
            commentsColumns: ["indicator", "InTc", "OutTc", "DurationTc", "Notes", "Tags"],
            blackDetectedColumns: ["InTc", "OutTc", "DurationTc", "Notes", "Tags"],
            options: {},
            loadedSeries: self._deepCopy(self.config.options.series),
            readOnly: self.getReadOnlyModeForTab(self.config.options.file)
        };
        compRef.instance.playerExist = self.playerExist;
        this.layout.on('setReadOnly', function (readOnly) {
            compRef.instance.onRefresh.next(readOnly);
        });
        (<any>window).imfxLoggerComponent = self.taggingComponent = container;
        container.on('getTimecodesForEntry', replace => {
            compRef.instance.waitForInOutTimecodes = true;
            self.layout.emit('getInOutTimecodesFromPlayer', replace);
        });
        container.on('isDataValid', isValid => {
            if (isValid) {
                container.tab && container.tab.element.find('i.lm_left').hide();
            } else {
                container.tab && container.tab.element.find('i.lm_left').show();
            }
            self.allValidTabs.filter(el => {
                return el.tTitle == container.title;
            })[0].isValid = isValid;
        });
        container.on('timecodesInvalid', timecodesInvalid => {
            self.allValidTabs.filter(el => {
                return el.tTitle == container.title;
            })[0].timecodesInvalid = timecodesInvalid;
        });
        self.addClipSubcription = self.onAddClip.subscribe(data => {
            if (compRef.instance.waitForInOutTimecodes) {
                compRef.instance.addClip(data);
                compRef.instance.waitForInOutTimecodes = false;
            }
        });
        self.replaceClipSubcription = self.onReplaceClip.subscribe(data => {
            compRef.instance.addClip({data: data.newClip, replace: true});
        });
        compRef.changeDetectorRef.detectChanges();
        if (currentLoggerSeries.length !== 0) {
            self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                file: self.config.options.file,
                series: self.config.options.series
            });

            if (self.timelineComponent) {
                let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                let file = self.config.options.file;

                self.fillTimelineData(types, file, self.config.options.series, self.timelineComponent["compRef"]);
                self.timelineComponent["compRef"].instance.setVisible();
                self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);

                self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
                setTimeout(() => {
                    self.timelineComponent["compRef"].instance.Update();
                });
            }
        }
    }

    addMediaList(self, container) {
        let compRef;
        let fullKey = self.config.options.typeDetailsLocal + '.media_list';
        self.translate.get(fullKey).subscribe(
            (res: string) => {
                container._config.title = res;
            });
        let factory = self.componentFactoryResolver.resolveComponentFactory(SimpleListComponent);
        compRef = self.viewContainer.createComponent(factory);
        if (self.itemsMediaList.length == 0) {
            self.itemsMediaList.push(self.config.options.file);
            compRef.instance.items = self.itemsMediaList;
        }
        else {
            compRef.instance.items = self.itemsMediaList;
        }


        self.mediaListComponent = container;

        compRef.instance['elem'] = container;
        container.on('loadComponentData', () => {
            compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
        });
        self.layout.on('refresh', () => {
            compRef._component.refresh();
        });

        container.getElement().append($(compRef.location.nativeElement));
        container['compRef'] = compRef;

        compRef.changeDetectorRef.detectChanges();

        return compRef;
    }

    createNewTabsAfterInit(self) {
        if (!self.layout.root)
            return;

        for (let i = 0; i < self.allValidTabs.length; i++) {
            let tab = self.allValidTabs[i];
            let buf = self.layout.root.getItemsByFilter((el) => {
                return el.componentName == tab.tTitle;
            });
            if (buf.length === 0) {
                self.newTabs.push(tab);
            }
        }
        self.cd.detectChanges();
    }

    setEvents() {
        let self = this;
        this.layout.on('componentCreated', (component) => {
            this.isEmpty = false;
            component.container.on('resize', () => {
                if (!component.container.compRef) return;
                let inst = component.container.compRef.instance;
                if (inst.onResize && inst.onResize instanceof EventEmitter) {
                    component.container.compRef.instance.onResize.emit({comp: component});
                }
            });
            this.cd.detectChanges();
        });

        this.layout.on('stateChanged', (event) => {
            // if (this.editLayoutMode) {
            if ((<any>window).location.hash.indexOf(this.storagePrefix.split('.')[0]) > -1) {
                if (this.layout.openPopouts.length === 0) {
                    var state = this._deepCopy(JSON.stringify(this.layout.toConfig()));
                    this.storageService.store(this.storagePrefix, state);
                }
            }
            // }
        });
        this.layout.on('tabCreated', function (tab) {
            tab.closeElement.append("<button class='icon-button'><i class='icons-close-small icon close'></i></button>");
            if ( self.layout.openPopouts.length !== 0) {
                tab.closeElement.removeClass('lm_close_tab');
                tab.closeElement.hide();
            }
        });
        this.layout.on('stackCreated', function (stack) {
            stack
                .header
                .controlsContainer
                .find('.lm_close').append("<button class='icon-button'><i class='icons-closedelete icon delete'></i></button>");
            stack
                .header
                .controlsContainer
                .find('.lm_popout').append("<button class='icon-button'><i class='fa fa-external-link'></i></button>");
            stack
                .header
                .controlsContainer
                .find('.lm_tabdropdown').append("<i class='icons-more icon'></i>").on('click', self._setDropdownListPosition);
            stack
                .header
                .controlsContainer
                .find('.lm_tabdropdown_list').addClass('submenu');
        });

        this.layout.on('initialised', (event) => {
            this.height = $(this.el.nativeElement).find('.empty-layout').height() + 'px';
        });
        this.setItemDestroyEvent();
        this.layout.on('activeContentItemChanged', item => {
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                item.layoutManager.root.element.click();
                item.container.emit('loadComponentData');
                item.container.emit('setFocusOnGrid');
                if (item.componentName == "Media" && item.element.find('html-player').length && this.layout.openPopouts.length === 0) {
                    item.parent.element.find('.lm_popout').show(); // only for comp with player
                }
                else {
                    item.parent.element.find('.lm_popout').hide();
                }
                if (item.container.compRef && item.container.compRef.instance) { // for some grids
                    item.container.compRef.instance.onRowUnselected && item.container.compRef.instance.onRowUnselected.next();
                }
                self.emitClearMarkers(item.config.title);
            });
        });
        this.setWindowOpenedEvent();
    }

    setItemDestroyEvent() {
        this.layout.on('itemDestroyed', item => {
            if (item.config && item.config.type == 'component' /*&&
                (!(item.config.componentName == 'Media') || (item.config.componentName == 'Media' && !(<any>window)._imfxPopoutItem))*/) {
                let _tab = {
                    type: item.config.type,
                    componentName: item.config.componentName,
                    title: item.config.title,
                    tTitle: item.config.tTitle
                };
                $('.drag-btns-wraper #tabbed-nav').append($('<li> <a id="tab-drag-' + _tab.tTitle + '">' + _tab.title + '</a></li>'));
                let elementTab = $('li #tab-drag-' + _tab.tTitle);
                if (elementTab.length > 0) {
                    let el = this.layout.createDragSource(elementTab, _tab);
                }
            }
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();

                    this.layout.updateSize();
                }
            }
            let $item = this.layout.container.find('.lm_goldenlayout');
            let $child = $item.children();
            if ($child.length === 0) {
                this.isEmpty = true;
                this.cd.detectChanges();
            }
            ;
        });
    }

    setWindowOpenedEvent() {
        this.layout.on('windowOpened', function (contentItem) {
            (<any>window)._popoutWindow = contentItem._popoutWindow;
            (<any>window)._popoutWindow._imfxPopoutObject = contentItem;
            let themeName = (<any>window).sessionStorage.getItem('tmd.config.user.preferences.color_schema');
            contentItem._popoutWindow.document.body.className = themeName.replace(/["']/g, "").replace(/\\/g, '');
            contentItem._popoutWindow._parentImfxWindow = window;
            // onClose event
            // contentItem.on('closed', function () {
            //     let _w = (<any>window);
            //     _w._imfxPopoutItem && _w._imfxPopoutItem.parent.element.find('.lm_popout').show();
            //     _w._imfxPopoutItem && _w._imfxPopoutItem.container.compRef.instance.showElem();
            //     delete _w._popoutWindow;
            //     delete _w._imfxPopoutItem;
            // });
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (this.layout)
            this.layout.updateSize();
    }

    /**
     *
     * @param configField {spetify to return array of config property e.g. 'tTitle'}
     */
    getActiveContentItems(configField?: string) {
        let arrResult = [];
        getSingleActiveItem(this.layout.root.contentItems[0], arrResult);

        function getSingleActiveItem(contentItem, arrItems) {
            let i = 0;
            if (contentItem.header) {
                arrItems.push(contentItem.header.activeContentItem);
            } else if (contentItem.contentItems) {
                for (i = 0; i < contentItem.contentItems.length; i++) {
                    getSingleActiveItem(contentItem.contentItems[i], arrItems);
                }
            } else {
                return;
            }
        }

        if (configField) {
            arrResult = arrResult.map((el) => {
                return (el.config[configField]) ? el.config[configField] : el;
            });
        }

        return arrResult;
    }

    emitClearMarkers(selectedTab) {
        let actantTabs = ['Segments', 'Events', 'A/V Faults', 'Audio Tracks', 'Locators'];

        if (actantTabs.indexOf(selectedTab) > -1) {
            this.layout.emit('clearMarkers', 1);
        }
    }


    selectTabComponent(tabConfig) {
        let tabComp: any = IMFXDefaultTabComponent;
        switch (true) {
            case (tabConfig.tTitle === this.tabsType.Metadata/*||tabConfig.tTitle=='cMetadata'*/):
                tabComp = IMFXMetadataTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.History /*||tabConfig.tTitle=='cHistory'*/):
                tabComp = IMFXHistoryTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Notes):
                tabComp = IMFXNotesTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Segments):
                tabComp = IMFXSegmentsTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.AudioTracks):
                tabComp = IMFXAudioTracksTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.VideoInfo):
                if (this.config.options.params.mediaType === 'defaultViewer') {
                    tabComp = IMFXNotAvailableComponent;
                } else {
                    tabComp = IMFXProTimelineComponent;
                }
                break;
            case (tabConfig.tTitle === this.tabsType.SubtitlesGrid):
                if (this.config.options.params.mediaType === 'defaultViewer') {
                    tabComp = IMFXNotAvailableComponent;
                } else {
                    tabComp = IMFXSubtitlesGrid;
                }
                break;
            case (tabConfig.tTitle === this.tabsType.SubtitlesPacGrid):
                if (this.config.options.params.mediaType === 'defaultViewer') {
                    tabComp = IMFXNotAvailableComponent;
                } else {
                    tabComp = SubtitlesPacGrid;
                }
                break;
            case (tabConfig.tTitle === this.tabsType.MediaTagging):
                tabComp = IMFXMediaTaggingTabComponent;
                break;
            // when 'media' comes from tabs
            case (tabConfig.tTitle === this.tabsType.Media
                || tabConfig.tTitle === this.tabsType.AssocMedia
                || tabConfig.tTitle === this.tabsType.LinkedMedia
                || tabConfig.tTitle === this.tabsType.ChildMedia
                || tabConfig.tTitle === this.tabsType.cMedia):
                tabComp = IMFXMediaTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Titles
                || tabConfig.tTitle === this.tabsType.cTitles):
                tabComp = IMFXTitlesTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Reports):
                tabComp = IMFXReportTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Tasks):
                tabComp = IMFXTasksTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Attachments):
                tabComp = IMFXAttachmentsComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.Misr):
                tabComp = IMFXMisrTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.EventsActions):
                tabComp = IMFXEventsTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.AI):
                tabComp = IMFXAiTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.ImfPackage):
                tabComp = IMFTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.AVFaults):
                tabComp = AVFaultsTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.GeoLocation):
                tabComp = GeoLocationTabComponent;
                break;
                case (tabConfig.tTitle === this.tabsType.FileExplorer):
                tabComp = IMFXFileExplorerTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.cVersions):
                tabComp = IMFXVersionsTabComponent;
                break;
            case (tabConfig.tTitle === this.tabsType.cWorkflowHistory):
                tabComp = IMFXWFHistoryTabComponent;
                break;
            default:
                break;
        }
        return tabComp;
    }

    /*
    *Check tabs, remove non actual, translate
    */
    checkAndTranslateTabTitle(content, self) {
        let cont = content;
        // find tabs
        content.filter(function (el) {
            return el.componentName === 'Tab';
        }).forEach(function (elem, ind) {
            // search tab in new tabs
            let buf = self.config.options.tabs.filter(function (e) {
                return e.Type === elem.tTitle;
            });
            // if tab exist -> translate
            if (buf.length > 0) {
                let fullKey = self.traslateKey + '.' + elem.tTitle;
                self.translate.get(fullKey)
                    .pipe(takeUntil(self.destroyed$))
                    .subscribe(
                        (res: string) => {
                            elem.title = res;
                        });
            } // if not -> delete
            else {
                // /**/
                // elem.hide = true
                // elem.remove();
                cont.splice(cont.indexOf(elem), 1);
            }
        });

        // continue search tabs
        let index = content.length - 1;
        while (index >= 0) {
            if (content[index].content && content[index].content.length > 0) {
                self.checkAndTranslateTabTitle(content[index].content, self);
                if (content[index].content && content[index].content.length == 0) {
                    content.splice(index, 1);
                }
            }
            index -= 1;
        }
    }

    /*
    * For adding new tabs
    */
    checkTabExist(content, Type, isExistTab, self) {
        let existTabs = content.filter(function (elem) {
            return elem && elem.tTitle && (elem.tTitle == Type);
        })
        if (existTabs.length > 0) {
            isExistTab = true;
        } else {
            content.forEach(function (el) {
                if (el && el.content && el.content.length > 0) {
                    isExistTab = self.checkTabExist(el.content, Type, isExistTab, self);
                }
            });
        }
        return isExistTab;
    }

    /*
    * Add new tabs
    */
    addNewTabs(content) {
        let newTabs = [];
        let self = this,
            addedStack = false;
        // loop by tabs from REST
        this.config.options.tabs.forEach(function (el) {
            // if tabs must be shown
            if (!el.hide) {
                let isExistTab = false;
                // check if exist
                isExistTab = self.checkTabExist(content, el.Type, isExistTab, self);
                if (!isExistTab) {
                    // translate & add
                    let fullKey = self.traslateKey + '.' + el.title;
                    self.translate.get(fullKey)
                        .pipe(takeUntil(self.destroyed$))
                        .subscribe(
                            (res: string) => {
                                newTabs.push({
                                    type: 'component',
                                    componentName: 'Tab',
                                    title: res,
                                    tTitle: el.Type
                                });
                            }
                        );
                }
            }
        });

        return newTabs;
    }

    /*
    * Add buttons for dragging tabs
    */
    createDragButtons() {
        let self = this;
        this.newTabs.forEach(function (tab, ind) {
            var elementTab = $('#tab-drag-' + tab.tTitle);
            var el = self.layout.createDragSource(elementTab, tab);
        });
        this.layout.on('itemDropped', el => {
            if (el.config && !!el.config.tTitle) {
                let dragComp = self.layout.root.getItemsByFilter(function (elem) {
                    return elem.config.tTitle == el.config.tTitle;
                });
                if (dragComp.length > 0) {
                    $('li #tab-drag-' + el.config.tTitle).parent().remove();
                    console.log('string 1282, title ' + el.config.tTitle);
                    self.newTabs.forEach(function (elem, ind, arr) {
                        if (elem.tTitle == el.config.tTitle) {
                            arr.splice(ind, 1);
                            return false;
                        }
                    });
                    self.cd.detectChanges();
                }
            }
            if (el.componentName == 'Media') {
                // el.container.compRef._component.refresh();
                setTimeout(() => {
                    if (self.destroyed$.isStopped) {
                        return;
                    }
                    if (self.layout){
                        self.layout.updateSize();
                    }
                }, 0);
            }
        });
    };

    findChildTab(content, type, returnTabParent) {
        let self = this;
        if (content.tTitle == type) {
            return {find: true, returnTabParent: returnTabParent};
        }
        else {
            if (content.content) {
                for (let i = 0; i < content.content.length; i++) {
                    let res = self.findChildTab(content.content[i], type, returnTabParent);
                    returnTabParent = res.returnTabParent;
                    if (res.find) {
                        returnTabParent = content;
                        break;
                    }
                    ;
                }
                ;
            }
        }
        return {find: false, returnTabParent: returnTabParent};
    }

    /*
    * Update, add, or remove Media block (video&img)
    */
    checkMediaBlock(layout) {
        // if no media (video)
        if (!this.config.options.params.addMedia) {
            layout = this.checkLayoutCompByName(layout, 'Media', true);
        }
        // if have video -> add
        else if (this.config.options.params.addMedia) {
            let isExist = this.checkTabExist(layout.content, 'Media', false, this);

            if (!isExist) {
                let mediaTab = {
                    type: 'component',
                    componentName: 'Media',
                    title: 'Media',
                    tTitle: 'Media'
                };
                this.newTabs.push(mediaTab);
            }
        }

        let isExist = this.checkTabExist(layout.content, 'Data', false, this);
        if (!isExist) {
            let dataTab = {
                type: 'component',
                componentName: 'Data',
                title: 'Metadata',
                tTitle: 'Data'
            };
            this.newTabs.push(dataTab);
        }
        this.cd.detectChanges();
        return layout;
    }

    /*
    * Delete nullable width and height
    */
    updateHeightWidthLayout(elem, self) {
        if (!elem)
            return;
        if (elem.activeItemIndex >= 0 && elem.activeItemIndex > elem.content.length - 1) {
            delete elem.activeItemIndex;
        }
        if (elem.activeItemIndex >= 0) {
            elem.content.forEach(function (el, ind) {
                delete el._isHidden;
                if (ind !== elem.activeItemIndex) {
                    el._isHidden = true;
                }
            });
        }
        if (!elem.height) {
            //   delete elem.height;
        }
        if (!elem.width) {
            //  delete elem.width;
        }
        if (elem.content && elem.content.length > 0) {
            elem.content.forEach(function (el) {
                self.updateHeightWidthLayout(el, self);
            });
        }
    }


    toggleMenu() {
        this.menuOpened = !this.menuOpened;
        let self = this;
        setTimeout(() => {
            if (self.destroyed$.isStopped) {
                return;
            }
            if (self.layout){
                self.layout.updateSize();
            }
        }, 0);
    }

    enableEditLayoutMode() {
        this.editLayoutMode = !this.editLayoutMode;
        this.layout.config.settings.reorderEnabled = this.editLayoutMode;
        let contentItems = this.layout._getAllContentItems();
        contentItems.forEach(el => {
            if (el.tab) {
                this.enableEditTabMode(el.tab);
            }
        });
        let liTabs = $('.drag-btns-wraper #tabbed-nav li');
        for (let i = 0; i < liTabs.length; i++) {
            if (this.editLayoutMode) {
                $(liTabs[i]).removeClass('disabled');
            } else {
                $(liTabs[i]).addClass('disabled');
            }
        }
        this.cd.detectChanges();
        let comps = this.layout.root.getItemsByFilter(function (el) {
            return el.componentName == 'Media';
        });
        if (comps.length > 0) {
            this.cd.markForCheck();
            if (this.editLayoutMode === true) {
                if (this.layout.openPopouts.length) { // if popout was opened
                    comps[0].tab.closeElement.removeClass('lm_close_tab');
                    comps[0].tab.closeElement.hide();
                } else {
                    comps[0].tab.closeElement.addClass('lm_close_tab');
                    comps[0].tab.closeElement.show();
                }
            }
        }
        if (this.editLayoutMode === false) {
            comps = this.layout.root.getItemsByFilter(function (el) {
                return el.componentName == 'Timeline' || el.config && el.config.title ==  "Timeline";
            });
            if (comps.length > 0 && comps[0].container.compRef.instance.timelineType == 'IMFXProTimelineWrapper') {
                this.cd.markForCheck();
                this.videoInfoComponent = comps[0].container;
                setTimeout(()=>{
                    if(/*!comps[0].container.compRef.instance.timelineData && */comps[0].componentName == 'Timeline') {
                        this.layout.on('timecodeChange', (tcStr) =>
                        {
                            if(this.editLayoutMode)
                                return;
                            var tc = new TMDTimecode({
                                type: "string",
                                timecodeFormat: TimeCodeFormat[this.config.options.file["TimecodeFormat"]],
                                timecodeString: tcStr
                            });
                            this.videoInfoComponent.compRef.instance.SetTimelineTime(tc.toFrames());
                        });
                    }
                });

                this.videoInfoComponent.compRef.instance.Update(this.videoInfoComponent.compRef.instance.timeline.timelineData ? null :
                    (this.timelineConfigDetail ? this.timelineConfigDetail : this.timelineConfig), true, true);
            }
        }
        this.layout.trigger('stateChanged');
    }

    enableEditTabMode(tab) {
        if (this.layout.config.settings.reorderEnabled) {
            tab._dragListener = new (<any>window).GoldenLayout.__lm.utils.DragListener(tab.element);
            tab._dragListener.on('dragStart', tab._onDragStart, tab);
            tab.contentItem.on('destroy', tab._dragListener.destroy, tab._dragListener);
        } else {
            if (tab._dragListener) {
                tab.contentItem.off('destroy', tab._dragListener.destroy, tab._dragListener);
                tab._dragListener.off('dragStart', tab._onDragStart);
                tab._dragListener = null;
            }
        }
    }

    checkActualActiveItemIndex(layout) {
        if (!!layout.content) {
            // if activeItemIndex exists and goes beyond. then set it in 0
            if (layout.activeItemIndex >= 0 && layout.activeItemIndex >= layout.content.length) {
                layout.activeItemIndex = 0;
            }
            // go to layout children content
            for (let j = 0; j < layout.content.length; j++) {
                layout.content[j] = this.checkActualActiveItemIndex(layout.content[j]);
            }
        }
        return layout;
    }

    checkLayoutCompByName(layout, compName, remove?: boolean) { // TODO remove after 24.09
        if (!!layout.content) {
            let comp = layout.content.find(function (el) {
                return el.componentName == compName;
            });
            if (comp) {
                if (remove) {
                    layout.content.splice(layout.content.indexOf(comp), 1);
                }
                return layout;
            }
            // go to layout children content
            for (let j = 0; j < layout.content.length; j++) {
                layout.content[j] = this.checkLayoutCompByName(layout.content[j], compName, remove);
                if (layout.content[j].content && !layout.content[j].content.length) { // delete content if content == []
                    layout.content.splice(layout.content.indexOf(layout.content[j]), 1);
                }
            }
        }
        return layout;
    }

    getMediaUrl(file): Observable<HttpResponse<any>> {
        return new Observable((observer: any) => {
            let url = file.PROXY_URL
            if (file.UsePresignedUrl && this.config.options.params.mediaType !== 'htmlPlayer') {
                let htmlPlayerService = this.injector.get(HTMLPlayerService);
                htmlPlayerService.getPresignedUrl(file.ID)
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe((res: any) => {
                            url = res;
                            observer.next({error: false, url: url});
                        },
                        (err: HttpErrorResponse) => {
                            let message = err.error.Message;
                            observer.next({error: true, message: message});
                            observer.complete();
                        }, () => {
                            observer.complete();
                        });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next({error: false, url: url});
                observer.complete();
                // });
            }
        });
    };

    saveLayout() {
        let mediaType = this.config.options.file['MEDIA_TYPE'];
        let mediaSubtypes = this.config.appSettings.getMediaSubtypes();
        if (!mediaType || mediaSubtypes == {}) {
            return
        }
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal = modalProvider.showByPath(lazyModules.save_default_layout_modal,
            SaveDefaultLayoutModalComponent, {
            size: "md",
            // title: 'media.table.modal_edit_som_eom.title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {mediaSubtypes: mediaSubtypes, mediaType: mediaType});
       modal.load().then(()=>{
           modal.modalEvents.subscribe((res: IMFXModalEvent) => {
               if (res && res.name == "ok") {
                   this.layout.trigger('stateChanged');
                   // let layoutService = this.injector.get(LayoutManagerService);
                   // layoutService.saveLayout().subscribe(resp => {
                   //         if (res) {
                   //             self.notificationService.notifyShow(1, "Layout " + this.layoutModel.Name + " Saved");
                   //         }
                   //     },
                   //     error => {
                   //         self.notificationService.notifyShow(2, 'Error', false);
                   //     });
               }
           });
       })
    }

    clearLayoutFromComponentState(content, self) {
        if (!content)
            return;
        if (content.componentState) {
            delete content.componentState;
        }
        if (content.content && content.content.length > 0) {
            content.content.forEach((el) => {
                self.clearLayoutFromComponentState(el, self);
            });
        }
    }

    translateTitle(container, type) {
        let fullKey = this.config.options.typeDetailsLocal + type;
        this.translate.get(fullKey)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
                (res: string) => {
                    container._config.title = res;
                });
    };

    public changeLayoutHandler($event, self) {
        self.storageService.clear(self.storagePrefix);
        self.layout.off('itemDestroyed');
        self.layout.off('stateChanged');
        self.layout.destroy();
        self.addClipSubcription && self.addClipSubcription.unsubscribe();
        // self.replaceClipSubcription && self.replaceClipSubcription.unsubscribe();
        self.newTabs = [];
        $('.drag-btns-wraper #tabbed-nav li').remove();
        self.layoutModel = $event;
        self.layoutConfig = JSON.parse(self.layoutModel.Layout);
    }

    public validateTab(self, container, isValid) {
        if (isValid) {
            container.tab && container.tab.element.find('i.lm_left').hide();
        } else {
            container.tab && container.tab.element.find('i.lm_left').show();
        }
        self.allValidTabs.filter(el => {
            return el.tTitle == container.title
        })[0].isValid = isValid;
    }

    public fillMarkers(types, series, file) {
        let groupIndex = -1;
        this.timelineConfig.Groups.forEach((g, idx)=>{
            if(g.Name == "Markers") {
                groupIndex = idx;
            }
        });
        if(groupIndex < 0) {
            this.timelineConfig.Groups.push({
                Name: "Markers",
                Expandable: true,
                Expanded: true,
                WithHeader: true,
                Rows: []
            });
            groupIndex = this.timelineConfig.Groups.length - 1;
        }
        else {
            this.timelineConfig.Groups[groupIndex].Rows = [];
        }
        let hasContent = false;
        for (const e in types) {
            this.timelineConfig.Groups[groupIndex].Rows.push({
                Name: types[e],
                Type: IMFXProTimelineType.Marker,
                Keys: []
            });

            const keys = series.filter((elem) => {
                return elem.TagType.toLocaleLowerCase() == types[e].toLocaleLowerCase();
            }).map((el) => {
                let inF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: el.InTc
                }).toFrames() - this.timelineConfig.From;
                let outF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: el.OutTc
                }).toFrames() - this.timelineConfig.From;

                return {
                    Frame: inF,
                    Length: el.InTc == el.OutTc ? 1 : outF - inF,
                    Value: 1,
                    Data: el
                };
            });
            for (let i = 0; i < keys.length; i++) {
                this.timelineConfig.Groups[groupIndex].Rows[this.timelineConfig.Groups[groupIndex].Rows.length - 1].Keys[keys[i].Frame] = keys[i];
            }
            if(keys.length > 0)
                hasContent = true;
        }
        this.timelineConfig.Groups[groupIndex].Expanded = hasContent;
    }

    public addTabCreated(self) {
        this.layout.off('tabCreated');
        this.layout.on('tabCreated', function (tab) {
            var currentTab = self.allValidTabs.filter(el => {
                return el.tTitle == tab.contentItem.container.title
            })[0];
            let notValid = currentTab && !currentTab.isValid;
            if (notValid) {
                tab.titleElement.prevObject.find('i.lm_left').show();
            }
            tab.closeElement.append("<button class='icon-button'><i class='icons-close-small icon close'></i></button>");
        });
    }

    public onItemDestroyed(self) {
        this.layout.off('itemDestroyed');
        this.layout.on('itemDestroyed', item => {
            if (item.config && item.config.type == 'component' &&
                (!(item.config.componentName == 'Media') || (item.config.componentName == 'Media' && !(<any>window)._imfxPopoutItem))) {
                let _tab = {
                    type: item.config.type,
                    componentName: item.config.componentName,
                    title: item.config.title,
                    tTitle: item.config.tTitle
                };
                if (!self.allValidTabs.filter(function (el) {
                    return el.tTitle == item.config.componentName
                })[0].isValid) {
                    // if ( typeof (item.container.compRef.instance.getValidation) == 'function' && !item.container.compRef.instance.getValidation()) {
                    $('.drag-btns-wraper #tabbed-nav').append($('<li style="position: relative;"><div class="invalid-triangle"></div> <a id="tab-drag-' + _tab.tTitle + '">' + _tab.title + '</a></li>'));
                } else {
                    $('.drag-btns-wraper #tabbed-nav').append($('<li style="position: relative;"><a id="tab-drag-' + _tab.tTitle + '">' + _tab.title + '</a></li>'));
                }
                let elementTab = $('li #tab-drag-' + _tab.tTitle);
                if (elementTab.length > 0) {
                    let el = this.layout.createDragSource(elementTab, _tab);
                }
            }
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();
                    this.layout.updateSize();
                }
            }
            if (item.componentName && this[item.componentName.toLocaleLowerCase() + 'Component']) { // delete global component - for example this.audiotracksComponent
                this[item.componentName.toLocaleLowerCase() + 'Component'] = null;
            }
            let $item = this.layout.container.find('.lm_goldenlayout');
            let $child = $item.children();
            if ($child.length === 0) {
                this.isEmpty = true;
                this.cd.detectChanges();
            }
        });
    }

    public onStateChanged(self) {
        this.layout.off('stateChanged');
        this.layout.on('stateChanged', function () {
            if (self.layout.openPopouts && self.layout.openPopouts.length === 0) {
                self.layoutConfig = JSON.stringify(self.layout.toConfig());
                if (self.layoutModel)
                    self.layoutModel.Layout = self.layoutConfig;
            }
        });
    }

    public setViewLayout() {
        this.layout.root && this.layout.root.getItemsByFilter(function (el) {
            return el.type == "stack" && el.contentItems.length == 0;
        }).forEach(function (elem) {
            elem.remove();
        });
        this.createDragButtons();
        this.config.options.firstLoadReadOnly = false;
    }

    setLayoutConfig(){
        this.layoutConfig = this.checkActualActiveItemIndex(this.layoutConfig);
        this.layoutConfig.settings.showCloseIcon = false;
        this.layoutConfig.settings.reorderEnabled = false;
        this.layoutConfig.settings.isClosable = false;
        this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));
    }

    _setDropdownListPosition() {
        let stackH = $(this).parents('.lm_stack').height() - 30;
        let listH = $(this).parents('.lm_header').children('.lm_tabdropdown_list').height();
        if (stackH - listH < 0) {
            $(this).parents('.lm_header').addClass('z_index_11');
            $(this).parents('.lm_header').children('.lm_tabdropdown_list').css('top', stackH - listH + 30);
        } else {
            $(this).parents('.lm_header').removeClass('z_index_11');
            $(this).parents('.lm_header').children('.lm_tabdropdown_list').css('top', 44);
        }
    }

// --------START overridden golden method-----------
    _highlightHeaderDropZoneOverride(x) {
        var _this = (<any>this);
        var i,
            tabElement,
            tabsLength = _this.header.tabs.length,
            isAboveTab = false,
            tabTop,
            tabLeft,
            offset,
            placeHolderLeft,
            headerOffset,
            tabWidth,
            halfX;

        // Empty stack
        if (tabsLength === 0) {
            headerOffset = _this.header.element.offset();

            _this.layoutManager.dropTargetIndicator.highlightArea({
                x1: headerOffset.left,
                x2: headerOffset.left + 100,
                y1: headerOffset.top + _this.header.element.height() - 20,
                y2: headerOffset.top + _this.header.element.height()
            });

            return;
        }

        for (i = 0; i < tabsLength; i++) {
            tabElement = _this.header.tabs[i].element;
            offset = tabElement.offset();
            if (_this._sided) {
                tabLeft = offset.top;
                tabTop = offset.left;
                tabWidth = tabElement.height();
            } else {
                tabLeft = offset.left;
                tabTop = offset.top;
                tabWidth = tabElement.width();
            }

            if (x > tabLeft && x < tabLeft + tabWidth) {
                isAboveTab = true;
                break;
            }
        }

        if (isAboveTab === false && x < tabLeft) {
            return;
        }

        halfX = tabLeft + tabWidth / 2;

        if (!tabElement.parent().hasClass('lm_tabdropdown_list')) {
            if (x < halfX) {
                _this._dropIndex = i;
                tabElement.before(_this.layoutManager.tabDropPlaceholder);
            } else {
                _this._dropIndex = Math.min(i + 1, tabsLength);
                tabElement.after(_this.layoutManager.tabDropPlaceholder);
            }
            if (_this._sided) {
                var placeHolderTop = _this.layoutManager.tabDropPlaceholder.offset().top;
                _this.layoutManager.dropTargetIndicator.highlightArea({
                    x1: tabTop,
                    x2: tabTop + tabElement.innerHeight(),
                    y1: placeHolderTop,
                    y2: placeHolderTop + _this.layoutManager.tabDropPlaceholder.width()
                });
                return;
            }
            placeHolderLeft = _this.layoutManager.tabDropPlaceholder.offset().left;

            _this.layoutManager.dropTargetIndicator.highlightArea({
                x1: placeHolderLeft,
                x2: placeHolderLeft + _this.layoutManager.tabDropPlaceholder.width(),
                y1: tabTop,
                y2: tabTop + tabElement.innerHeight()
            });
        }
    };

    _$createRootItemAreasOverride = function () {
        var _this = (<any>this);
        var areaSize = 50;
        var sides = {y2: 'y1', x2: 'x1', y1: 'y2', x1: 'x2'};

        for (var side in sides) {
            var area = _this.root._$getArea();
            area.side = side;
            if (sides [side][1] == '2')
                area[side] = area[sides [side]] - areaSize;
            else
                area[side] = area[sides [side]] + areaSize;
            area.surface = ( area.x2 - area.x1 ) * ( area.y2 - area.y1 );
            _this._itemAreas.push(area);
        }
    };
// --------END overridden golden method-----------

}
