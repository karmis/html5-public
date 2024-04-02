import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation, Injector, Inject, ElementRef, ViewContainerRef, ComponentFactoryResolver, ChangeDetectorRef,
    Input, Output, EventEmitter
} from '@angular/core';
import * as $ from 'jquery';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import { IMFXVideoInfoComponent } from "../../../../modules/search/detail/components/video.info.component/video.info.component";
import { IMFXAccordionComponent } from "../../../../modules/search/detail/components/accordion.component/imfx.accordion.component";
import { IMFXHtmlPlayerComponent } from "../../../../modules/controls/html.player/imfx.html.player";
import { IMFXDefaultTabComponent } from "../../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component";
import { IMFXQcReportsComponent } from '../../../../modules/search/detail/components/qc.reports.component/imfx.qc.reports.component';

import { IMFXMediaTaggingTabComponent } from "../../../../modules/search/detail/components/media.tagging.tab.component/imfx.media.tagging.tab.component";
import { IMFXLocatorsComponent } from "../../../../modules/controls/locators/imfx.locators.component";

import { GLComponent } from "../../../../modules/search/detail/gl.component";
import { SimpleListComponent } from "../../../../modules/controls/simple.items.list/simple.items.list";
import { TimelineConfig } from "../../../../modules/controls/imfx.pro.timeline.wrapper/timeline.config";
import { TimeCodeFormat, TMDTimecode } from "../../../../utils/tmd.timecode";
import { RCEArraySource } from "../../../clip-editor/rce.component";
import { IMFXSegmentsTabComponent } from "../../../../modules/search/detail/components/segments.tab.component/imfx.segments.tab.component";
import { AssessmentProvider } from "./providers/assessment.provider";
import { LocalStorageService } from "ngx-webstorage";
import { TranslateService } from '@ngx-translate/core';
import { SplashProvider } from "../../../../providers/design/splash.provider";
import { IMFXMediaInfoComponent } from "../../../../modules/search/detail/components/mediainfo.tab.component/imfx.mediainfo.tab.component";
import { CELocatorsComponent } from "../../../clip-editor/comps/locators/ce.locators.component";
import { IMFXSubtitlesGrid } from "../../../../modules/search/detail/components/subtitles.grid.component/subtitles.grid.component";
import { MediaDetailMediaCaptionsResponse } from "../../../../models/media/detail/caption/media.detail.media.captions.response";
import { IMFXMetadataTabComponent } from "../../../../modules/search/detail/components/metadata.tab.component/imfx.metadata.tab.component";
import { IMFXNotesTabComponent } from "../../../../modules/search/detail/components/notes.tab.component/imfx.notes.tab.component";
import { IMFXEventsTabComponent } from "../../../../modules/search/detail/components/events.tab.component/imfx.events.tab.component";
import {
    LayoutManagerModel,
    LayoutType,
    LayoutManagerDefaults
} from "../../../../modules/controls/layout.manager/models/layout.manager.model";
import { IMFXAudioTracksTabComponent } from "../../../../modules/search/detail/components/audio.tracks.tab.component/imfx.audio.tracks.tab.component";
import { IMFXAiTabComponent } from "../../../../modules/search/detail/components/ai.tab.component/ai.tab.component";
import { IMFXImageComponent } from "../../../../modules/search/detail/components/image.component/imfx.image.component";
import { IMFXNotAvailableComponent } from "../../../../modules/controls/not.available.comp/imfx.not.available.comp";
import { LayoutManagerService } from "../../../../modules/controls/layout.manager/services/layout.manager.service";
import { Subject } from "rxjs/Subject";
import { AVFaultsTabComponent } from "../../../../modules/search/detail/components/av.faults.tab.component/av.faults.tab.component";
import { ValidFields } from "../assessment/constants/valid.fields";
import { Observable } from "rxjs";
import { Subscription } from 'rxjs';
import { HTMLPlayerService } from "../../../../modules/controls/html.player/services/html.player.service";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import * as Cookies from 'js-cookie';
import { GoldenTabs, PassFailOption } from "./constants/constants";
import { takeUntil } from 'rxjs/operators';
import { DetailService } from "../../../../modules/search/detail/services/detail.service";
import { SubtitlesPacGrid } from "../../../../modules/search/detail/components/subtitles.pac.grid.component/subtitles.pac.grid.component";
import { DOCXViewerComponent } from "../../../../modules/viewers/docx/docx";
import { TIFViewerComponent } from "../../../../modules/viewers/tif/tif";
import { TGAViewerComponent } from "../../../../modules/viewers/tga/tga";
import { PDFViewerComponent } from "../../../../modules/viewers/pdf/pdf";
import { CodePrettiffyViewerComponent } from "../../../../modules/viewers/codeprettify/codeprettify";
import { DownloadViewerComponent } from "../../../../modules/viewers/download/download";
import { FlashViewerComponent } from "../../../../modules/viewers/flash/flash";
import { ImfxProTimelineWrapperComponent } from "../../../../modules/controls/imfx.pro.timeline.wrapper/imfx.pro.timeline.wrapper.component";
import { IMFXProTimelineComponent } from "../../../../modules/controls/imfx.pro.timeline/imfx.pro.timeline";
import {
    IMFXProTimeline,
    IMFXProTimelineType
} from "../../../../modules/controls/imfx.pro.timeline/models/imfx.pro.timeline.model";
import { JobStatuses } from "../../../workflow/constants/job.statuses";
import { timelineConfigGroup } from '../../../../utils/imfx.common';

declare var GoldenLayout: any;

@Component({
    selector: 'golden-assessment-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXVideoInfoComponent,
        IMFXNotesTabComponent,
        IMFXMediaTaggingTabComponent,
        IMFXLocatorsComponent,
        SimpleListComponent,
        IMFXSegmentsTabComponent,
        IMFXAudioTracksTabComponent,
        IMFXMediaInfoComponent,
        CELocatorsComponent,
        IMFXSubtitlesGrid,
        IMFXMetadataTabComponent,
        IMFXEventsTabComponent,
        IMFXAiTabComponent,
        IMFXImageComponent,
        IMFXNotAvailableComponent,
        AVFaultsTabComponent,
        SubtitlesPacGrid,
        DOCXViewerComponent,
        TIFViewerComponent,
        TGAViewerComponent,
        PDFViewerComponent,
        CodePrettiffyViewerComponent,
        DownloadViewerComponent,
        FlashViewerComponent,
        IMFXProTimelineComponent,
        ImfxProTimelineWrapperComponent,
        IMFXQcReportsComponent
    ],
    providers: [
        HTMLPlayerService
    ]
})

