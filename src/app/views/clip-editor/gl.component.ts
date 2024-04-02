import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    Input, ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import * as $ from 'jquery';
import { IMFXAccordionComponent } from '../../modules/search/detail/components/accordion.component/imfx.accordion.component';
import { IMFXHtmlPlayerComponent } from '../../modules/controls/html.player/imfx.html.player';
import { IMFXDefaultTabComponent } from '../../modules/search/detail/components/default.tab.component/imfx.default.tab.component';
import {TimelineConfig, TimelineSerieItem} from '../../modules/controls/imfx.pro.timeline.wrapper/timeline.config';
import { CELocatorsComponent } from './comps/locators/ce.locators.component';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import 'script-loader!golden-layout/lib/jquery.js';
// import 'script-loader!golden-layout/dist/goldenlayout.js';

import { IMFXVideoInfoComponent } from '../../modules/search/detail/components/video.info.component/video.info.component';

import { GLComponent } from '../../modules/search/detail/gl.component';
import { SimpleListComponent } from '../../modules/controls/simple.items.list/simple.items.list';
import { RCEArraySource } from './rce.component';
import { TimeCodeFormat, TMDTimecode } from '../../utils/tmd.timecode';
import { NotificationService } from "../../modules/notification/services/notification.service";
import { LocalStorageService } from "ngx-webstorage";
import { TranslateService } from "@ngx-translate/core";
import { ClipItem, ClipsStorageProvider } from "./providers/clips.storage.provider";
import { SplashProvider } from "../../providers/design/splash.provider";
import { LocatorsService } from "../../modules/controls/locators/services/locators.service";
import {
    LayoutManagerDefaults,
    LayoutManagerModel,
    LayoutType
} from "../../modules/controls/layout.manager/models/layout.manager.model";
import { IMFXClipCommentTabComponent } from "../../modules/search/detail/components/clip.comment.tab.component/imfx.clip.comment.tab.component";
import { GoldenTabs } from "./constants/constants";
import {DetailService} from "../../modules/search/detail/services/detail.service";
import {
    IMFXProTimeline,
    IMFXProTimelineType
} from "../../modules/controls/imfx.pro.timeline/models/imfx.pro.timeline.model";
import {IMFXProTimelineComponent} from "../../modules/controls/imfx.pro.timeline/imfx.pro.timeline";
import {ImfxProTimelineAdditionalButtonsWrapperComponent} from "../../modules/controls/imfx.pro.timeline.additional.buttons.wrapper/imfx.pro.timeline.additional.buttons.wrapper.component";

declare var GoldenLayout: any;

@Component({
    selector: 'golden-clip-editor-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXVideoInfoComponent,
        ImfxProTimelineAdditionalButtonsWrapperComponent,
        SimpleListComponent,
        CELocatorsComponent,
        IMFXClipCommentTabComponent
    ],
    providers: []
})

export class GLClipEditorComponent extends GLComponent {

    @Input() file;
    @Input() type;
    @Input() itemsMediaList = [];
    changeLayout: EventEmitter<any> = new EventEmitter<any>();
    public timelineComponent;
    public clipCommentsComponent;
    public mediaListComponent;
    public detailsComponent;
    // for update 'data' block when it removed from layout
    public detailsComponentFile;
    protected layoutModel: LayoutManagerModel;
    protected layoutType: LayoutType = LayoutType.Assess;
    protected allValidTabs = GoldenTabs.tabs;
    protected layoutTypeReady = false;
    protected loggerSeriesArray: Array<any> = [];
    @Input('config')
    set setConfig(config) {
        this.config = $.extend(true, this.config, config);
        this.config.componentContext = this;
        if (this.config.providerType) {
            this.provider = this.injector.get(this.config.providerType);
            this.provider.config = this.config;
        }
    }

