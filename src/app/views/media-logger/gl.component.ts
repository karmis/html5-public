import { ChangeDetectionStrategy, Component, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import * as $ from 'jquery';
import {
    IMFXAccordionComponent
} from '../../modules/search/detail/components/accordion.component/imfx.accordion.component';
import { IMFXHtmlPlayerComponent } from '../../modules/controls/html.player/imfx.html.player';
import {
    IMFXDefaultTabComponent
} from '../../modules/search/detail/components/default.tab.component/imfx.default.tab.component';

import { IMFXImageComponent } from '../../modules/search/detail/components/image.component/imfx.image.component';
import {
    IMFXMediaTaggingTabComponent
} from '../../modules/search/detail/components/media.tagging.tab.component/imfx.media.tagging.tab.component';

import { IMFXLocatorsComponent } from '../../modules/controls/locators/imfx.locators.component';
import {
    IMFXTaxonomyComponent
} from '../../modules/search/detail/components/taxonomy.tab.component/imfx.taxonomy.tab.component';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import {
    IMFXVideoInfoComponent
} from '../../modules/search/detail/components/video.info.component/video.info.component';

import { GLComponent } from '../../modules/search/detail/gl.component';
import { TimeCodeFormat, TMDTimecode } from "../../utils/tmd.timecode";
import {
    LayoutManagerDefaults,
    LayoutManagerModel,
    LayoutType
} from "../../modules/controls/layout.manager/models/layout.manager.model";
import { SimpleListComponent } from "../../modules/controls/simple.items.list/simple.items.list";
import { JobStatuses } from "../workflow/constants/job.statuses";
import { MediaLoggerProvider } from "./providers/media.logger.provider";
import { Subject, Subscription } from "rxjs";
import { GoldenTabs } from "./constants/constants";
import { GoldenProvider } from "../../modules/search/detail/providers/gl.provider";
import { IMFXProTimelineType } from "../../modules/controls/imfx.pro.timeline/models/imfx.pro.timeline.model";
import { IMFXProTimelineComponent } from "../../modules/controls/imfx.pro.timeline/imfx.pro.timeline";
import { IMFXNotAvailableComponent } from "../../modules/controls/not.available.comp/imfx.not.available.comp";
import { timelineConfigGroup } from '../../utils/imfx.common';

@Component({
    selector: 'golden-logger-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXVideoInfoComponent,
        IMFXImageComponent,
        IMFXMediaTaggingTabComponent,
        IMFXLocatorsComponent,
        IMFXTaxonomyComponent,
        SimpleListComponent,
        IMFXProTimelineComponent,
        IMFXNotAvailableComponent
    ],
    providers: [
        GoldenProvider
    ]
})

export class GLLoggerComponent extends GLComponent {
    @Input() onSaveLogger: Subject<any>;
    public itemsMediaList = [];
    public layoutModel: LayoutManagerModel;
    public layoutType: LayoutType = LayoutType.Logging;
    public changeLayout: EventEmitter<any> = new EventEmitter<any>();
    public allValidTabs = GoldenTabs.tabs;
    public tabsWithTimecodes = GoldenTabs.timecodesTabs;

    private timelineComponent: any;
    private metadataComponent: any;
    private onAddClip: EventEmitter<any> = new EventEmitter();
    protected loggerSeriesArray: Array<any> = [];
    private loggerProvider: MediaLoggerProvider = null;
    protected addClipSubcription: Subscription;
    protected requestCount: number = 0;
    protected playerExist: boolean = true;

    @Input('config')
    set setConfig(config) {
        this.config = $.extend(true, this.config, config);
        // this.config.componentContext = this;
        if (this.config.providerType) {
            this.provider = this.injector.get(this.config.providerType);
            this.provider.config = this.config;
        }
    }

    ngOnInit() {
        console.log("Waiting layout...");
        this.loggerProvider = this.injector.get(MediaLoggerProvider);
        this.onSaveLogger.subscribe(() => {
            let nonValidTimecodeTabs = this.allValidTabs.filter(el => {
                return (el.isValid == false && (el.componentName == this.tabsWithTimecodes.Tagging) && el.timecodesInvalid);
            });
            if (nonValidTimecodeTabs.length !== 0) {
                this.notificationRef.notifyShow(2, 'Please check all timecodes!');
            } else {
                // save locators
                this.requestCount = 0;
                this.loggerSeriesArray.forEach(el => {
                    this.taggingComponent && this.taggingComponent.emit('onSaveMediaTagging', {
                        series: el.series,
                        guid: el.fileGuid,
                        fileId: el.fileId
                    });
                });
            }
        });
        (<any>window).imfxLocatorComponent = this;
    }