export class GLAssessmentComponent extends GLComponent {
    @Input() onSaveAssessment: Subject<any>;
    @Input() videoInfo: any;
    @Input() onErrorSaveAssessment: Subject<any>;
    @Output() onUpdateMediaItems: EventEmitter<any> = new EventEmitter();
    private layoutModel: LayoutManagerModel;
    private layoutType: LayoutType = LayoutType.Assess;
    mediainfoComponent: any = null;
    private eventsComponent: any = null;
    private segmentsComponent: any = null;
    private audiotracksComponent: any = null;
    private notesComponent: any = null;
    mediaDataComponent: any = null;
    private metadataComponent: any = null;
    mediaListComponent: any = null;
    private avfaultsComponent: any = null;
    private timelineComponent: any = null;
    private onAddClip: EventEmitter<any> = new EventEmitter();
    private onReplaceClip: EventEmitter<any> = new EventEmitter();
    private loggerSeriesArray: Array<any> = [];
    private addClipSubcription: Subscription;
    private replaceClipSubcription: Subscription;
    private userData: any = null;
    private playerExist: boolean = true;
    private customMetadataInEdit: boolean = false;
    selectedMediaItem = null;
    private allValidTabs = GoldenTabs.tabs;
    private passFailOption = PassFailOption;
    private tabsWithTimecodes = GoldenTabs.timecodesTabs;

    constructor(@Inject(ElementRef) protected el: ElementRef,
                @Inject(ViewContainerRef) protected viewContainer: ViewContainerRef,
                @Inject(ComponentFactoryResolver) protected componentFactoryResolver: ComponentFactoryResolver,
                @Inject(LocalStorageService) protected storageService: LocalStorageService,
                @Inject(ChangeDetectorRef) public cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(SplashProvider) protected splashProvider: SplashProvider,
                @Inject(DetailService) protected detailService: DetailService,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                public injector: Injector) {
        super(el, viewContainer, componentFactoryResolver, storageService, cd, translate, splashProvider, detailService, injector, notificationRef);
        this.userData = this.storageService.retrieve('permissions');
    }

    ValidateAndUpdateTabs(status = ''): Observable<any> {
        return new Observable((observer) => {
            // if (this.mediainfoComponent) {
            //     this.config.options.file = this.mediainfoComponent.compRef.instance.save();
            // }
            if (this.notesComponent) {
                // save task notes
                this.config.moduleContext.UserTaskNotes = this.notesComponent.compRef.instance.save();
            }

            let id = 0;
            this.config.moduleContext.mediaItems.forEach((el, ind) => {
                if (el.ID == this.config.options.file['ID']) {
                    id = ind;
                }
            });
            // sometimes ACCEPTANCE_LTTR_ID is lost when click save
            this.config.options.file['ACCEPTANCE_LTTR_ID'] = this.config.moduleContext.mediaItems[id]['ACCEPTANCE_LTTR_ID'];

            if (status === 'COMPLETED' && !this.isValidCustomMetadata()) {
                this.notificationRef.notifyShow(2, this.translate.instant('simple_assessment.custom_metadata_invalid'));
                return;
            }

            let nonValidTimecodeTabs = this.allValidTabs.filter(el => {
                return (el.isValid == false && (el.componentName == this.tabsWithTimecodes.Tagging ||
                    el.componentName == this.tabsWithTimecodes.Segments ||
                    el.componentName == this.tabsWithTimecodes.Events ||
                    el.componentName == this.tabsWithTimecodes.AVFaults) && el.timecodesInvalid);
            });
            const mediaInfoIsValid = this.mediainfoComponent.compRef.instance.getValidation();
            let audioTracksNotValid = this.allValidTabs.filter((el) => el.componentName === "AudioTracks" && el.isValid === false);
            if(audioTracksNotValid && audioTracksNotValid.length > 0) {
                this.notificationRef.notifyShow(2, this.translate.instant('simple_assessment.audio_tracks_not_filled'));
                observer.next({valid: false});
                observer.complete();
            } else if(this.customMetadataInEdit && status === 'COMPLETED') {
                this.notificationRef.notifyShow(2, this.translate.instant('simple_assessment.custom_metadata_in_edit'));
                observer.next({valid: false});
                observer.complete();
            }
            else if (!mediaInfoIsValid) {
                debugger;
                this.notificationRef.notifyShow(2, this.translate.instant('simple_assessment.check_mediainfo'));
                observer.next({valid: false});
                observer.complete();
            }
            else if (nonValidTimecodeTabs.length !== 0) {
                this.notificationRef.notifyShow(2, this.translate.instant('simple_assessment.check_timecodes'));
                observer.next({valid: false});
                observer.complete();
            } else {
                let valid = !this.allValidTabs.filter(el => {

                    if (el.componentName === "Metadata" && status === 'COMPLETED') {
                        return el.isValid == false;
                    } else {
                        return false
                    }
                    return el.isValid == false;
                }).length; // if there is non valid tabs
                observer.next({mediaItem: this.config.options.file, save: true, valid: valid});
                observer.complete();
            }
        });
    };

    isValidCustomMetadata() {
        let customMetadataTab = this.allValidTabs.filter(el => {
            return el.componentName == "Metadata";
        })[0];
        if (customMetadataTab) {
            return customMetadataTab.isValid;
        }
        return true;
    }

    ngOnInit() {
        this.onSaveAssessment.subscribe(res => {
            // save locators
            this.loggerSeriesArray.forEach(el => {
                this.taggingComponent && this.taggingComponent.emit('onSaveMediaTagging', {
                    series: el.series,
                    guid: el.fileGuid,
                    fileId: el.fileId
                });
            });
        });
        this.onErrorSaveAssessment.subscribe(res => {
            let id = 0;
            this.config.moduleContext.mediaItems.forEach((el, ind) => {
                if (el.ID == this.config.options.file['ID']) {
                    id = ind;
                }
            });
            this.config.moduleContext.mediaItems[id]._hasAcceptBnts = !((<any>this.config.options.file).IsGanged && !(<any>this.config.options.file).IsGangedMain);
            this.config.moduleContext.mediaItems[id]._disableAcceptBnts = this.getDisableForMediaListRadioBtns();
        });
        if (this.config.moduleContext.afterSavedAssessment) {
            this.config.moduleContext.afterSavedAssessment.subscribe(res => {
                let index = 0;
                this.config.moduleContext.mediaItems.forEach((el, ind) => {
                    if (el.ID == this.config.options.file['ID']) {
                        index = ind;
                    }
                    else if (res.AssessDetails && res.AssessDetails.length > 0){
                        res.AssessDetails.forEach((newData)=>{
                            if(newData.MediaID != el.ID) return;
                            if(newData.AudioIDs.length > 0)
                                this.updateDataIdsForType(this.config.moduleContext.mediaItems[ind].AudioTracks, newData.AudioIDs, "Id");
                            if(newData.EventsIDs.length > 0)
                                this.updateDataIdsForType(this.config.moduleContext.mediaItems[ind].Events, newData.EventsIDs, "ID");
                            if(newData.FaultsIDs.length > 0)
                                this.updateDataIdsForType(this.config.moduleContext.mediaItems[ind].Faults, newData.FaultsIDs, "ID");
                            if(newData.SegmentIDs.length > 0)
                                this.updateDataIdsForType(this.config.moduleContext.mediaItems[ind].Segments, newData.SegmentIDs, "ID");
                        });
                    }
                });
                this.config.moduleContext.mediaItems[index]._hasAcceptBnts = !((<any>this.config.options.file).IsGanged && !(<any>this.config.options.file).IsGangedMain);
                this.config.moduleContext.mediaItems[index]._disableAcceptBnts = this.getDisableForMediaListRadioBtns();
                this.mediaListComponent && (this.mediaListComponent.compRef._component as SimpleListComponent).cdr.detectChanges();
                if (res.AssessDetails && res.AssessDetails.length > 0) {
                    res.AssessDetails.forEach((newData)=>{
                        if(newData.MediaID == this.config.options.file['ID']) {
                            this.eventsComponent && this.eventsComponent.compRef.instance.updateDataIds(newData.EventsIDs);
                            this.segmentsComponent && this.segmentsComponent.compRef.instance.updateDataIds(newData.SegmentIDs);
                            this.audiotracksComponent && this.audiotracksComponent.compRef.instance.updateDataIds(newData.AudioIDs);
                            this.avfaultsComponent && this.avfaultsComponent.compRef.instance.updateDataIds(newData.FaultsIDs);
                        }
                    });
                }
            });
        }
        this.combineAllValidTabs();
        (<any>window).imfxLocatorComponent = this;
    }

