import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation, Injector, Inject, ElementRef, ViewContainerRef, ComponentFactoryResolver, ChangeDetectorRef,
    Input,
} from '@angular/core';
import * as $ from 'jquery';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import {IMFXAccordionComponent} from "../../../../modules/search/detail/components/accordion.component/imfx.accordion.component";
import {IMFXHtmlPlayerComponent} from "../../../../modules/controls/html.player/imfx.html.player";
import {IMFXDefaultTabComponent} from "../../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component";

import {GLComponent} from "../../../../modules/search/detail/gl.component";
import {LocalStorageService} from "ngx-webstorage";
import { TranslateService } from '@ngx-translate/core';
import {SplashProvider} from "../../../../providers/design/splash.provider";
import {IMFXSubtitlesGrid} from "../../../../modules/search/detail/components/subtitles.grid.component/subtitles.grid.component";
import {IMFXMetadataTabComponent} from "../../../../modules/search/detail/components/metadata.tab.component/imfx.metadata.tab.component";
import {IMFXNotesTabComponent} from "../../../../modules/search/detail/components/notes.tab.component/imfx.notes.tab.component";
import {LayoutManagerModel, LayoutType, LayoutManagerDefaults} from "../../../../modules/controls/layout.manager/models/layout.manager.model";
import {IMFXNotAvailableComponent} from "../../../../modules/controls/not.available.comp/imfx.not.available.comp";
import {HTMLPlayerService} from "../../../../modules/controls/html.player/services/html.player.service";
import {NotificationService} from "../../../../modules/notification/services/notification.service";
import {MediaLanguageListComponent} from "../../../../modules/search/detail/components/media.language.items.list/media.language.items.list";
import {GoldenTabs} from "./constants/constants";
import {DetailService} from "../../../../modules/search/detail/services/detail.service";
import {IMFXMediaInfoComponent} from "../../../../modules/search/detail/components/mediainfo.tab.component/imfx.mediainfo.tab.component";
import {JobStatuses} from "../../../workflow/constants/job.statuses";
import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {IMFXProTimelineType} from "../../../../modules/controls/imfx.pro.timeline/models/imfx.pro.timeline.model";
import {ImfxProTimelineQCWrapperModule} from "./components/imfx.pro.timeline.qc.wrapper";
import {ImfxProTimelineQCWrapperComponent} from "./components/imfx.pro.timeline.qc.wrapper/imfx.pro.timeline.qc.wrapper.component";

declare var GoldenLayout: any;

@Component({
    selector: 'golden-component-qc-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXNotesTabComponent,
        IMFXSubtitlesGrid,
        IMFXMetadataTabComponent,
        IMFXNotAvailableComponent,
        MediaLanguageListComponent,
        IMFXMediaInfoComponent,
        ImfxProTimelineQCWrapperComponent
    ],
    providers: [
        HTMLPlayerService
    ]
})

export class GLComponentQCComponent extends GLComponent {
    public layoutModel: LayoutManagerModel;
    @Input() layoutType: LayoutType = LayoutType.ComponentQC;
    private notesComponent: any = null;
    private mediaLangComponent: any = null;
    private subtitleComponent: any = null;
    private mediainfoComponent: any = null;
    private selectedMediaId = 0;
    private allValidTabs = GoldenTabs.tabs;
    private synchronizationSubsEnabled: boolean = false;

    constructor(@Inject(ElementRef) protected el: ElementRef,
                @Inject(ViewContainerRef) protected viewContainer: ViewContainerRef,
                @Inject(ComponentFactoryResolver) protected componentFactoryResolver: ComponentFactoryResolver,
                @Inject(LocalStorageService) protected storageService: LocalStorageService,
                @Inject(ChangeDetectorRef) protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(SplashProvider) protected splashProvider: SplashProvider,
                @Inject(DetailService) protected detailService: DetailService,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                public injector: Injector) {
        super(el, viewContainer, componentFactoryResolver, storageService, cd, translate, splashProvider, detailService, injector, notificationRef);
    }

    ngOnInit() {
    }