    ngOnLayoutInit(model) {
        this.config.componentContext = this;
        this.storagePrefix = this.config.options.titleForStorage + '.saved.state';

        if (model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.layoutConfig = JSON.parse(model.actualModel.Layout);
            this.clearLayoutFromComponentState(this.layoutConfig, this);
            this.updateHeightWidthLayout(this.layoutConfig, this);
        } else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.layoutConfig = JSON.parse(this.layoutModel.Layout);
                    this.clearLayoutFromComponentState(this.layoutConfig, this);
                    this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
                } else {
                    this.layoutModel = model.defaultModel;
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.Logging);
                    this.clearLayoutFromComponentState(this.layoutConfig, this);
                }
            } else {
                this.layoutModel = model.defaultModel;
                this.layoutConfig = JSON.parse(LayoutManagerDefaults.Logging);
                this.clearLayoutFromComponentState(this.layoutConfig.content[0], this);
            }
        }
        this.combineAllValidTabs();
        this.postOnInit();
        this.changeLayout.subscribe((res: any) => {
            new Promise((resolve) => {
                resolve();
            }).then(
                () => {
                    this.layout.off('itemDestroyed');
                    this.layout.destroy();
                    this.layoutConfig = JSON.parse(this.layoutConfig);
                    this.clearLayoutFromComponentState(this.layoutConfig, this);
                    this.config.componentContext = this;
                    this.updateData(res);
                    this.postOnInit();
                },
                (err) => {
                    console.log(err);
                }
            );
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

    postOnInit() {
        this.setView();
        (<any>window).GoldenLayout.__lm.items.Stack.prototype._highlightHeaderDropZone = this._highlightHeaderDropZoneOverride;
        (<any>window).GoldenLayout.__lm.LayoutManager.prototype._$createRootItemAreas = this._$createRootItemAreasOverride;
        //  (<any>window).GoldenLayout.__lm.controls.BrowserPopout.prototype.popIn = this._popIn;

        this.provider.setCreatePopoutMethod();
    }

    public setViewCommon() {
        super.setViewVariables();
        this.playerExist = this.config.options.params ? this.config.options.params.mediaType == 'htmlPlayer' : true;
        let self = this;
        this.itemsMediaList = this.config.moduleContext.itemsMediaList;

        this.addMediaInfo(self);
        this.addMediaLayout(self);
    }

    setView() {
        let self = this;
        this.layoutConfig = this.checkLayoutCompByName(this.layoutConfig, 'JobData', true);
        this.setViewCommon();
        this.addTimeline(self);
        this.addMediaList(self);
        this.addTagging(self);
        this.addTaxonomy(self);
        this.setEvents();
        this.layout.on('stateChanged', () => {
            // if (self.editLayoutMode) {
            if (self.layout.openPopouts && self.layout.openPopouts.length === 0) {
                const state = self.layout.toConfig();
                self.clearLayoutFromComponentState(state, self);
                self.layoutConfig = JSON.stringify(state);
                if (self.layoutModel)
                    self.layoutModel.Layout = self.layoutConfig;
            }
            // }
        });
        this.layout.on('poppedOut', () => {
        })
        this.layout.on('popIn', () => {
        })
        this.layout.init();
        this.createNewTabsAfterInit();
        this.splashProvider.onHideSpinner.emit();
        this.layout.root && this.layout.root.getItemsByFilter((el) => {
            return el.type == "stack" && el.contentItems.length == 0
        }).forEach((elem) => {
            elem.remove();
        });
        this.createDragButtons();
    };

    addMediaInfo(self) {
        self.layout.registerComponent('Data', (container) => {
            const compRef = super.addMediaTab(self, container);
            self.metadataComponent = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addTagging(self) {
        self.layout.registerComponent('Tagging', (container) => {
            this.translateTitle(container, '.tagging');
            let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXLocatorsComponent);
            let compRef = self.viewContainer.createComponent(factory);

            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            compRef.instance.onSetTaggingNode.subscribe(o => {
                self.layout.emit('setMarkers', o);
                self.layout.emit('selectClipStateBtns');
            });
            compRef.instance.onDeleteItem.subscribe(o => {
                self.timelineComponent && self.timelineComponent.emit('clipRemoved', o);
            });
            compRef.instance.onSetTimecodeString.subscribe(tc => {
                self.layout.emit('setTimecode', tc);
            });
            compRef.instance['taxonomySettings'] = self.config.moduleContext.taxonomySettings;
            container.on('clearMarkers', (data) => {
                self.layout.emit('clearMarkers', data);
            });
            container.on('disableAllMarkersButtons', () => {
                self.layout.emit('disableAllMarkersButtons');
            });
            container.on('addTag', (data) => {
                compRef['_component'].addTag(data);
            });
            container.on('onSaveMediaTagging', (data) => {
                compRef['_component'].saveMediaTagging(data.series, data.guid, data.fileId, false).subscribe((res: any) => {
                    if (res) {
                        compRef['_component'].updateSavedMediaTagging(res, data.series, data.guid);
                    }
                    self.requestCount++;
                    if (self.loggerSeriesArray.length == self.requestCount) {
                        let message = self.translate.instant('media_logger.success_save');
                        self.notificationRef.notifyShow(1, message);
                    }
                });
            });
            container.on('clipAdded', (data) => {
                self.timelineComponent && self.timelineComponent.emit('clipAdded', data.el);
            });
            container.on('clipReplaced', (data) => {
                self.timelineComponent && self.timelineComponent.emit('clipReplaced', data);
            });
            container.on('updateLocator', (res: any) => {
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

            // check locators when change layout
            let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
                return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
            });
            if (currentLoggerSeries.length === 0) { // if there is no loading series for current item
                if (self.config.options.file.DFILE_LINK_GUID != '' && self.config.options.file.DFILE_LINK_GUID != null) {
                    self.loggerProvider.loadTagging(self.config.options.file.DFILE_LINK_GUID).subscribe(
                        res => {
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

                                self.timelineComponent && self.fillTimelineData(['Comments', 'Legal', 'Cuts', 'Blackdetect'], self.config.options.file, res, self.timelineComponent["compRef"], self);
                            }
                        }
                    );
                }
            }

            compRef.instance['config'] = {
                file: self.config.options.file,
                series: self.config.options.series/*[0] && self.config.options.series[0].source*/,
                elem: container,
                componentContext: self.config.componentContext,
                commentsColumns: [/*"thumbIn", "thumbOut",*/ "indicator", "InTc", "OutTc", "DurationTc", "Notes", "Tags"],
                blackDetectedColumns: ["InTc", "OutTc", "DurationTc", "Notes", "Tags"],
                options: {},
                loadedSeries: self._deepCopy(self.config.options.series),
                readOnly: self.getReadOnlyModeForTab(self.config.options.file)
            };
            compRef.instance.playerExist = self.playerExist;
            self.taggingComponent = container;
            container.on('addClip', (data) => {
                compRef['_component'].addClip(data);
            });
            self.layout.on('setReadOnly', (readOnly) => {
                compRef.instance.onRefresh.next(readOnly);
            });
            container.on('getTimecodesForEntry', replace => {
                compRef.instance.waitForInOutTimecodes = true;
                self.layout.emit('getInOutTimecodesFromPlayer', replace);
            })
            self.addClipSubcription = self.onAddClip.subscribe(data => {
                if (compRef.instance.waitForInOutTimecodes) {
                    compRef.instance.addClip(data);
                    compRef.instance.waitForInOutTimecodes = false;
                }
            });
            container.on('isDataValid', isValid => {
                super.validateTab(self, container, isValid);
            });
            container.on('timecodesInvalid', timecodesInvalid => {
                self.allValidTabs.filter(el => {
                    return el.tTitle == container.title;
                })[0].timecodesInvalid = timecodesInvalid;
            });
            compRef.changeDetectorRef.detectChanges();
            if (currentLoggerSeries.length !== 0) {
                self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                    file: self.config.options.file,
                    series: self.config.options.series
                });
            }
        });
    }

    addTaxonomy(self) {
        self.layout.registerComponent('Taxonomy', (container) => {
            let fullKey = self.config.options.typeDetailsLocal + '.taxonomy';
            self.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXTaxonomyComponent);
            let compRef = self.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            compRef.instance['config'] = {
                elem: container
            };
            compRef.instance['taxonomySettings'] = self.config.moduleContext.taxonomySettings;
            container.on('addTag', (data) => {
                self.taggingComponent && self.taggingComponent.emit('addTag', data);
            });
            compRef.changeDetectorRef.detectChanges();
        });
    }

    changeLayoutHandler($event, _this) {
        let self = _this ? _this : this;
        super.changeLayoutHandler($event, self);
        this.clearLayoutFromComponentState(this.layoutConfig.content[0], this);
        this.saveLayoutHandler($event);
        this.setView();
    }

    saveLayoutHandler($event) {
        this.layoutModel = $event;
        this.layoutConfig = JSON.parse(this.layoutModel.Layout);
        this.clearLayoutFromComponentState(this.layoutConfig.content[0], this);
        this.storageService.store(this.storagePrefix, JSON.stringify(this.layoutModel));
    }

    createNewTabsAfterInit() {
        super.createNewTabsAfterInit(this);
    }

    private fillTimelineData(types, file, series, compRef, self) {
        self.timelineConfig.Name = "Timeline";
        self.timelineConfig.From = file["FILE_SOM_ABSOLUTE"];
        self.timelineConfig.Length = file["FILE_EOM_ABSOLUTE"] - file["FILE_SOM_ABSOLUTE"];
        self.timelineConfig.Framerate = TMDTimecode.getFrameRate(TimeCodeFormat[file["TimecodeFormat"]]).frameRate;
        self.timelineConfig.TimecodeFormat = file["TimecodeFormat"];
        self.timelineConfig.Groups = [];

        self.detailService.getVideoInfo(file["ID"], {
            smudge: true,
            scene: true,
            waveform: false,
            audiovolume: true
        }).subscribe(
            (resp) => {
                if (resp.Smudge) {
                    if (!self.timelineConfig.Groups[0])
                        self.timelineConfig.Groups.push({
                            Name: "Images",
                            Expandable: true,
                            Expanded: true,
                            WithHeader: false,
                            Rows: []
                        });
                    self.timelineConfig.Groups[0].Rows.push({
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
                if (resp.Scene) {
                    if (!self.timelineConfig.Groups[0])
                        self.timelineConfig.Groups.push({
                            Name: "Images",
                            Expandable: true,
                            Expanded: true,
                            WithHeader: false,
                            Rows: []
                        });
                    const timeCodes = resp.Scene ? resp.Scene.EventData.StringTimecodes.map((val) => {
                        return new TMDTimecode({
                            type: "string",
                            timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                            timecodeString: val
                        }).toFrames() - self.timelineConfig.From;
                    }) : [];
                    self.timelineConfig.Groups[0].Rows.push({
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
                    for (let j = 0; j < timeCodes.length; j++) {
                        self.timelineConfig.Groups[0].Rows[self.timelineConfig.Groups[0].Rows.length - 1].Data.TimecodesMap[timeCodes[j]] = {
                            frame: timeCodes[j],
                            index: j
                        };
                    }
                }
                if (resp.AudioVolume) {
                    self.detailService.getWaveformsJson(resp.AudioVolume.Url).subscribe((waves) => {
                        self.fillMarkers(types, series, file);
                        if (resp.AudioVolume.EventData.AudioTracks > 0)
                            self.timelineConfig.Groups.push({
                                Name: "Audio",
                                Expandable: true,
                                Expanded: true,
                                WithHeader: true,
                                Rows: []
                            });
                        for (let i = 0; i < resp.AudioVolume.EventData.AudioTracks; i++) {
                            self.timelineConfig.Groups[self.timelineConfig.Groups.length - 1].Rows[i] = timelineConfigGroup(waves, i);
                            const keys = waves.TimeFrames.map((el, index) => {
                                return {
                                    Frame: el,
                                    Length: index + 1 < waves.TimeFrames.length ? (waves.TimeFrames[index + 1] == el ? 1 : waves.TimeFrames[index + 1] - el) : self.timelineConfig.Length - el,
                                    Value: waves.Values[i][index],
                                    Data: null
                                };
                            });
                            for (let j = 0; j < keys.length; j++) {
                                self.timelineConfig.Groups[self.timelineConfig.Groups.length - 1].Rows[i].Keys[keys[j].Frame] = keys[j];
                            }
                        }

                        compRef.instance.setTimelineData(self.timelineConfig);
                        compRef.instance.cdr.detectChanges();
                        setTimeout(() => {
                            if (compRef.instance instanceof IMFXProTimelineComponent)
                                compRef.instance.Update();
                            compRef.instance.cdr.detectChanges();
                        });
                    });
                } else {
                    self.fillMarkers(types, series, file);
                    compRef.instance.setTimelineData(self.timelineConfig);
                    compRef.instance.cdr.detectChanges();
                    setTimeout(() => {
                        if (compRef.instance instanceof IMFXProTimelineComponent)
                            compRef.instance.Update();
                        compRef.instance.cdr.detectChanges();
                    });
                }
            }
        );

        compRef.instance.setTimelineData(self.timelineConfig);
        compRef.instance.cdr.detectChanges();
    }

    addTimeline(self) {
        self.layout.registerComponent('Timeline', (container, componentState) => {
            let fullKey = self.config.options.typeDetailsLocal + '.timeline';
            self.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXProTimelineComponent);
            let compRef = self.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;

            let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
            let file = <any>self.config.options.file;
            let currentLogger = self.loggerSeriesArray.filter(el => {
                return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
            });

            compRef.instance.setVisible();

            compRef.instance.onClickFrame.subscribe(marker => {
                self.layout.emit('setMarkers', {
                    markers: [{time: marker.Data.InTc}, {time: marker.Data.OutTc}],
                    id: marker.Data.Id,
                    m_type: 'locator'
                });
                compRef.instance.SetTimelineTime(marker.Frame);
                self.layout.emit('clearClipBntsState');
            });

            compRef.instance.onDragCurrentTime.subscribe(frame => {
                self.layout.emit('setTimecodeFrames', frame);
            });

            container.on('clipAdded', (data) => {
                let serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';

                let inF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.startTimecodeString
                }).toFrames() - self.timelineConfig.From;
                let outF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.stopTimecodeString
                }).toFrames() - self.timelineConfig.From;

                const clipData = {
                    InTc: data.startTimecodeString,
                    OutTc: data.stopTimecodeString,
                    timelineId: data.customId,
                    TagType: serieName
                };

                const compare = {
                    Frame: inF,
                    Length: data.startTimecodeString == data.stopTimecodeString ? 1 : outF - inF,
                    Value: 1,
                    Data: clipData
                };
                let groupIndex = -1;
                self.timelineConfig.Groups.forEach((g, idx) => {
                    if (g.Name == "Markers") {
                        groupIndex = idx;
                    }
                });
                self.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys[compare.Frame] = compare;
                compRef.instance.setVisible();
                compRef.instance.setTimelineData(self.timelineConfig);

                setTimeout(() => {
                    compRef.instance.Update(null, true);
                    compRef.changeDetectorRef.detectChanges();
                });
            });
            container.on('clipReplaced', (data) => {
                let serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';

                let inF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.newClip.startTimecodeString
                }).toFrames() - self.timelineConfig.From;
                let outF = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: data.newClip.stopTimecodeString
                }).toFrames() - self.timelineConfig.From;

                const clipData = {
                    InTc: data.newClip.startTimecodeString,
                    OutTc: data.newClip.stopTimecodeString,
                    timelineId: data.oldClipId,
                    TagType: serieName
                };

                const compare = {
                    Frame: inF,
                    Length: data.newClip.startTimecodeString == data.newClip.stopTimecodeString ? 1 : outF - inF,
                    Value: 1,
                    Data: clipData
                };
                let groupIndex = -1;
                self.timelineConfig.Groups.forEach((g, idx) => {
                    if (g.Name == "Markers") {
                        groupIndex = idx;
                    }
                });
                const index = self.getTimelineIndex(self.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys, clipData.timelineId);
                self.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys.splice(index, 1);
                self.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys[compare.Frame] = compare;
                compRef.instance.setVisible();
                compRef.instance.setTimelineData(self.timelineConfig);

                setTimeout(() => {
                    compRef.instance.Update();
                    compRef.changeDetectorRef.detectChanges();
                });
            });

            container.on('clipRemoved', (data) => {
                let serieName = self.taggingComponent ? self.taggingComponent.compRef.instance.active : '';
                let groupIndex = -1;
                self.timelineConfig.Groups.forEach((g, idx) => {
                    if (g.Name == "Markers") {
                        groupIndex = idx;
                    }
                });
                const index = self.getTimelineIndex(self.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys, data.timelineId || data.customId);
                self.timelineConfig.Groups[groupIndex].Rows[types.lastIndexOf(serieName)].Keys.splice(index, 1);

                compRef.instance.setVisible();
                compRef.instance.setTimelineData(self.timelineConfig);

                setTimeout(() => {
                    compRef.instance.Update();
                    compRef.changeDetectorRef.detectChanges();
                });
            });
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            compRef.changeDetectorRef.detectChanges();
            setTimeout(() => {
                compRef.instance.Update();
            });

            self.layout.on('timecodeChange', tcStr => {
                const tc = new TMDTimecode({
                    type: "string",
                    timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                    timecodeString: tcStr
                });
                compRef.instance.SetTimelineTime(tc.toFrames());
            });
            (<any>window).imfxTimelineComponent = self.timelineComponent = container;
        });
    };

    getTimelineIndex(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] && array[i].Data.timelineId === value) {
                return i;
            }
        }
        return -1;
    }

    addMediaList(self) {
        self.layout.registerComponent('MediaItems', (container, componentState) => {
            const compRef = super.addMediaList(self, container);
            compRef.instance.onSelect.subscribe(data => {
                if (data.file.ID != self.config.options.file.ID) {
                    this.setConfigMediaItemsTab(self, data);
                }
            });
        });
    }

    public setConfigMediaItemsTab(self, data) {
        self.config.options.file = data.file;
        self.detailsComponent && (self.detailsComponent.compRef.instance.file = data.file);
        self.detailsComponentFile = data.file;

        self.playerComponents.compRef.instance.src = data.file.PROXY_URL; // self.config.moduleContext.config.componentContext.src;
        self.playerComponents.compRef.instance.file = data.file;
        self.playerComponents.compRef.instance.id = data.file.ID;
        // refresh meta data comp
        self.metadataComponent && self.metadataComponent.compRef.instance.refresh(data.file);

        //-----------
        let currentLoggerSeries = self.loggerSeriesArray.filter(el => {
            return el.fileGuid == self.config.options.file.DFILE_LINK_GUID;
        });
        if (currentLoggerSeries.length === 0) { // if there is no loading series for current item
            if (self.config.options.file.DFILE_LINK_GUID != '' && self.config.options.file.DFILE_LINK_GUID != null) {
                self.loggerProvider.loadTagging(self.config.options.file.DFILE_LINK_GUID).subscribe( // load it
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
                        // -----refresh timeline
                        if (self.timelineComponent) {
                            let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                            let file = data.file;
                            let series = (<any>res);

                            this.setConfigTimelineComponent(self, types, file, series);
                        }
                    }
                );
            }
        } else {
            self.taggingComponent && self.taggingComponent.compRef.instance.refresh({
                file: self.config.options.file,
                series: currentLoggerSeries[0].series
            });
            // -----refresh timeline
            if (self.timelineComponent) {
                let types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
                let file = data.file;
                let series = currentLoggerSeries[0].series;
                this.setConfigTimelineComponent(self, types, file, series)
            }
        }

        // refresh player
        self.layout.emit('playerRefresh');
    }

    setConfigTimelineComponent(self, types, file, series) {
        self.fillTimelineData(types, file, series, self.timelineComponent["compRef"], self);
        self.timelineComponent["compRef"].instance.setVisible();
        self.timelineComponent["compRef"].instance.setTimelineData(self.timelineConfig);
        self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
        setTimeout(() => {
            self.timelineComponent["compRef"].instance.Update();
            self.timelineComponent["compRef"].changeDetectorRef.detectChanges();
        });
    }

    getReadOnlyModeForTab(file) {
        if (!this.config.moduleContext.taskFile) { // for media logget - always editable
            return false;
        }
        let data = this.storageService.retrieve('permissions');
        if (this.config.moduleContext.taskFile.LOCKED_BY !== data.FullName) {
            return true;
        }
        if (this.config.moduleContext.taskFile.TSK_STATUS !== JobStatuses.INPROG) {
            return true;
        } else {
            return file.IsGanged && !file.IsGangedMain;
        }
    }
}