    updateDataIdsForType(itemArray, newItems, field) {
        let items = itemArray.filter(el => {
            return el.customId != null;
        });
        items.forEach((el, idx) => {
            el[field] = newItems[idx];
            delete el.customId;
        });
    }

    combineAllValidTabs() {
        for (let tab of this.allValidTabs) {
            this.translate.get(this.config.options.typeDetailsLocal + '.' + tab.translateKey.toLowerCase()).subscribe(
                (res: string) => {
                    tab.title = res;
                });
        }
    }

    ngOnLayoutInit(model) {
        this.config.componentContext = this;
        this.storagePrefix = this.config.options.titleForStorage + '.saved.state';
        if (model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.layoutConfig = JSON.parse(model.actualModel.Layout);
            this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
        } else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.layoutConfig = JSON.parse(this.layoutModel.Layout);
                    this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
                } else {
                    this.layoutModel = model.defaultModel;
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.Assess);
                }
            } else {
                this.layoutModel = model.defaultModel;
                this.layoutConfig = JSON.parse(LayoutManagerDefaults.Assess);
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
        super.setViewVariables();
        this.playerExist = this.config.options.params ? this.config.options.params.mediaType == 'htmlPlayer' : true;
        let self = this;
        this.addJobDataTab(self);
        this.addMediaDataTab(self);
        this.addMediaLayout(self);
        this.addMediaInfoTab(self);
        this.addEventsTab(self);
        this.addVideoInfo(self);
        this.addMediaTagging(self);
        this.addMediaList(self);
        this.addTimeline(self);
        this.addSegments(self);
        this.addAudioTracks(self);
        this.addSubtitlesTab(self);
        this.addCustomMetadataTab(self);
        this.addNotesTab(self);
        this.addAiTab(self);
        this.addAVFaultsTab(self);
        this.setEvents();
        this.addQcReportsTab(self);
        this.layout.off('tabCreated');
        this.layout.on('tabCreated', function (tab) {
            let inValid = !self.allValidTabs.filter(el => {
                return el.tTitle == tab.contentItem.container.title
            })[0].isValid;
            if (inValid) {
                tab.titleElement.prevObject.find('i.lm_left').show();
            }
            tab.closeElement.append("<button class='icon-button'><i class='icons-close-small icon close'></i></button>");
        });
        super.onItemDestroyed(this);
        super.onStateChanged(this);
        this.layout.init();
        this.createNewTabsAfterInit();
        this.splashProvider.onHideSpinner.emit();
        super.setViewLayout();
    };

    addQcReportsTab(self) {
        this.layout.registerComponent('QcReports', (container, componentState) => {
            this.translateTitle(container, '.qcreports');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXQcReportsComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            compRef.instance.file = self.config.moduleContext.jobFile;
            compRef.instance.media = self.config.moduleContext.mediaItems[0];
            compRef.instance.qcReport = self.config.moduleContext.qcReport;
            compRef.instance.compRef = this
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addJobDataTab(self) {
        this.layout.registerComponent('JobData', (container, componentState) => {
            this.translateTitle(container, '.jobdata');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.moduleContext.jobFile;
            compRef.instance.columnData = self.config.options.jobColumnData;
            compRef.instance.lookup = self.config.options.jobLookup;
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMediaDataTab(self) {
        this.layout.registerComponent('Data', (container, componentState) => {
            this.translateTitle(container, '.data');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.moduleContext.mediaItems[0];
            compRef.instance.columnData = self.config.options.columnData;
            compRef.instance.lookup = self.config.options.lookup;
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next(self.config.options.file);
            });
            self.mediaDataComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addVideoInfo(self) {
    }

    addMediaTagging(self) {
        this.layout.registerComponent('Tagging', (container, componentState) => {
            this.translateTitle(container, '.tagging');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXLocatorsComponent);
            let compRef = this.viewContainer.createComponent(factory);
            let provider = this.injector.get(AssessmentProvider);
            super.addMediaTagging(self, container, compRef, provider)
        });
    }

    changeLayoutHandler($event) {
        this.storageService.clear(this.storagePrefix);
        this.layout.off('itemDestroyed');
        this.layout.off('stateChanged');
        this.layout.destroy();
        this.addClipSubcription && this.addClipSubcription.unsubscribe();
        this.replaceClipSubcription && this.replaceClipSubcription.unsubscribe();
        this.newTabs = [];
        $('.drag-btns-wraper #tabbed-nav li').remove();
        this.layoutModel = $event;
        this.layoutConfig = JSON.parse(this.layoutModel.Layout);
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

    createNewTabsAfterInit() {
        if (!this.layout.root)
            return;
        let readonly = this.getReadOnlyModeForTab(this.config.options.file);
        let assessmentProvider = this.injector.get(AssessmentProvider);
        for (var i = 0; i < this.allValidTabs.length; i++) {
            let tab = this.allValidTabs[i];
            let buf = this.layout.root.getItemsByFilter(function (el) {
                return el.componentName == tab.tTitle;
            });
            if (buf.length === 0) {
                // if( !readonly ){  // if In Progress
                let name = tab.componentName;
                // if (name == 'MediaInfo') {
                //     let obj = {
                //         AGE_CERTIFICATION: 'AGE_CERTIFICATION',
                //         TV_STD: 'TV_STD',
                //         ASPECT_R_ID: 'ASPECT_R_ID',
                //         USAGE_TYPE: 'USAGE_TYPE',
                //         AFD_ID: 'AFD_ID',
                //         ITEM_TYPE: 'ITEM_TYPE',
                //         MEDIA_FORMAT_text: 'MEDIA_FORMAT_text'
                //     }
                //     tab.isValid = assessmentProvider.getValidation(this.config.options.file, obj);
                // }
                if (ValidFields[name]) {
                    let obj = {};
                    obj[name] = ValidFields[name];
                    tab.isValid = assessmentProvider.getValidation(this.config.options.file, obj);
                }
                // }
                this.newTabs.push(tab);
            } else {
                if (buf[0].container.compRef && typeof (buf[0].container.compRef.instance.callValidation) == 'function') {
                    buf[0].container.compRef.instance.callValidation();
                }
            }
        }
        this.cd.detectChanges();
    }

    getDisableForMediaListRadioBtns() {
        let disable = false;
        if (this.config.moduleContext.taskFile.TechReport) {
            disable = this.config.moduleContext.taskFile.TechReport.Settings.Assess.PassFailOption == this.passFailOption.Disabled;
        }
        return disable || this.config.moduleContext.taskFile.TSK_STATUS !== JobStatuses.INPROG;
    }

    addMediaList(self) {
        let assessmentProvider = this.injector.get(AssessmentProvider);
        this.layout.registerComponent('MediaItems', (container, componentState) => {
            let compRef;
            this.translateTitle(container, '.media_list');
            let factory = this.componentFactoryResolver.resolveComponentFactory(SimpleListComponent);
            compRef = this.viewContainer.createComponent(factory);
            self.config.moduleContext.mediaItems.forEach(el => {
                el._hasAcceptBnts = !(el.IsGanged && !el.IsGangedMain);
                el._disableAcceptBnts = this.getDisableForMediaListRadioBtns();
            });
            compRef.instance.items = self.config.moduleContext.mediaItems;
            compRef.instance.task = self.config.moduleContext.taskFile.TechReport;
            assessmentProvider.selectedMediaItem.next(self.config.moduleContext.mediaItems[0]);
            this.selectedMediaItem = {
                file: self.config.moduleContext.mediaItems[0]
            }
            compRef.instance.onSelect.subscribe(data => {
                this.selectedMediaItem = data;
                assessmentProvider.selectedMediaItem.next(data.file);
                if (data.file.ID != self.config.options.file.ID) {
                    let src = <RCEArraySource>[data.file].map(el => {
                        return {
                            id: el.ID,
                            restricted: el.MEDIA_STATUS == 1,
                            // src: el.MEDIA_STATUS == 1 && !self.config.moduleContext.config.componentContext.playRestricted ? "" : el.PROXY_URL, // TODO refactor this
                            src: el.PROXY_URL,
                            live: el.IsLive,
                            seconds: TMDTimecode.fromString(el.DURATION_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                            som: TMDTimecode.fromString(el.SOM_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                            som_string: el.SOM_text
                        };
                    });
                    if (self.mediainfoComponent) {
                        self.config.options.file = self.mediainfoComponent.compRef.instance.save();
                    }
                    this.onUpdateMediaItems.emit({mediaItem: self.config.options.file, save: false});

                    self.config.moduleContext.config.options.file = self.config.options.file = data.file;
                    self.config.options.params = assessmentProvider.setVideoBlock(data.file);
                    this.detailService.getVideoInfo(data.file.ID, {
                        smudge: true,
                        scene: true,
                        waveform: false,
                        audiovolume: true
                    }).subscribe(
                        (resp) => {
                            self.videoInfo = resp;
                            let mediaComp = self.layout.root._$getItemsByProperty('componentName', 'Media')[0];
                            self.playerComponents.compRef.instance.src = src;
                            mediaComp && self.layout.getComponent('Media').call(self, mediaComp ? mediaComp.container : {});

                            let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
                                return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
                            });
                            if (currentLoggerSeries.length === 0) { // if there is no loading series for current item
                                if (self.config.options.file.DFILE_LINK_GUID != '' && self.config.options.file.DFILE_LINK_GUID != null) {
                                    assessmentProvider.loadTagging(self.config.options.file.DFILE_LINK_GUID)
                                        .pipe(takeUntil(self.destroyed$))
                                        .subscribe( // load it
                                            res => {
                                                self.loggerSeriesArray.push({
                                                    fileGuid: data.file.DFILE_LINK_GUID,
                                                    fileId: self.config.options.file.ID,
                                                    series: res
                                                });
                                                self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                                    file: data.file,
                                                    series: res
                                                });
                                                // -----refresh timeline
                                                if (self.timelineComponent) {
                                                    let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                                                    let file = data.file;
                                                    let series = (<any>res);

                                                    self.fillTimelineData(types, file, series, self.timelineComponent["compRef"]);
                                                    self.timelineComponent["compRef"].instance.setVisible();
                                                    self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);

                                                    self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
                                                    setTimeout(() => {
                                                        self.timelineComponent["compRef"].instance.Update();
                                                    });
                                                }
                                            }
                                        );
                                }
                            } else {
                                self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                    file: self.config.options.file,
                                    series: currentLoggerSeries[0].series.filter(el => {
                                        return el.Id >= 0 || el.customId;
                                    })
                                });
                                // -----refresh timeline
                                if (self.timelineComponent) {
                                    let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                                    let file = data.file;
                                    let series = currentLoggerSeries[0].series;

                                    self.fillTimelineData(types, file, series, self.timelineComponent["compRef"]);
                                    self.timelineComponent["compRef"].instance.setVisible();
                                    self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);

                                    self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
                                    setTimeout(() => {
                                        self.timelineComponent["compRef"].instance.Update();
                                    });
                                }
                            }
                            assessmentProvider.loadSubtitles(self.config.options.file.ID)
                                .pipe(takeUntil(self.destroyed$))
                                .subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
                                    self.subtitleComponent && self.subtitleComponent.compRef.instance.refresh(res);
                                });

                            self.setReadOnlyMode(false);
                        }
                    );
                }
            });

            self.mediaListComponent = container;

            compRef.instance['elem'] = container;
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            this.layout.on('refresh', function () {
                compRef._component.refresh();
            });

            container.on('addItem', function (data) {
                compRef._component.addItem(data);
            });

            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            compRef.changeDetectorRef.detectChanges();
        });
    }

    parseTimelineData(types, file, series, compRef, data) {
        if (data.Smudge) {
            if (!this.timelineConfig.Groups[0])
                this.timelineConfig.Groups.push({
                    Name: "Images",
                    Expandable: true,
                    Expanded: true,
                    WithHeader: false,
                    Rows: []
                });
            this.timelineConfig.Groups[0].Rows.push({
                Name: "Thumbs",
                Type: IMFXProTimelineType.Image,
                Keys: data.Smudge ? data.Smudge.Url : null,
                Data: {
                    CanvasImageHeight: data.Smudge ? data.Smudge.EventData.FrameHeight : 40,
                    CanvasImageFrameWidth: data.Smudge ? data.Smudge.EventData.FrameWidth : 60,
                    FrameDivider: data.Smudge ? data.Smudge.EventData.FrameInterval : 0,
                    Collapsable: true,
                }
            });
        }
        if (data.Scene) {
            if (!this.timelineConfig.Groups[0])
                this.timelineConfig.Groups.push({
                    Name: "Images",
                    Expandable: true,
                    Expanded: true,
                    WithHeader: false,
                    Rows: []
                });
            var timeCodes = data.Scene ? data.Scene.EventData.StringTimecodes.map((val) => {
                let f = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: val
                }).toFrames() - this.timelineConfig.From;
                return f;
            }) : [];
            this.timelineConfig.Groups[0].Rows.push({
                Name: "Scenes",
                Type: IMFXProTimelineType.Image,
                Keys: data.Scene ? data.Scene.Url : null,
                Data: {
                    CanvasImageHeight: data.Scene ? data.Scene.EventData.FrameHeight : 0,
                    CanvasImageFrameWidth: data.Scene ? data.Scene.EventData.FrameWidth : 0,
                    FrameDivider: data.Scene ? data.Scene.EventData.FrameInterval : 0,
                    Collapsable: true,
                    TimecodesMap: {},
                    Timecodes: timeCodes,
                }
            });
            for (var j = 0; j < timeCodes.length; j++) {
                this.timelineConfig.Groups[0].Rows[this.timelineConfig.Groups[0].Rows.length - 1].Data.TimecodesMap[timeCodes[j]] = {
                    frame: timeCodes[j],
                    index: j
                };
            }
        }
        if (data.AudioVolume) {
            this.detailService.getWaveformsJson(data.AudioVolume.Url).subscribe((waves) => {
                if (data.AudioVolume.EventData.AudioTracks > 0)
                    this.timelineConfig.Groups.push({
                        Name: "Audio",
                        Expandable: true,
                        Expanded: true,
                        WithHeader: true,
                        Rows: []
                    });
                for (var i = 0; i < data.AudioVolume.EventData.AudioTracks; i++) {
                    this.timelineConfig.Groups[this.timelineConfig.Groups.length - 1].Rows[i] =  timelineConfigGroup(waves, i);
                    var keys = waves.TimeFrames.map((el, index) => {
                        return {
                            Frame: el,
                            Length: index + 1 < waves.TimeFrames.length ? (waves.TimeFrames[index + 1] == el ? 1 : waves.TimeFrames[index + 1] - el) : this.timelineConfig.Length - el,
                            Value: waves.Values[i][index],
                            Data: null
                        };
                    });
                    for (var j = 0; j < keys.length; j++) {
                        this.timelineConfig.Groups[this.timelineConfig.Groups.length - 1].Rows[i].Keys[keys[j].Frame] = keys[j];
                    }
                }
                this.fillMarkers(types, series, file);
                this.timelineConfig = this.timelineConfig;
                compRef.instance.setTimelineData(this.timelineConfig);
                setTimeout(() => {
                    if (compRef.instance instanceof IMFXProTimelineComponent)
                        compRef.instance.Update(null, true, true);
                });
            });
        } else {
            this.fillMarkers(types, series, file);
            this.timelineConfig = this.timelineConfig;
            compRef.instance.setTimelineData(this.timelineConfig);
            // compRef.changeDetectorRef.detectChanges();
            setTimeout(() => {
                if (compRef.instance instanceof IMFXProTimelineComponent)
                    compRef.instance.Update(null, true, true);
            });
        }
    }

    fillTimelineData(types, file, series, compRef) {
        this.timelineConfig.Name = "Timeline";
        this.timelineConfig.From = file["FILE_SOM_ABSOLUTE"];
        this.timelineConfig.Length = file["FILE_EOM_ABSOLUTE"] - file["FILE_SOM_ABSOLUTE"];
        this.timelineConfig.Framerate = TMDTimecode.getFrameRate(TimeCodeFormat[file["TimecodeFormat"]]).frameRate;
        this.timelineConfig.TimecodeFormat = file["TimecodeFormat"];
        this.timelineConfig.Groups = [];
        if (!this.videoInfo) {
            this.detailService.getVideoInfo(file["ID"], {
                smudge: true,
                scene: true,
                waveform: false,
                audiovolume: true
            }).subscribe(
                (resp) => {
                    this.parseTimelineData(types, file, series, compRef, resp);
                }
            );
        } else {
            this.parseTimelineData(types, file, series, compRef, this.videoInfo);
        }

        compRef.instance.setTimelineData(this.timelineConfig);
    }

    addTimeline(self) {
        // !!!! IMPORTANT - data loading in addMediaTagging
        this.layout.registerComponent('Timeline', (container, componentState) => {
            this.translateTitle(container, '.timeline');

            let factory = (<any>self).componentFactoryResolver.resolveComponentFactory(IMFXProTimelineComponent);
            let compRef = (<any>self).viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;

            let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
            let file = (<any>self).config.options.file;
            let series = (<any>self).config.options.series;
            //this.fillTimelineData(types, file, series, compRef);

            //compRef.instance['timelineData'] = (<any>self).timelineConfig;

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

            container.on('clipAdded', (data) => {
                let serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';
                if (!(<any>self).timelineConfig)
                    return;
                let inF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.startTimecodeString
                }).toFrames() - (<any>self).timelineConfig.From;
                let outF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.stopTimecodeString
                }).toFrames() - (<any>self).timelineConfig.From;

                var clipData = {
                    InTc: data.startTimecodeString,
                    OutTc: data.stopTimecodeString,
                    timelineId: data.customId,
                    TagType: serieName
                };

                var compare = {
                    Frame: inF,
                    Length: data.startTimecodeString == data.stopTimecodeString ? 1 : outF - inF,
                    Value: 1,
                    Data: clipData
                };
                var groupIndex = -1;
                this.timelineConfig.Groups.forEach((g, idx) => {
                    if (g.Name == "Markers") {
                        groupIndex = idx;
                    }
                });
                this.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys[compare.Frame] = compare;
                compRef.instance.setVisible();
                compRef.instance.setTimelineData(self.timelineConfig);

                setTimeout(() => {
                    compRef.instance.Update();
                    compRef.changeDetectorRef.detectChanges();
                });
                // data.serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';
                // this.timelineComponent.compRef.instance.clipAdded.emit(data)
            });
            container.on('clipReplaced', (data) => {
                let serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';
                if (!(<any>self).timelineConfig)
                    return;
                let inF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.newClip.startTimecodeString
                }).toFrames() - (<any>self).timelineConfig.From;
                let outF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.newClip.stopTimecodeString
                }).toFrames() - (<any>self).timelineConfig.From;

                var clipData = {
                    InTc: data.newClip.startTimecodeString,
                    OutTc: data.newClip.stopTimecodeString,
                    timelineId: data.oldClipId,
                    TagType: serieName
                };

                var compare = {
                    Frame: inF,
                    Length: data.newClip.startTimecodeString == data.newClip.stopTimecodeString ? 1 : outF - inF,
                    Value: 1,
                    Data: clipData
                };
                var groupIndex = -1;
                this.timelineConfig.Groups.forEach((g, idx) => {
                    if (g.Name == "Markers") {
                        groupIndex = idx;
                    }
                });
                var idx = (<any>self).timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys.findIndex((el, index) => {
                    return el && el.Data.timelineId == clipData.timelineId;
                });
                if (idx >= 0) {
                    delete (<any>self).timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys[idx];
                }
                (<any>self).timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys[compare.Frame] = compare;
                compRef.instance.setVisible();
                compRef.instance.setTimelineData(self.timelineConfig);

                setTimeout(() => {
                    compRef.instance.Update();
                    compRef.changeDetectorRef.detectChanges();
                });
            });

            container.on('clipRemoved', (data) => {
                let serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';
                var groupIndex = -1;
                this.timelineConfig.Groups.forEach((g, idx) => {
                    if (g.Name == "Markers") {
                        groupIndex = idx;
                    }
                });
                var index = this.getTimelineIndex(this.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys, data.timelineId || data.customId);
                this.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys.splice(index, 1);
                compRef.instance.setVisible();
                compRef.instance.setTimelineData(self.timelineConfig);

                setTimeout(() => {
                    compRef.instance.Update();
                    compRef.changeDetectorRef.detectChanges();
                });
                // data.serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';
                // this.timelineComponent.compRef.instance.clipRemoved.emit(data)
            });

            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });

            compRef.changeDetectorRef.detectChanges();

            self.layout.on('timecodeChange', tcStr => {
                var tc = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: tcStr
                });
                if (self.timelineComponent)
                    self.timelineComponent.compRef.instance.SetTimelineTime(tc.toFrames());
            });
            (<any>window).imfxTimelineComponent = self.timelineComponent = container;
        });
    };

    getTimelineIndex(array, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] && array[i].Data.timelineId === value) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Add segments tab
     */
    addSegments(self) {
        this.layout.registerComponent('Segments', (container, componentState) => {
            this.translateTitle(container, '.segments');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXSegmentsTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            let goldenRef = this;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                file: self.config.options.file,
                typeDetailsLocal: self.config.options.typeDetailsLocal,
                typeDetails: self.config.options.typeDetails,
                elem: container,
                context: this,
                // canSetFocus: true,
                readOnly: self.getReadOnlyModeForTab(self.config.options.file),
                validationFields: ValidFields['Segments']
            };
            compRef.instance.playerExist = self.playerExist;
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            container.on('clearMarkers', function (data) {
                self.layout.emit('clearMarkers', data);
            });
            container.on('setMarkers', function (data) {
                self.layout.emit('setMarkers', data);
                self.layout.emit('selectClipStateBtns');
            });
            compRef.instance.onSetTimecodeString.subscribe(tc => {
                self.layout.emit('setTimecode', tc);
            });
            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.instance.getTimecodesForEntry.subscribe(replace => {
                compRef.instance.waitForInOutTimecodes = true;
                self.layout.emit('getInOutTimecodesFromPlayer', replace);
            });
            self.onAddClip.subscribe(data => {
                if (compRef.instance.waitForInOutTimecodes) {
                    compRef.instance.addEventToGrid(data);
                    compRef.instance.waitForInOutTimecodes = false;
                }
            });
            compRef.instance.isDataValid.subscribe(isValid => {
                super.validateTab(self, container, isValid);
            });
            compRef.instance.timecodesInvalid.subscribe(timecodesInvalid => {
                self.allValidTabs.filter(el => {
                    return el.tTitle == container.title;
                })[0].timecodesInvalid = timecodesInvalid;
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({file: self.config.options.file, readOnly: readOnly});
            });
            self.layout.on('playerReady', (data) => {
                let _player = self.playerComponents.compRef.instance.player;
                if (_player) {
                    let playerDuration = _player.duration();
                    let videoSom = data.SomFrames;
                    let videoEom = TMDTimecode.fromMilliseconds(playerDuration * 1000, TimeCodeFormat[data.TimecodeFormat]).toFrames() + data.SomFrames;
                    compRef.instance.updateTimedcodeSetSomEom({videoSom: videoSom, videoEom: videoEom});
                }
            });
            self.segmentsComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addAudioTracks(self) {
        this.layout.registerComponent('AudioTracks', (container, componentState) => {
            this.translateTitle(container, '.audiotracks');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAudioTracksTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            let goldenRef = this;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                file: self.config.options.file,
                typeDetailsLocal: self.config.options.typeDetailsLocal,
                typeDetails: self.config.options.typeDetails,
                elem: container,
                context: this,
                readOnly: self.getReadOnlyModeForTab(self.config.options.file)
            };
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            compRef.instance.setAudioTrackByIndex.subscribe(index => {
                self.layout.emit('setAudioTrackByIndex', index);
            });
            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.instance.isDataValid.subscribe(isValid => {
                super.validateTab(self, container, isValid);
            });
            compRef.instance.onUpdateAudioSrc.subscribe(data => {
                self.layout.emit('updateAudioSrc', data);
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({file: self.config.options.file, readOnly: readOnly});
            });
            self.audiotracksComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMediaInfoTab(self) {
        this.layout.registerComponent('MediaInfo', (container, componentState) => {
            this.translateTitle(container, '.media_info');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXMediaInfoComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            const techRep = self.config.moduleContext.taskFile.TechReport;
            compRef.instance['config'] = self.config.options.file;
            compRef.instance['customMediaStatusLookups'] = self.config.moduleContext.customMediaStatusLookups;
            compRef.instance['customMediaStatusSettings'] = self.config.moduleContext.taskFile.TechReport
                && self.config.moduleContext.taskFile.TechReport.CustomMediaStatusSettings;
            compRef.instance['readOnly'] = self.getReadOnlyModeForTab(self.config.options.file);
            compRef.instance['columnsSettings'] = techRep && techRep.Settings.Assess && techRep.Settings.Assess.MediaInfoFrame;
            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.instance.isDataValid.subscribe(isValid => {
                super.validateTab(self, container, isValid);
            });
            // for Weigel
            // let obj = {
            //     AGE_CERTIFICATION: 'AGE_CERTIFICATION',
            //     TV_STD: 'TV_STD',
            //     ASPECT_R_ID: 'ASPECT_R_ID',
            //     USAGE_TYPE: 'USAGE_TYPE',
            //     AFD_ID: 'AFD_ID',
            //     ITEM_TYPE: 'ITEM_TYPE',
            //     MEDIA_FORMAT_text: 'MEDIA_FORMAT_text'
            // }
            // let assessmentProvider = this.injector.get(AssessmentProvider);
            // self.allValidTabs.filter( el => {return el.tTitle == container.title} )[0].isValid = assessmentProvider.getValidation(this.config.options.file, obj);
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({file: self.config.options.file, readOnly: readOnly});
            });
            compRef.changeDetectorRef.detectChanges();
            self.mediainfoComponent = container;
        });
    }

    addSubtitlesTab(self) {
        this.layout.registerComponent('Subtitles', (container, componentState) => {
            this.translateTitle(container, '.subtitles');
            let assessmentProvider = this.injector.get(AssessmentProvider);
            assessmentProvider.loadSubtitles(self.config.options.file.ID)
                .pipe(takeUntil(self.destroyed$))
                .subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
                    let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXSubtitlesGrid);
                    let compRef = this.viewContainer.createComponent(factory);
                    let goldenRef = this;
                    container.getElement().append($(compRef.location.nativeElement));
                    container['compRef'] = compRef;
                    compRef.instance['config'] = {
                        file: self.config.options.file,
                        elem: container
                    };
                    compRef.instance['timecodeFormatString'] = self.config.options.file.TimecodeFormat || 'Pal';
                    goldenRef.subtitlesGrid = compRef.instance;
                    compRef.instance['subtitles'] = res;
                    if (self.config.options.file.Subtitles && self.config.options.file.Subtitles.length > 0) {
                        compRef.instance['additionalSubs'] = self.config.options.file.Subtitles;
                    }
                    container.on('setTimecode', function (tc) {
                        self.layout.emit('setTimecode', tc);
                    });
                    container.on('setTimedText', function (tc) {
                        self.layout.emit('setTimedText', tc);
                    });
                    self.layout.on('timecodeChange', tcStr => {
                        const comp: IMFXSubtitlesGrid = (compRef.instance as IMFXSubtitlesGrid);
                        if (comp && comp.searchTextComp) {
                            if (comp.searchTextComp.mutedFollow === false) {
                                compRef.instance['selectRow'](tcStr);
                            }
                        }
                    });

                    self.layout.on('timedTextChange', obj => {
                        compRef.instance['setLangSubtitlesByUrl'](obj.src);
                    });
                    self.subtitleComponent = container;
                    compRef.changeDetectorRef.detectChanges();
                });
        });
    }

    addCustomMetadataTab(self) {
        this.layout.registerComponent('Metadata', (container, componentState) => {
            this.translateTitle(container, '.metadata');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXMetadataTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            let goldenRef = this;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            compRef.instance['config'] = {
                defaultSchemas: self.config.moduleContext.taskFile.TechReport.CustomMetadataSettings,
                file: self.config.options.file,
                typeDetailsLocal: self.config.options.typeDetails.replace('-', '_'),
                readOnly: self.getReadOnlyModeForTab(self.config.options.file)
            };
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({file: self.config.options.file, readOnly: readOnly});
            });
            compRef.instance.onEditStateChange.subscribe((state) => {
                self.customMetadataInEdit = state;
            });
            compRef.instance.onValidationChange.subscribe((valid) => {
                if (valid) {
                    container.tab && container.tab.element.find('i.lm_left').hide();
                } else {
                    container.tab && container.tab.element.find('i.lm_left').show();
                }

                self.allValidTabs.filter(el => {
                    return el.tTitle == container.title;
                })[0].isValid = valid;
            });
            self.metadataComponent = container;
            compRef.changeDetectorRef.detectChanges();

            if (self.config.moduleContext.taskFile.TechReport.CustomMetadataSettings && self.config.moduleContext.taskFile.TechReport.CustomMetadataSettings.length > 0) {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
                compRef.changeDetectorRef.detectChanges();
            }
        });
    };

    addNotesTab(self) {
        this.layout.registerComponent('Notes', (container, componentState) => {
            this.translateTitle(container, '.notes');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXNotesTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                fileNotes: <any>self.config.moduleContext.UserTaskNotes,
                jobNotes: <any>self.config.moduleContext.jobFile.JOB_NOTES,
                readOnly: this.getReadOnlyModeForTab(self.config.options.file),
                adminNotes: <any>self.config.moduleContext.taskFile.TSK_NOTES || '-'
            };
            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({
                    fileNotes: (<any>self).config.moduleContext.UserTaskNotes,
                    readOnly: readOnly
                });
            });
            self.notesComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addEventsTab(self) {
        this.layout.registerComponent('Events', (container, componentState) => {
            this.translateTitle(container, '.events');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXEventsTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                file: self.config.options.file,
                elem: container,
                // canSetFocus: true,
                readOnly: this.getReadOnlyModeForTab(self.config.options.file),
                validationFields: ValidFields['Events']
            };
            compRef.instance.playerExist = self.playerExist;
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            container.on('setFocusOnGrid', function () {
                compRef['_component'].setFocusOnGrid && compRef['_component'].setFocusOnGrid();
            });
            container.on('setMarkers', function (data) {
                self.layout.emit('setMarkers', data);
                self.layout.emit('selectClipStateBtns');
            });
            container.on('clearMarkers', function (data) {
                self.layout.emit('clearMarkers', data);
            });
            container.on('save', function (data) {
                let assessmentProvider = this.injector.get(AssessmentProvider);
            });
            compRef.instance.onSetTimecodeString.subscribe(tc => {
                self.layout.emit('setTimecode', tc);
            });
            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.instance.getTimecodesForEntry.subscribe(replace => {
                compRef.instance.waitForInOutTimecodes = true;
                self.layout.emit('getInOutTimecodesFromPlayer', replace);
            });
            self.onAddClip.subscribe(data => {
                if (compRef.instance.waitForInOutTimecodes) {
                    compRef.instance.addEventToGrid(data);
                    compRef.instance.waitForInOutTimecodes = false;
                }
            });
            compRef.instance.isDataValid.subscribe(isValid => {
                super.validateTab(self, container, isValid);
            });
            compRef.instance.timecodesInvalid.subscribe(timecodesInvalid => {
                self.allValidTabs.filter(el => {
                    return el.tTitle == container.title;
                })[0].timecodesInvalid = timecodesInvalid;
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({file: self.config.options.file, readOnly: readOnly});
            });
            self.layout.on('playerReady', (data) => {
                let _player = self.playerComponents.compRef.instance.player;
                if (_player) {
                    let playerDuration = _player.duration();
                    let videoSom = data.SomFrames;
                    let videoEom = TMDTimecode.fromMilliseconds(playerDuration * 1000, TimeCodeFormat[data.TimecodeFormat]).toFrames() + data.SomFrames;
                    compRef.instance.updateTimedcodeSetSomEom({videoSom: videoSom, videoEom: videoEom});
                }
            });
            compRef.changeDetectorRef.detectChanges();
            self.eventsComponent = container;
        });
    }

    addAiTab(self) {
        this.layout.registerComponent('AI', (container, componentState) => {
            this.translateTitle(container, '.ai');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAiTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                file: self.config.options.file,
                elem: container,
                readOnly: self.getReadOnlyModeForTab(self.config.options.file)
            };
            container.on('setTimecode', function (data) {
                self.layout.emit('setTimecode', data.InTc);
            });
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addAVFaultsTab(self) {
        this.layout.registerComponent('AVFaults', (container, componentState) => {
            let fullKey = this.config.options.typeDetailsLocal + '.av_faults';
            this.translate.get(fullKey)
                .pipe(takeUntil(self.destroyed$))
                .subscribe(
                    (res: string) => {
                        container._config.title = res;
                    });
            let factory = this.componentFactoryResolver.resolveComponentFactory(AVFaultsTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.config = {
                file: self.config.options.file,
                elem: container,
                readOnly: self.getReadOnlyModeForTab(self.config.options.file),
                validationFields: ValidFields['Faults']
            };
            compRef.instance.playerExist = self.playerExist;
            container.on('setFocusOnGrid', function () {
                compRef['_component'].setFocusOnGrid && compRef['_component'].setFocusOnGrid();
            });
            container.on('setMarkers', function (data) {
                self.layout.emit('setMarkers', data);
                self.layout.emit('selectClipStateBtns');
            });
            container.on('clearMarkers', function (data) {
                self.layout.emit('clearMarkers', data);
            });
            compRef.instance.onSetTimecodeString.subscribe(tc => {
                self.layout.emit('setTimecode', tc);
            });
            compRef.instance.getTimecodesForEntry.subscribe(replace => {
                compRef.instance.waitForInOutTimecodes = true;
                self.layout.emit('getInOutTimecodesFromPlayer', replace);
            });
            self.onAddClip.subscribe(data => {
                if (compRef.instance.waitForInOutTimecodes) {
                    compRef.instance.addAVFaultsToGrid(data);
                    compRef.instance.waitForInOutTimecodes = false;
                }
            });
            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });
            compRef.instance.isDataValid.subscribe(isValid => {
                super.validateTab(self, container, isValid);
            });
            compRef.instance.timecodesInvalid.subscribe(timecodesInvalid => {
                self.allValidTabs.filter(el => {
                    return el.tTitle == container.title;
                })[0].timecodesInvalid = timecodesInvalid;
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({file: self.config.options.file, readOnly: readOnly});
            });
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            self.layout.on('playerReady', (data) => {
                let _player = self.playerComponents.compRef.instance.player;
                if (_player) {
                    let playerDuration = _player.duration();
                    let videoSom = data.SomFrames;
                    let videoEom = TMDTimecode.fromMilliseconds(playerDuration * 1000, TimeCodeFormat[data.TimecodeFormat]).toFrames() + data.SomFrames;
                    compRef.instance.updateTimedcodeSetSomEom({videoSom: videoSom, videoEom: videoEom});
                }
            });
            compRef.changeDetectorRef.detectChanges();
            self.avfaultsComponent = container;
        });
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

    getReadOnlyModeForTab(file) {
        let data = this.storageService.retrieve('permissions');
        if (this.config.moduleContext.taskFile.LOCKED_BY !== data.FullName) {
            return true;
        }
        if (this.config.moduleContext.taskFile.TSK_STATUS !== JobStatuses.INPROG || this.config.options.firstLoadReadOnly) {
            return true;
        } else {
            return file.IsGanged && !file.IsGangedMain;
        }
    }

    setReadOnlyMode(withPlayer: boolean = true) {
        let readOnly = this.getReadOnlyModeForTab(this.config.options.file);
        this.layout.emit('setReadOnly', readOnly);
        this.config.moduleContext.mediaItems.forEach(el => {
            el._hasAcceptBnts = !(el.IsGanged && !el.IsGangedMain);
            el._disableAcceptBnts = this.getDisableForMediaListRadioBtns();
        });
        this.mediaListComponent && (this.mediaListComponent.compRef.instance.items = this.config.moduleContext.mediaItems);
        // this.mediaListComponent.compRef.instance.refresh(readonly);
        if (withPlayer) {
            if (this.playerComponents && this.playerComponents.compRef.instance.clipBtns !== undefined) {
                this.playerComponents.compRef.instance.clipBtns = !readOnly;
            }
            if (this.playerComponents && this.playerComponents.compRef.instance.pluginsProvider !== undefined) {
                this.playerComponents.compRef.instance.pluginsProvider.refreshClipBtnsPlugin(!readOnly);
            }
        }
    }

    updateMediaInfo() {
        const self: any = this;
        const data = this.selectedMediaItem;
        let assessmentProvider = this.injector.get(AssessmentProvider);
        let src = <RCEArraySource>[data.file].map(el => {
            return {
                id: el.ID,
                restricted: el.MEDIA_STATUS == 1,
                // src: el.MEDIA_STATUS == 1 && !self.config.moduleContext.config.componentContext.playRestricted ? "" : el.PROXY_URL, // TODO refactor this
                src: el.PROXY_URL,
                live: el.IsLive,
                seconds: TMDTimecode.fromString(el.DURATION_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                som: TMDTimecode.fromString(el.SOM_text, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                som_string: el.SOM_text
            };
        });
        if (self.mediainfoComponent) {
            self.config.options.file = self.mediainfoComponent.compRef.instance.save();
        }
        this.onUpdateMediaItems.emit({mediaItem: self.config.options.file, save: false});

        self.config.moduleContext.config.options.file = self.config.options.file = data.file;
        self.config.options.params = assessmentProvider.setVideoBlock(data.file);
        this.detailService.getVideoInfo(data.file.ID, {
            smudge: true,
            scene: true,
            waveform: false,
            audiovolume: true
        }).subscribe(
            (resp) => {
                self.videoInfo = resp;
                let mediaComp = self.layout.root._$getItemsByProperty('componentName', 'Media')[0];
                self.playerComponents.compRef.instance.src = src;
                mediaComp && self.layout.getComponent('Media').call(self, mediaComp ? mediaComp.container : {});

                let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
                    return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
                });
                if (currentLoggerSeries.length === 0) { // if there is no loading series for current item
                    if (self.config.options.file.DFILE_LINK_GUID != '' && self.config.options.file.DFILE_LINK_GUID != null) {
                        assessmentProvider.loadTagging(self.config.options.file.DFILE_LINK_GUID)
                            .pipe(takeUntil(self.destroyed$))
                            .subscribe( // load it
                                res => {
                                    self.loggerSeriesArray.push({
                                        fileGuid: data.file.DFILE_LINK_GUID,
                                        fileId: self.config.options.file.ID,
                                        series: res
                                    });
                                    self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                                        file: data.file,
                                        series: res
                                    });
                                    // -----refresh timeline
                                    if (self.timelineComponent) {
                                        let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                                        let file = data.file;
                                        let series = (<any>res);

                                        self.fillTimelineData(types, file, series, self.timelineComponent["compRef"]);
                                        self.timelineComponent["compRef"].instance.setVisible();
                                        self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);

                                        self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
                                        setTimeout(() => {
                                            self.timelineComponent["compRef"].instance.Update();
                                        });
                                    }
                                }
                            );
                    }
                } else {
                    self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                        file: self.config.options.file,
                        series: currentLoggerSeries[0].series.filter(el => {
                            return el.Id >= 0 || el.customId;
                        })
                    });
                    // -----refresh timeline
                    if (self.timelineComponent) {
                        let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                        let file = data.file;
                        let series = currentLoggerSeries[0].series;

                        self.fillTimelineData(types, file, series, self.timelineComponent["compRef"]);
                        self.timelineComponent["compRef"].instance.setVisible();
                        self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);

                        self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
                        setTimeout(() => {
                            self.timelineComponent["compRef"].instance.Update();
                        });
                    }
                }
                assessmentProvider.loadSubtitles(self.config.options.file.ID)
                    .pipe(takeUntil(self.destroyed$))
                    .subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
                        self.subtitleComponent && self.subtitleComponent.compRef.instance.refresh(res);
                    });

                self.setReadOnlyMode(false);
            }
        );

    }
}
