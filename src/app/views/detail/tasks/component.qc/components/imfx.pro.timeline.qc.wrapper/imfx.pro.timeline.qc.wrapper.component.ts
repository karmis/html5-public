import {ChangeDetectorRef, Component, EventEmitter, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {IMFXProTimelineComponent} from "../../../../../../modules/controls/imfx.pro.timeline/imfx.pro.timeline";
import {
    IMFXProTimeline, IMFXProTimelineRow,
    IMFXProTimelineType
} from "../../../../../../modules/controls/imfx.pro.timeline/models/imfx.pro.timeline.model";
import {TimeCodeFormat, TMDTimecode} from "../../../../../../utils/tmd.timecode";
import {IMFXModalProvider} from "../../../../../../modules/imfx-modal/proivders/provider";
import {SelectTracksModalComponent} from "../../modals/select.tracks.modal/select.tracks";
import {BaseProvider} from "../../../../../base/providers/base.provider";
import {forkJoin, Observable} from "rxjs";
import {map} from "rxjs/operators";
import { lazyModules } from "../../../../../../app.routes";

@Component({
  selector: 'imfx-pro-timeline-qc-wrapper',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ImfxProTimelineQCWrapperComponent {
    public onResize: EventEmitter<any> = new EventEmitter<any>();

    @Output("onTracksSelected") public onTracksSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output("onClickFrame") public onClickFrame: EventEmitter<any> = new EventEmitter<any>();
    @Output("onDragCurrentTime") public onDragCurrentTime: EventEmitter<any> = new EventEmitter<any>();
    @Output("onRowHeaderClicked") public onRowHeaderClicked: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("timeline", {static: true}) private timeline: IMFXProTimelineComponent;

    private timelineConfig:IMFXProTimeline = new IMFXProTimeline();
    private audioTracksRowsInternal = [];
    private audioTracksRowsExternal = [];
    private file;
    private selectTracksModal;
    //private devMode = false;

    constructor(public cdr: ChangeDetectorRef,
                protected baseProvider: BaseProvider,
                protected modalProvider: IMFXModalProvider) {
        this.onResize.subscribe(()=>{
            this.timeline.onResize.emit();
        });
        //this.devMode = this.baseProvider.isDevServer;
    }

    ngOnInit() {
        this.timeline.onClickFrame.subscribe(data => {
            this.onClickFrame.emit(data);
        });

        this.timeline.onDragCurrentTime.subscribe(data => {
            this.onDragCurrentTime.emit(data);
        });

        this.timeline.onGroupGearButtonClicked.subscribe(data => {
            this.selectTracks();
        });

        this.timeline.onRowHeaderClicked.subscribe(row => {
            let index = -1;
            for(var i = 0; i < this.audioTracksRowsInternal.length; i++) {
                //TODO BAD replace to unique ID for every row
                if(this.audioTracksRowsInternal[i].Name == row.Name) {
                    index = i;
                }
            }
            this.selectAudiotrack({Row:row, Index: index});
        });
    }

    public SetTimelineTime(time) {
        this.timeline.SetTimelineTime(time);
    }

    public loadComponentData() {
        this.timeline.loadComponentData();
    };

    public Update(timelineData?: any, force: boolean = false, updateVisibleRnge: boolean = true) {
        this.timeline.Update(timelineData, force, updateVisibleRnge);
    }

    public setTimelineData(data) {
        this.timeline.setTimelineData(data);
    }

    public fillTimelineData(types, file, series, videoInfo, detailService, mediaItems) {
        this.file = file;
        this.timelineConfig.Name = "Timeline";
        this.timelineConfig.From = file["FILE_SOM_ABSOLUTE"];
        this.timelineConfig.Length = file["FILE_EOM_ABSOLUTE"] - file["FILE_SOM_ABSOLUTE"];
        this.timelineConfig.Framerate = TMDTimecode.getFrameRate(TimeCodeFormat[file["TimecodeFormat"]]).frameRate;
        this.timelineConfig.TimecodeFormat = file["TimecodeFormat"];
        this.timelineConfig.Groups = [];

        if (!videoInfo) {
            detailService.getVideoInfo(file["ID"], {
                smudge: true,
                scene: true,
                waveform: false,
                audiovolume: true
            }).subscribe(
                (resp) => {
                    this.parseTimelineData(types, file, series, resp, detailService, mediaItems);
                }
            );
        } else {
            this.parseTimelineData(types, file, series, videoInfo, detailService, mediaItems);
        }
        this.setTimelineData(this.timelineConfig);
    }

    private parseTimelineData(types, file, series, data, detailService, mediaItems) {
        if(data.Smudge) {
            if(!this.timelineConfig.Groups[0])
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
        if(data.Scene) {
            if(!this.timelineConfig.Groups[0])
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
        if (data.AudioVolume || mediaItems && mediaItems.length > 0) {
            var groupIndex = -1;
            this.timelineConfig.Groups.forEach((g, idx)=>{
                if(g.Name == "Audio") {
                    groupIndex = idx;
                }
            });
            if(groupIndex < 0) {
                this.timelineConfig.Groups.push({
                    Name: "Audio",
                    Expandable: true,
                    Expanded: true,
                    WithHeader: true,
                    WithGearButton: true,
                    HeaderAdditionalText: "Loading...",
                    Rows: []
                });
                groupIndex = this.timelineConfig.Groups.length - 1;
            }
            else {
                this.timelineConfig.Groups[groupIndex].Rows = [];
            }
            this.fillMarkers(types, series, file);
            if (data.AudioVolume) {
                this.collectedAudio.push({
                    data: data,
                    external: false,
                    audioItem: file
                });
            }

            if (mediaItems && mediaItems.length > 0) {
                var audioItems = mediaItems.filter(x => x.MEDIA_TYPE == 150);
                let requestsCounter = 0;
                for (var i = 0; i < audioItems.length; i++) {
                    let audioItem = audioItems[i];
                    detailService.getVideoInfo(audioItem["ID"], {
                        smudge: false,
                        scene: false,
                        waveform: false,
                        audiovolume: true
                    }).subscribe(
                        (resp) => {
                            requestsCounter++;
                            if (resp.AudioVolume) {
                                this.collectedAudio.push({
                                    data: resp,
                                    external: true,
                                    audioItem: audioItem
                                });
                            }
                            if(requestsCounter == audioItems.length)
                                this.processCollectedAudioData(detailService);
                        }
                    );
                }
            }
            else {
                this.processCollectedAudioData(detailService);
            }
        }
        else {
            this.fillMarkers(types, series, file);
            this.processCollectedAudioData(detailService);
        }
    }

    private collectedAudio = [];
    private processCollectedAudioData(detailService) {
        let observableBatch = [];

        if (this.collectedAudio.length == 0) {
            this.finalizeAudioWaves();
        } else {
            this.collectedAudio.forEach((val, key) => {
                observableBatch.push(detailService.getWaveformsJson(val.data.AudioVolume.Url)
                    .pipe(map((res: any) => {
                        if (val.external) {
                            for (var i = 0; i < val.data.AudioVolume.EventData.AudioTracks; i++) {
                                if (val.audioItem.FILENAME)
                                    res.Tracks[i] = val.audioItem.FILENAME;
                            }
                        }
                        return {response: res, external: val.external, data: val.data, file: val.audioItem};
                    })));
            });

            forkJoin(observableBatch).subscribe((res: any) => {
                let internalCounter = 0;
                let externalCounter = 0;

                for (let r = 0; r < res.length; r++) {
                    let data = res[r].data;
                    let file = res[r].file;
                    let waves = res[r].response;
                    let external = res[r].external;
                    let title = external ? "External " : "Internal ";

                    for (var i = 0; i < data.AudioVolume.EventData.AudioTracks; i++) {
                        var track = {
                            Name: waves.Tracks && i < waves.Tracks.length && waves.Tracks[i] && waves.Tracks[i].length > 0 ? waves.Tracks[i] : title + "Track " + ((external ? externalCounter : internalCounter) + 1),
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

                        if (external) {
                            this.audioTracksRowsExternal[externalCounter] = track;
                            (<any>track.Data).File = file;
                        } else
                            this.audioTracksRowsInternal[internalCounter] = track;

                        var keys = waves.TimeFrames.map((el, index) => {
                            return {
                                Frame: el,
                                Length: index + 1 < waves.TimeFrames.length ? (waves.TimeFrames[index + 1] == el ? 1 : waves.TimeFrames[index + 1] - el) : this.timelineConfig.Length - el,
                                Value: waves.Values[i][index],
                                Data: null
                            };
                        });
                        for (var j = 0; j < keys.length; j++) {
                            if (external)
                                this.audioTracksRowsExternal[externalCounter].Keys[keys[j].Frame] = keys[j];
                            else
                                this.audioTracksRowsInternal[internalCounter].Keys[keys[j].Frame] = keys[j];
                        }
                        if (external)
                            externalCounter++;
                        else
                            internalCounter++;
                    }
                }
                this.finalizeAudioWaves();
            });
        }
    }

    private finalizeAudioWaves() {

        var groupIndex = -1;
        this.timelineConfig.Groups.forEach((g, idx)=>{
            if(g.Name == "Audio") {
                groupIndex = idx;
            }
        });
        if((this.audioTracksRowsInternal.length + this.audioTracksRowsExternal.length) == 0) {
            this.timelineConfig.Groups[groupIndex].WithGearButton = false;
        }
        this.timelineConfig.Groups[groupIndex].HeaderAdditionalText = "Available - " + (this.audioTracksRowsInternal.length + this.audioTracksRowsExternal.length) + " tracks";
        if(this.audioTracksRowsInternal.length > 0 && this.audioTracksRowsInternal.length <= 4) {
            var data = {
              internal: [],
                external: []
            };
            for(var i = 0; i < this.audioTracksRowsInternal.length; i++) {
                this.audioTracksRowsInternal[i].Data.Selected = true;
                data.internal[i] = true;
            }
            this.processSelectedTracks(data);
        }
        else {
            this.setTimelineData(this.timelineConfig);
            setTimeout(() => {
                this.Update(null, true, true);
            });
        }
    }

    private fillMarkers(types, series, file) {
        let hasContent = false;
        for (var e in types) {
            var keys = series.filter((elem) => {
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
            if(keys.length > 0) {
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
                this.timelineConfig.Groups[groupIndex].Rows.push({
                    Name: types[e],
                    Type: IMFXProTimelineType.Marker,
                    Keys: []
                });
                for (var i = 0; i < keys.length; i++) {
                    this.timelineConfig.Groups[groupIndex].Rows[this.timelineConfig.Groups[groupIndex].Rows.length - 1].Keys[keys[i].Frame] = keys[i];
                }
            }
        }
    }

    private selectTracks() {
        console.log('selectTask');

        this.selectTracksModal = this.modalProvider.showByPath(lazyModules.select_tracks_modal,
            SelectTracksModalComponent, {
            size: "md",
            title: 'component_qc.modal.select_tracks_title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, timelineConfig: this.timelineConfig,
            audioTracksRowsInternal: this.audioTracksRowsInternal,
            audioTracksRowsExternal: this.audioTracksRowsExternal});
        this.selectTracksModal.load().then(cr => {
            this.selectTracksModal.modalEvents.subscribe((res:any) => {
                if(res && res.name == "ok") {
                    this.processSelectedTracks(res.$event);
                }
            });
        })
    }

    private processSelectedTracks(data) {
        var groupIndex = -1;
        this.timelineConfig.Groups.forEach((g, idx)=>{
            if(g.Name == "Audio") {
                groupIndex = idx;
            }
        });
        this.timelineConfig.Groups[groupIndex].Rows = [];
        for (var i = 0; i < data.internal.length; i++) {
            if(data.internal[i]) {
                this.audioTracksRowsInternal[i].Data.Selected = true;
                this.timelineConfig.Groups[groupIndex].Rows.push(this.audioTracksRowsInternal[i]);
            }
            else {
                this.audioTracksRowsInternal[i].Data.Selected = false;
            }
        }
        for (var i = 0; i < data.external.length; i++) {
            if (data.external[i]) {
                this.audioTracksRowsExternal[i].Data.Selected = true;
                this.timelineConfig.Groups[groupIndex].Rows.push(this.audioTracksRowsExternal[i]);
            } else {
                this.audioTracksRowsExternal[i].Data.Selected = false;
            }
        }

        this.setTimelineData(this.timelineConfig);
        setTimeout(() => {
            this.Update(null, true, true);
        });
    }

    public selectInternalAudiotrackOutside(index) {
        for(var i = 0; i < this.audioTracksRowsInternal.length; i++) {
            if(i == index)
                this.audioTracksRowsInternal[i].Highlighted = true;
            else
                this.audioTracksRowsInternal[i].Highlighted = false;
        }
        for(var i = 0; i < this.audioTracksRowsExternal.length; i++) {
            this.audioTracksRowsExternal[i].Highlighted = false;
        }
    }

    public selectExternalAudiotrackOutside(ID) {
        for(var i = 0; i < this.audioTracksRowsExternal.length; i++) {
            if(ID === this.audioTracksRowsExternal[i].Data.File.ID)
                this.audioTracksRowsExternal[i].Highlighted = true;
            else
                this.audioTracksRowsExternal[i].Highlighted = false;
        }
        for(var i = 0; i < this.audioTracksRowsInternal.length; i++) {
            this.audioTracksRowsInternal[i].Highlighted = false;
        }
    }

    private selectAudiotrack(data) {
        let row = data.Row;
        let index = data.Index;
        if(row.Type == IMFXProTimelineType.Waveform) {
            if (row.Data.File && row.Data.File.MEDIA_TYPE == 150) {
                this.onRowHeaderClicked.emit({file:row.Data.File});
                for(var i = 0; i < this.audioTracksRowsExternal.length; i++) {
                    if(row.Data.File.ID == this.audioTracksRowsExternal[i].Data.File.ID)
                        this.audioTracksRowsExternal[i].HighlightedDefault = true;
                    else
                        this.audioTracksRowsExternal[i].HighlightedDefault = false;
                }
                for(var i = 0; i < this.audioTracksRowsInternal.length; i++) {
                    this.audioTracksRowsInternal[i].HighlightedDefault = false;
                }
            }
            else {
                this.onRowHeaderClicked.emit({index:index});
                for(var i = 0; i < this.audioTracksRowsInternal.length; i++) {
                    if(i == index) {
                        this.audioTracksRowsInternal[i].HighlightedDefault = true;
                    }
                    else
                        this.audioTracksRowsInternal[i].HighlightedDefault = false;
                }
                for(var i = 0; i < this.audioTracksRowsExternal.length; i++) {
                    this.audioTracksRowsExternal[i].HighlightedDefault = false;
                }
            }
        }

    }
}