    constructor(@Inject(ElementRef) protected el: ElementRef,
                @Inject(ViewContainerRef) protected viewContainer: ViewContainerRef,
                @Inject(ComponentFactoryResolver) protected componentFactoryResolver: ComponentFactoryResolver,
                @Inject(LocalStorageService) protected storageService: LocalStorageService,
                @Inject(ChangeDetectorRef) protected cd: ChangeDetectorRef,
                @Inject(NotificationService) protected notService: NotificationService,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(ClipsStorageProvider) protected clipsStorageProvider: ClipsStorageProvider,
                @Inject(SplashProvider) protected splashProvider: SplashProvider,
                @Inject(DetailService) protected detailService: DetailService,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                protected injector: Injector) {
        super(el,
            viewContainer,
            componentFactoryResolver,
            storageService,
            cd,
            translate,
            splashProvider,
            detailService,
            injector,
            notificationRef);
        location.hash = decodeURIComponent((<any>window).location.hash);
        let matches = location.hash.match(new RegExp('gl-window' + '=([^&]*)'));
        if (matches) {
            this.isPopout = true;
        }
    }

    ngOnLayoutInit(model) {
        // console.log('ngOnLayoutInit!!')
        this.config.componentContext = this;
        let glComp = this.config.componentContext;
        let mainModule = glComp.config.moduleContext;
        this.storagePrefix = 'clip.editor.' + mainModule.config.options.detailsviewType.toLocaleLowerCase() + '.saved.state';
        if (model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.layoutConfig = JSON.parse(model.actualModel.Layout);
            if (this.layoutConfig.content) {
                this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
            }
        }
        else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.layoutConfig = JSON.parse(this.layoutModel.Layout);
                    if (this.layoutConfig.content) {
                        this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
                    }
                }
                else {
                    this.layoutModel = model.defaultModel;
                    if (this.type && this.type == "MediaDetails") {
                        this.layoutConfig = JSON.parse(LayoutManagerDefaults.ClipEditorMedia);
                    }
                    else {
                        this.layoutConfig = JSON.parse(LayoutManagerDefaults.ClipEditorVersion);
                    }
                }
            }
            else {
                this.layoutModel = model.defaultModel;
                if (this.type && this.type == "MediaDetails") {
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.ClipEditorMedia);
                }
                else {
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.ClipEditorVersion);
                }
            }
        }
        this.postOnInit();
    }

    postOnInit() {
        this.setView();
        (<any>window).GoldenLayout.__lm.items.Stack.prototype._highlightHeaderDropZone = this._highlightHeaderDropZoneOverride;
        (<any>window).GoldenLayout.__lm.LayoutManager.prototype._$createRootItemAreas = this._$createRootItemAreasOverride;
        this.provider.setCreatePopoutMethod();
    }
    ngOnInit() {
        // console.log('isPopout' + this.isPopout)
        if (!this.isPopout) {
            // console.log('golden on init!!')
            this.layoutType = this.type && this.type == "MediaDetails" ? LayoutType.ClipEditorMedia : LayoutType.ClipEditorVersion;
            this.layoutTypeReady = true;
            this.changeLayout.subscribe((res: any) => {
                let data = res;
                new Promise((resolve, reject) => {
                    resolve();
                }).then(
                    () => {
                        // console.log('changeLayout subs!!')
                        if (this.layout) {
                            this.layout.off('itemDestroyed');
                            this.layout.destroy();
                        }
                        this.layoutConfig = JSON.parse(this.layoutConfig);
                        this.updateData(data);
                        this.postOnInit();
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            });
        } else {
            // console.log('else!!')
            this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));
            var self = this;
            this.addMediaLayout(self);
            // this.setEvents();
            this.layout.init();
            setTimeout(() => {
                // this.layout.updateSize();
                this.splashProvider.onHideSpinner.emit();
                this.cd.detectChanges();
            }, 2000);

        }
    }

    setView() {
        this.layoutConfig.settings.showCloseIcon = false;
        this.layoutConfig.settings.reorderEnabled = false;
        this.layoutConfig.settings.isClosable = false;
        this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));
        let self = this;

        this.layout.registerComponent('Data', (container, componentState) => {
            let fullKey = this.config.options.typeDetailsLocal + '.data';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.detailsComponentFile || self.config.options.file;
            compRef.instance.columnData = self.config.options.columnData;
            compRef.instance.lookup = self.config.options.lookup;
            container.getElement().append($(compRef.location.nativeElement));
            self.detailsComponent = container;
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
        this.addMediaLayout(self);
        this.addClipCommentsGrid(self);
        this.addTimeline(self);
        this.addTagging(self);
        if (this.type && this.type == "MediaDetails") {
            this.addMediaList(self);
        }
        this.setEvents();
        this.layout.off('stateChanged');
        this.layout.on('stateChanged', function () {
            if (self.layout.openPopouts.length === 0) {
                self.layoutConfig = JSON.stringify(self.layout.toConfig());
                if (self.layoutModel)
                    self.layoutModel.Layout = self.layoutConfig;
            }
        });
        this.layout.init();
        this.createNewTabsAfterInit();
        // console.log('close splash!')
        this.splashProvider.onHideSpinner.emit();
        this.layout.root.getItemsByFilter(function (el) {
            return el.type === 'stack' && el.contentItems.length === 0;
        }).forEach(function (elem) {
            elem.remove();
        });
        this.createDragButtons();
    };

    addMediaList(self) {
        this.layout.registerComponent('MediaItems', (container, componentState) => {
            let compRef;
            let fullKey = this.config.options.typeDetailsLocal + '.media_list';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(SimpleListComponent);
            compRef = this.viewContainer.createComponent(factory);
            if (this.itemsMediaList.length == 0) {
                self.itemsMediaList.push(self.config.moduleContext.config.componentContext.file);
                compRef.instance.items = self.itemsMediaList;
                compRef.instance.defaultFile = self.config.moduleContext.config.componentContext.defaultFile;
                compRef.instance.allowRemove = true;
            }
            else {
                compRef.instance.items = self.itemsMediaList;
                compRef.instance.defaultFile = self.config.moduleContext.config.componentContext.defaultFile;
                compRef.instance.allowRemove = true;
            }
            compRef.instance.glLink = this;
            compRef.instance.onSelect.subscribe(data => {
                if (data.file.ID != self.config.moduleContext.config.componentContext.file.ID) {
                    self.config.moduleContext.config.componentContext.file = data.file;
                    self.timelineComponent && self.timelineComponent.compRef.instance.setCurrentFile(data.file);
                    self.detailsComponent && (self.detailsComponent.compRef.instance.file = data.file);
                    self.detailsComponentFile = data.file;
                    self.config.moduleContext.config.componentContext.src = <RCEArraySource> [data.file].map(el => {
                        return {
                            id: el.ID,
                            restricted: el.MEDIA_STATUS == 1,
                            src: el.MEDIA_STATUS == 1 && !self.config.moduleContext.config.componentContext.playRestricted ? "" : el.PROXY_URL,
                            live: el.IsLive,
                            seconds: TMDTimecode.fromString(el.DURATION_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                            som: TMDTimecode.fromString(el.SOM_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                            som_string: el.SOM_text
                        };
                    });
                    self.playerComponents.compRef.instance.src = self.config.moduleContext.config.componentContext.src;
                    self.playerComponents.compRef.instance.file = data.file;
                    self.playerComponents.compRef.instance.id = data.file.ID;
                    //-----------
                    let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
                        return el.fileGuid == data.file.DFILE_LINK_GUID;
                    });
                    if (currentLoggerSeries.length === 0) { // if there is no loading series for current item
                        let locatorsService = self.injector.get(LocatorsService);
                        if (data.file.DFILE_LINK_GUID !== '' && data.file.DFILE_LINK_GUID !== null) {
                            locatorsService.getDetailMediaTagging(data.file.DFILE_LINK_GUID).subscribe( // load it
                                res => {
                                    self.loggerSeriesArray.push({
                                        fileGuid: data.file.DFILE_LINK_GUID,
                                        fileId: data.file.ID,
                                        series: res
                                    });
                                    self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                        file: data.file,
                                        series: res
                                    });
                                }
                            );
                        }
                    } else {
                        self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                            file: data.file,
                            series: currentLoggerSeries[0].series
                        });
                    }
                    //-----------
                    self.layout.emit('playerRefresh');

                    if (data.tc) {
                        if (self.playerComponents) {
                            self.playerComponents.compRef.instance.player.on('loadeddata', () => {
                                let nodeOpts = {
                                    markers: [
                                        {time: data.tc.in},
                                        {time: data.tc.out}
                                    ]
                                };
                                self.layout.emit(
                                    'setMarkers',
                                    {markers: nodeOpts.markers, m_type: 'locator', id: data.tc.id}
                                );
                                self.layout.emit('setTimecode', (data.tc.in));
                                if ((<any>window)._popoutWindow) {
                                    (<any>window)._popoutWindow.imfxCEPlayer.emit('setMarkers',
                                        {markers: nodeOpts.markers, m_type: 'locator', id: data.tc.id}
                                    );
                                    (<any>window)._popoutWindow.imfxCEPlayer.emit('setTimecode', (data.tc.in));
                                }
                            });

                        }
                    }
                }
            });

            compRef.instance.onRemove.subscribe(data => {
                //self.itemsMediaList.splice(self.itemsMediaList.findIndex(x => x.ID == data), 1);
            });

            self.mediaListComponent = container;

            compRef.instance['elem'] = container;
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            container.on('refresh', function () {
                compRef._component.refresh();
            });

            container.on('setItems', (items) => {
                this.itemsMediaList = (items);
                compRef._component.setItems(items);
            });

            container.on('addItem', function (data) {
                for (var i = 0; i < data.length; i++) {
                    let tmpData = data[i];
                    if (self.itemsMediaList.filter(e => e.ID === tmpData.ID).length == 0) {
                        self.itemsMediaList.push(tmpData);
                        compRef._component.addItem(tmpData);
                        let locatorsService = self.injector.get(LocatorsService);
                        if (tmpData.DFILE_LINK_GUID !== '' && tmpData.DFILE_LINK_GUID !== null) {
                            locatorsService.getDetailMediaTagging(tmpData.DFILE_LINK_GUID).subscribe((res: any) => {
                                    // self.config.options.series = res;
                                    self.loggerSeriesArray.push({
                                        fileGuid: tmpData.DFILE_LINK_GUID,
                                        fileId: tmpData.ID,
                                        series: res
                                    });
                                    if (compRef.instance.config) {
                                        // compRef.instance.config.series = res;
                                        self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                            file: tmpData,
                                            series: res
                                        });
                                    }
                                    ;
                                },
                                (error) => {
                                    console.log('error loading tagging!');
                                });
                        }
                    }
                    else {
                        self.notService.notifyShow(2, "This media item already exists in list", true);
                    }
                }
            });

            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMediaLayout(self) {
        this.layout.registerComponent('Media', (container, componentState) => {
            let compRef;
            let fullKey = this.config.options.typeDetailsLocal + '.player';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXHtmlPlayerComponent);
            compRef = this.viewContainer.createComponent(factory);
            let srcisAudio = false;
            if (self.isPopout) {
                srcisAudio = componentState.isLive;
            } else {
                srcisAudio = self.config.moduleContext.config.componentContext.srcisAudio;
            }
            let src = null;
            if (self.isPopout) {
                src = componentState.src;
            } else {
                src = self.config.moduleContext.config.componentContext.src;
            }
            let targetFile = <any>{};
            if (self.isPopout && componentState.file) {
                targetFile = componentState.file;
            } else {
                targetFile = self.config.moduleContext.config.componentContext.file;
            }
            compRef.instance.id = targetFile.ID;
            compRef.instance.isLive = srcisAudio;
            compRef.instance.src = src;
            compRef.instance.type = targetFile.MEDIA_TYPE;
            compRef.instance.file = targetFile;
            compRef.instance.som = targetFile.FILE_SOM
            compRef.instance.eom = targetFile.FILE_EOM
            compRef.instance.clipBtns = !this.getReadOnlyModeForTab(targetFile);
            compRef.instance.clipBtnsCallback = function (btns) {
                return btns.filter(el => {
                    return el.id !== 'markframe';
                });
            };
            compRef.instance.simpleModeClass = false;
            compRef.instance.typeDetails = 'clip-editor'; // this is for including segment plugin

            compRef.instance.clipAdded.subscribe(data => {

                // this.clipsStorageProvider.addItem(data);

                let tlc = self.layout.root.getItemsByFilter(function (el) {
                    return el.componentName == 'Timeline';
                });
                if (tlc.length === 0 && !(<any>window)._parentImfxWindow) { // no popout opened
                    self.config.moduleContext.config.componentContext.notificationRef.notifyShow(2, 'rce.no_timline_text');
                    return;
                }
                if ((<any>window)._parentImfxWindow && (<any>window)._parentImfxWindow.imfxTimelineComponent) {
                    (<any>window)._parentImfxWindow.imfxTimelineComponent.emit('clipAdded', data);
                }
                self.timelineComponent && self.timelineComponent.emit('clipAdded', data);
            });
            compRef.instance.clipReplaced.subscribe(data => {
                // this.clipsStorageProvider.replaceItem(data);
                let tlc = self.layout.root.getItemsByFilter(function (el) {
                    return el.componentName == 'Timeline';
                });
                if (tlc.length === 0 && !(<any>window)._parentImfxWindow) { // no popout opened{
                    self.config.moduleContext.config.componentContext.notificationRef.notifyShow(2, 'rce.no_timline_text');
                    return;
                }
                if ((<any>window)._parentImfxWindow && (<any>window)._parentImfxWindow.imfxTimelineComponent) {
                    (<any>window)._parentImfxWindow.imfxTimelineComponent.emit('clipReplaced', data);
                }
                self.timelineComponent && self.timelineComponent.emit('clipReplaced', data);
            });

            (<any>window).imfxCEPlayer = self.playerComponents = container;

            compRef.instance['elem'] = container;
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            this.layout.on('setMarkers', function (data) {
                compRef._component.setMarkers(data);
            });
            this.layout.on('clearMarkers', function (data) {
                compRef._component.clearMarkers(data);
            });
            this.layout.on('selectClipStateBtns', function () {
                compRef._component.selectClipStateBtns(true);
            });
            container.on('resetReplaceIdx', function () {
                compRef._component.resetReplaceIdx();
            });
            this.layout.on('setPercent', function (percent) {
                compRef._component.setPercent(percent);
            });
            this.layout.on('setTimecode', function (percent) {
                compRef._component.setTimecode(percent);
            });
            this.layout.on('playerRefresh', function () {
                compRef._component.refresh();
            });
            this.layout.on('getInOutTimecodesFromPlayer',(replace) => {
                compRef._component.addClipFromPlayer(replace);
            });
            compRef.instance.playerReady.subscribe((data) => {
                self.layout.emit('playerReady', data);
            });
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
            // set params for popout if currently it's not popout
            if (!self.isPopout) {
                componentState.file = self.config.moduleContext.config.componentContext.file;
                componentState.isLive = self.config.moduleContext.config.componentContext.srcisAudio;
                componentState.src = self.config.moduleContext.config.componentContext.src;
                container.setState(componentState);
            }
        });
    }

    addTimeline(self) {
        this.layout.registerComponent('Timeline', (container, componentState) => {
            this.translateTitle(container, '.timeline');

            let factory = (<any>self).componentFactoryResolver.resolveComponentFactory(ImfxProTimelineAdditionalButtonsWrapperComponent);
            let compRef = (<any>self).viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;

            let file = (<any>self).config.options.file;
            let items:Array<TimelineSerieItem> = this.clipsStorageProvider.getItems();
            let readOnly = this.getReadOnlyModeForTab(file);
            compRef.instance.fillTimeline(file, items, readOnly);

            compRef.instance.onClickClip.subscribe(clip => {
                if(!clip) {
                    self.layout.emit('clearMarkers', 0);
                    return;
                }
                self.layout.emit('setMarkers', {
                    markers: [{time: clip.inTC}, {time: clip.outTc}],
                    id: clip.id,
                    m_type: 'clip'
                });
                self.layout.emit('setTimecode', clip.inTC);
                self.layout.emit('selectClipStateBtns');
                self.layout.emit('selectComment', clip.id);
                if (self.mediaListComponent && clip.mediaId && clip.mediaId != self.config.moduleContext.config.componentContext.file.ID) {
                    self.mediaListComponent.compRef.instance.selectItem(clip.mediaId, clip);
                }
            });

            compRef.instance.onDragClip.subscribe(clipsData => {
                if (self.clipCommentsComponent) {
                    self.clipCommentsComponent.compRef.instance.reorderClips(clipsData);
                } else {
                    let buffArr = []
                    let items:Array<TimelineSerieItem> = this.clipsStorageProvider.getItems();
                    clipsData.forEach(clip => {
                        let buffClip = null;
                        items.forEach((el, ind) => {
                            if (clip.ClipId == ind){
                                buffClip = el;
                            };
                        })
                        if(buffClip)
                            buffArr.push(buffClip)
                    });
                    this.clipsStorageProvider.setItems(buffArr);
                }
            });

            compRef.instance.onClipRemoved.subscribe(clip => {
                self.layout.emit('clearMarkers', 0);
                self.clipCommentsComponent && self.clipCommentsComponent.compRef.instance.removeClip(clip);
            });

            compRef.instance.onButtonPressed.subscribe(replace => {
                self.layout.emit('getInOutTimecodesFromPlayer', replace);
            });

            container.on('clipAdded', (data) => {
                compRef.instance.clipAddedHandler(data);
                self.clipCommentsComponent && self.clipCommentsComponent.compRef.instance.addNewClip(data);
            });

            container.on('clipReplaced', (data) => {
                compRef.instance.clipReplacedHandler(data);
                self.clipCommentsComponent && self.clipCommentsComponent.compRef.instance.replaceClip(data);
            });

            container.on('setSelectedClipById', (id) => {
                compRef.instance.setSelectedClipById(id);
            });

            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });

            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.setReadOnlyMode(readOnly);
            });

            compRef.changeDetectorRef.detectChanges();

            (<any>window).imfxTimelineComponent = self.timelineComponent = container;
        });
    };

    addTagging(self) {
        this.layout.registerComponent('Tagging', (container, componentState) => {
            let fullKey = 'media_details.tabs.mMediaTagging';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(CELocatorsComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            container.on('clearMarkers', function (data) {
                if ((<any>window)._popoutWindow) {
                    (<any>window)._popoutWindow.imfxCEPlayer.emit('clearMarkers', data);
                }
                self.layout.emit('clearMarkers', data);
            });
            // check locators when change layout
            let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
                return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
            });
            if (currentLoggerSeries.length === 0) { // if there is no loading series for current item
                let locatorsService = self.injector.get(LocatorsService);
                if (self.config.options.file.DFILE_LINK_GUID !== '' && self.config.options.file.DFILE_LINK_GUID !== null) {
                    locatorsService.getDetailMediaTagging(self.config.options.file.DFILE_LINK_GUID).subscribe(
                        res => {
                            // self.config.options.series = res;
                            self.loggerSeriesArray.push({
                                fileGuid: self.config.options.file.DFILE_LINK_GUID,
                                fileId: self.config.options.file.ID,
                                series: res
                            });
                            if (compRef.instance.config) {
                                // compRef.instance.config.series = res;
                                self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                    file: self.config.options.file,
                                    series: res
                                });
                            }
                            ;
                        }
                    );
                }
            }
            compRef.instance['config'] = {
                file: self.config.options.file,
                series: [],//self.config.options.series/*[0] && self.config.options.series[0].source*/,
                elem: container,
                componentContext: self.config.componentContext,
                commentsColumns: [/*"thumbIn", "thumbOut",*/ "InTc", "OutTc", "DurationTc", "Notes", "Tags"],
                blackDetectedColumns: ["InTc", "OutTc", "DurationTc", "Notes", "Tags"],
                options: {}
            };
            compRef.instance.onSetTaggingNode.subscribe(o => {
                if ((<any>window)._popoutWindow) {
                    (<any>window)._popoutWindow.imfxCEPlayer.emit('setMarkers', o);
                }
                self.layout.emit('setMarkers', o);
            });
            compRef.instance.onSetTimecodeString.subscribe(tc => {
                self.layout.emit('setTimecode', tc);
            });
            self.taggingComponent = container;
        });
    }

    addClipCommentsGrid(self) {
        this.layout.registerComponent('ClipComments', (container, componentState) => {
            let fullKey = 'rce.clip_comments';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXClipCommentTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            container.on('setMarkers', function (data) {
                if ((<any>window)._popoutWindow) {
                    (<any>window)._popoutWindow.imfxCEPlayer.emit('setMarkers', data);
                }
                self.layout.emit('setMarkers', data);
            });
            container.on('clearMarkers', function (data) {
                if ((<any>window)._popoutWindow) {
                    (<any>window)._popoutWindow.imfxCEPlayer.emit('clearMarkers', data);
                }
                self.layout.emit('clearMarkers', data);
            });
            container.on('setComment', function (data) {
                self.timelineComponent && self.timelineComponent.emit('setClipComment', data);
            });
            compRef.instance.commentRowSelected.subscribe((id) => {
                self.timelineComponent && self.timelineComponent.emit('setSelectedClipById', id);
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.setReadOnly(readOnly);
            });
            this.layout.on('selectComment', function (id) {
                compRef.instance.selectComment(id);
            });
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            let items:Array<TimelineSerieItem> = this.clipsStorageProvider.getItems();
            let index = 0;
            compRef.instance['config'] = {
                file: self.config.options.file,
                elem: container,
                componentContext: self.config.componentContext,
                items: items.map(item => {
                    return {
                        InTc: item.startTimecode,
                        OutTc: item.endTimecode,
                        Comment: item.comment,
                        timelineId: index++
                    };
                }),
                readOnly: this.getReadOnlyModeForTab(self.config.options.file)
            };
            self.clipCommentsComponent = container;
        });
    }

    getTimelineItems() {
        this.playerComponents.compRef.instance.player.pause();
        let clips = this.timelineComponent.compRef.instance.getTimelineData();
        let comments = [];
        if (this.clipCommentsComponent) {
            comments = this.clipCommentsComponent.compRef.instance.getClipCommentsItems()
        } else {
            let index = 0;
            let items:Array<TimelineSerieItem> = this.clipsStorageProvider.getItems();
            comments = items.map(item => {
                return {
                    Comment: item.comment,
                    timelineId: index++
                };
            });
        }
        clips.forEach((clip, idx) => {
            if(comments.length) {
                clip.comment = comments.filter(el => {
                    return el.timelineId == clip.id;
                })[0].Comment;
            }
            clip.file = this.itemsMediaList.filter(file => {
                return file.ID == clip.mediaId
            })[0];
        });
        return clips;
    }

    resetLayout() {
        this.storageService.clear(this.storagePrefix);
        this.layout.off('itemDestroyed');
        this.layout.off('stateChanged');
        this.layout.destroy();
        this.newTabs = [];
        $('.drag-btns-wraper #tabbed-nav li').remove();
        this.layoutConfig = this.config.options.layoutConfig;
        this.setView();
    }

    createNewTabsAfterInit() {
        for (var i = 0; i < this.allValidTabs.length; i++) {
            if (!this.type || this.type && this.type != "MediaDetails" && this.allValidTabs[i].componentName == 'MediaItems') {
                continue;
            }
            let tab = this.allValidTabs[i];
            let buf = this.layout.root.getItemsByFilter(function (el) {
                return el.componentName == tab.tTitle;
            });
            if (buf.length === 0) {
                this.newTabs.push(tab);
            }
        }
        this.cd.detectChanges();
    }

    changeLayoutHandler($event) {
        super.changeLayoutHandler($event, this);
        if (this.layoutModel.IsDefault) {
            this.saveLayoutHandler($event);
        }
        this.setView();
    }

    saveLayoutHandler($event) {
        this.layoutModel = $event;
        this.layoutConfig = JSON.parse(this.layoutModel.Layout);
        this.storageService.store(this.storagePrefix, JSON.stringify(this.layoutModel));
    }
}