    ngOnLayoutInit(model) {
        this.config.componentContext = this;
        this.storagePrefix = this.config.options.titleForStorage + '.saved.state';
        if (model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.layoutConfig = JSON.parse(model.actualModel.Layout);
            this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
        }
        else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.layoutConfig = JSON.parse(this.layoutModel.Layout);
                    this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
                }
                else {
                    this.layoutModel = model.defaultModel;
                    if (this.layoutType == LayoutType.ComponentQC) {
                        this.layoutConfig = JSON.parse(LayoutManagerDefaults.ComponentQC);
                    } else {
                        this.layoutConfig = JSON.parse(LayoutManagerDefaults.SubtitlesQC);
                    }
                }
            }
            else {
                this.layoutModel = model.defaultModel;
                if (this.layoutType == LayoutType.ComponentQC) {
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.ComponentQC);
                } else {
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.SubtitlesQC);
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

    setView() {
        super.setLayoutConfig();

        let self = this;

        this.addJobDataTab(self);
        this.addMediaDataTab(self);
        this.addMediaLayout(self);
        this.addNotesTab(self);
        this.addMediaLanguage(self);
        this.addMediaInfoTab(self);
        this.addSubtitlesTab(self);
        if (this.layoutType == LayoutType.ComponentQC)
            this.addTimeline(self);
        this.setEvents();
        super.onStateChanged(this);
        this.layout.init();
        this.createNewTabsAfterInit();
        this.splashProvider.onHideSpinner.emit();
        super.setViewLayout();
    };

    addTimeline(self) {
        // !!!! IMPORTANT - data loading in addMediaTagging
        this.layout.registerComponent('Timeline', (container, componentState) => {
            this.translateTitle(container, '.timeline');

            let factory = (<any>self).componentFactoryResolver.resolveComponentFactory(ImfxProTimelineQCWrapperComponent);
            let compRef = (<any>self).viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;

            let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
            let file = (<any>self).config.options.file;
            let series = (<any>self).config.options.series;

            compRef.instance.onClickFrame.subscribe(marker => {
                self.layout.emit('setMarkers', {
                    markers: [{time: marker.Data.InTc}, {time: marker.Data.OutTc}],
                    id: marker.Data.Id,
                    m_type: 'locator'
                });
                compRef.instance.SetTimelineTime(marker.Frame);
                self.layout.emit('clearClipBntsState');
            });

            compRef.instance.onDragCurrentTime.subscribe((frame) => {
                self.layout.emit('setTimecodeFrames', frame);
            });

            compRef.instance.onRowHeaderClicked.subscribe((data) => {
                let file = data.file;
                if(file) {
                    if (self.mediaLangComponent) {
                        self.mediaLangComponent.compRef.instance.selectItemFormExternal(file.ID);
                    }
                    self.selectedMediaId = file.ID;
                    if(self.subtitleComponent) {
                        self.subtitleComponent.compRef.instance.mediaNotes.text = '';
                        self.subtitleComponent.compRef.instance.setSubtitles([], null, false);
                    }
                    self.layout.emit('updateAudioSrc', {src: file.PROXY_URL, label: file.FILENAME});
                }
                else {
                    self.layout.emit('updateAudioSrc', null);
                    self.layout.emit('setAudioTrackByIndex', data.index);
                }
            });

            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });

            compRef.changeDetectorRef.detectChanges();

            self.layout.on("internalTrackPlaybackChange", index => {
                if(self.timelineComponent)
                    self.timelineComponent.compRef.instance.selectInternalAudiotrackOutside(index);
            });

            self.layout.on("externalTrackPlaybackChange", index => {
                if(self.timelineComponent)
                    self.timelineComponent.compRef.instance.selectExternalAudiotrackOutside(self.selectedMediaId);
            });
            self.layout.on('timecodeChange', tcStr => {
                var tc = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: tcStr
                });
                if(self.timelineComponent)
                    self.timelineComponent.compRef.instance.SetTimelineTime(tc.toFrames());
            });

            (<any>window).imfxTimelineComponent = self.timelineComponent = container;

            if(self.timelineComponent) {
                self.timelineComponent.compRef.instance.fillTimelineData(types, file, series, this.videoInfo, this.detailService, self.config.moduleContext.mediaItems);
            }
        });;
    }

    addJobDataTab(self) {
        this.layout.registerComponent('JobData', (container, componentState) => {
            this.translateTitle(container, '.jobdata');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.moduleContext.savingModel.Job;
            compRef.instance.columnData = self.config.options.jobColumnData;
            compRef.instance.lookup = self.config.options.jobLookup;
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMediaDataTab(self) {
        this.layout.registerComponent('Data', (container, componentState) => {
            const compRef = super.addMediaTab(self, container);
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next(self.config.options.file);
            });
            compRef.changeDetectorRef.detectChanges();
        });
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
    addSubtitlesTab(self) {
        this.layout.registerComponent('Subtitles', (container, componentState) => {
            this.translateTitle(container, '.subtitles');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXSubtitlesGrid);
            let compRef = this.viewContainer.createComponent(factory);
            let goldenRef = this;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                file: self.config.options.file,
                elem: container,
                readOnly: this.getReadOnlyModeForTab(self.config.options.file)
            };
            compRef.instance['timecodeFormatString'] = self.config.options.file.TimecodeFormat || 'Pal';
            goldenRef.subtitlesGrid = compRef.instance;
            let subs = self.config.moduleContext.subtitles;
            self.selectedMediaId = self.selectedMediaId || (subs.length ? subs[0].mediaId : 0);
            let selectedSubs = subs.find(el => {
                return el.mediaId == self.selectedMediaId;
            });
            compRef.instance['subtitles'] = selectedSubs ? selectedSubs.subtitles : [];
            compRef.instance['mediaNotes'] = {
                visible: true,
                text: selectedSubs ? selectedSubs.notes : ''
            };
            if (self.config.options.file.Subtitles && self.config.options.file.Subtitles.length > 0) {
                compRef.instance['showSynchronizationBtn'] = true;
            }
            container.on('setTimecode', function (tc) {
                self.layout.emit('setTimecode', tc);
            });
            container.on('setTimedTextById', function (id) {
                self.layout.emit('setTimedTextById', id);
            });
            self.layout.on('timecodeChange', tcStr => {
                const comp: IMFXSubtitlesGrid = (compRef.instance as IMFXSubtitlesGrid);
                if (comp && comp.searchTextComp) {
                    if (!comp.searchTextComp.mutedFollow) {
                        compRef.instance['selectRow'](tcStr);
                    }
                }
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onSetReadOnly.next(readOnly);
            });
            compRef.instance.onSynchronizationEnabled.subscribe((res: any) => {
                this.synchronizationSubsEnabled = res;
                if (this.synchronizationSubsEnabled) {
                    this.layout.emit('setTimedTextById', this.selectedMediaId);
                }
            });
            compRef.instance.onDataChanged.subscribe((res: any) => {
                self.config.moduleContext.subtitles.forEach(el => {
                    if (el.mediaId == self.selectedMediaId) {
                        el.notes = res;
                    }
                });
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            self.subtitleComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    addNotesTab(self) {
        this.layout.registerComponent('Notes', (container, componentState) => {
            this.translateTitle(container, '.notes');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXNotesTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                fileNotes: <any>self.config.moduleContext.savingModel.UserTaskNotes,
                readOnly: this.getReadOnlyModeForTab(self.config.options.file),
                adminNotes: <any>self.config.moduleContext.savingModel.Task.TSK_NOTES || '-'
            };
            compRef.instance.onDataChanged.subscribe((res: any) => {
                self.config.moduleContext.savingModel.UserTaskNotes = res;
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({fileNotes: <any>self.config.moduleContext.savingModel.UserTaskNotes, readOnly: readOnly});
            });
            self.notesComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    addMediaLanguage(self) {
        this.layout.registerComponent('Language', (container, componentState) => {
            this.translateTitle(container, '.language');
            let factory = this.componentFactoryResolver.resolveComponentFactory(MediaLanguageListComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                items: self.config.moduleContext.mediaItems,
                lookup: 'Languages',
                readOnly: this.getReadOnlyModeForTab(self.config.options.file)
            };
            compRef.instance.onSelect.subscribe((res: any) => {

                if (self.config.options.useMediaItems) {
                    let mediainfoComponent = self.mediainfoComponent.compRef.instance;
                    mediainfoComponent['config'] = res.file;
                    mediainfoComponent.cdr.detectChanges();
                }

                if (res.file.MEDIA_TYPE == self.config.appSettings.mediaSubtypes.Audio) {

                    self.selectedMediaId = res.file.ID;
                    if(self.subtitleComponent) {
                        self.subtitleComponent.compRef.instance.mediaNotes.text = '';
                        self.subtitleComponent.compRef.instance.setSubtitles([], null, false);
                    }
                    if(self.timelineComponent) {
                        self.timelineComponent.compRef.instance.selectExternalAudiotrackOutside(self.selectedMediaId);
                    }
                    self.layout.emit('updateAudioSrc', {src: res.file.PROXY_URL, label: res.file.FILENAME});

                } else { // res.file.MEDIA_TYPE == self.config.appSettings.mediaSubtypes.Subtile
                    let subs = self.config.moduleContext.subtitles.find(el => {
                        return el.mediaId == res.file.ID;
                    });
                    // console.log(res.file.ID)
                    self.selectedMediaId = subs.mediaId;
                    if (this.synchronizationSubsEnabled) {
                        self.layout.emit('setTimedTextById', self.selectedMediaId);
                    }
                    if (self.subtitleComponent) {
                        self.subtitleComponent.compRef.instance.mediaNotes.text = subs.notes;
                        self.subtitleComponent.compRef.instance.setSubtitles(subs.subtitles, null, (self.config.options.file.Subtitles && self.config.options.file.Subtitles.length > 0));
                    }
                    if(self.timelineComponent) {
                        self.timelineComponent.compRef.instance.selectExternalAudiotrackOutside(null);
                    }
                    self.layout.emit('updateAudioSrc', null);
                }
            });

            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onSetReadOnly.next(readOnly);
            });
            self.layout.on('timedTextChange', o => {
                if (this.synchronizationSubsEnabled) {
                    self.mediaLangComponent.compRef.instance.selectItemFormExternal(o.id);
                    let subs = self.config.moduleContext.subtitles.filter(el => {
                        return el.mediaId == o.id;
                    })[0];
                    self.selectedMediaId = subs.mediaId;
                    self.subtitleComponent.compRef.instance.mediaNotes.text = subs.notes;
                    self.subtitleComponent.compRef.instance.setSubtitles(subs.subtitles, null, (self.config.options.file.Subtitles && self.config.options.file.Subtitles.length > 0));
                }
            });
            compRef.instance.onDataChanged.subscribe((res: any) => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.changeDetectorRef.detectChanges();
            self.mediaLangComponent = container;
        });
    }
    addMediaInfoTab(self) {
        this.layout.registerComponent('MediaInfo', (container, componentState) => {
            this.translateTitle(container, '.media_info');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXMediaInfoComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            compRef.instance['config'] = self.getFile(self, self.config.options.useMediaItems);
            compRef.instance['showCommonInfo'] = false;
            compRef.instance['customMediaStatusLookups'] = self.config.moduleContext.customMediaStatusLookups;
            compRef.instance['customMediaStatusSettings'] = self.config.moduleContext.savingModel.Task.TechReport
                && self.config.moduleContext.savingModel.Task.TechReport.CustomMediaStatusSettings;
            compRef.instance['readOnly'] = self.getReadOnlyModeForTab(self.config.options.file);
            compRef.instance.onDataChanged.subscribe((res: any) => {
                // self.config.moduleContext.savingModel.Media.CustomStatuses = self.config.options.file.CustomStatuses;
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.instance.isDataValid.subscribe(isValid => {
                super.validateTab(self, container, isValid);
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({
                    file: self.getFile(self, self.config.options.useMediaItems),
                    readOnly: readOnly
                });
            });
            compRef.changeDetectorRef.detectChanges();
            self.mediainfoComponent = container;
        });
    }

    getFile(self, flag) {
        let file;
        if (flag) {
            let mediainfoComponent = self.mediainfoComponent && self.mediainfoComponent.compRef.instance || null;
            let index = mediainfoComponent && mediainfoComponent.selectedItemIndex
            || self.getSelectedMediaItemIndex() > -1
                ? self.getSelectedMediaItemIndex()
                : 0;

            file =
                Array.isArray(self.config.moduleContext.mediaItems)
                && (self.config.moduleContext.mediaItems.length !=0)
                && self.config.moduleContext.mediaItems[index]
                || null;
        } else {
            file = self.config.options.file;
        }

        return file;
    }

    getSelectedMediaItemIndex() {
        if (Array.isArray(this.config.moduleContext.mediaItems)) {
            return this.config.moduleContext.mediaItems.findIndex(el => el.ID == this.selectedMediaId);
        } else {
            return -1;
        }
    }
    translateTitle(container, type) {
        let fullKey = this.config.options.typeDetailsLocal + type;
        this.translate.get(fullKey).subscribe(
            (res: string) => {
                container._config.title = res;
            });
    };
    getReadOnlyModeForTab(file) {
        let data = this.storageService.retrieve('permissions');
        if (this.config.moduleContext.savingModel.Task.LOCKED_BY !== data.FullName) {
            return true;
        }
        if (this.config.moduleContext.savingModel.Task.TSK_STATUS !== JobStatuses.INPROG) {
            return true;
        } else {
            return file.IsGanged && !file.IsGangedMain || false;
        }
    }
    setReadOnlyMode() {
        let readOnly = this.getReadOnlyModeForTab(this.config.options.file);
        this.layout.emit('setReadOnly', readOnly);
    };
    createNewTabsAfterInit() {
        if (!this.layout.root)
            return;
        for (var i = 0; i < this.allValidTabs.length; i++) {
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
}
