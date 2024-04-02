import {ChangeDetectorRef, Component, EventEmitter, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {IMFXProTimelineComponent} from "../imfx.pro.timeline/imfx.pro.timeline";
import {IMFXProTimeline, IMFXProTimelineType} from "../imfx.pro.timeline/models/imfx.pro.timeline.model";
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";
import {DetailService} from "../../../modules/search/detail/services/detail.service";
import { timelineConfigGroup } from '../../../utils/imfx.common';

@Component({
  selector: 'imfx-pro-timeline-wrapper',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ImfxProTimelineWrapperComponent {
    public videoInfo: any;
    public onResize: EventEmitter<any> = new EventEmitter<any>();
    public clipRemoved: EventEmitter<any> = new EventEmitter<any>();
    public clipAdded: EventEmitter<any> = new EventEmitter<any>();
    private timelineConfig:IMFXProTimeline = new IMFXProTimeline();
    private file;
    private types = ['Comments', 'Legal', 'Cuts', 'Blackdetect'];
    @ViewChild("timeline", {static: false}) private timeline: IMFXProTimelineComponent;
    @Output("onClickFrame") public onClickFrame: EventEmitter<any> = new EventEmitter<any>();
    @Output("onDragCurrentTime") public onDragCurrentTime: EventEmitter<any> = new EventEmitter<any>();

    constructor(public cdr: ChangeDetectorRef,
                public detailService: DetailService) {
        this.onResize.subscribe(()=>{
            this.timeline.onResize.emit();
        });
        this.clipAdded.subscribe((data)=>{
            if(!this.timelineConfig)
                return;
            let inF = new TMDTimecode({
                type: "string",
                timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
                timecodeString: data.startTimecodeString
            }).toFrames() - (<any>this).timelineConfig.From;
            let outF = new TMDTimecode({
                type: "string",
                timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
                timecodeString: data.stopTimecodeString
            }).toFrames() - (<any>this).timelineConfig.From;

            const clipData = {
                InTc: data.startTimecodeString,
                OutTc: data.stopTimecodeString,
                timelineId: data.customId,
                TagType: data.serieName
            };

            const compare = {
                Frame: inF,
                Length: data.startTimecodeString == data.stopTimecodeString ? 1 : outF - inF,
                Value: 1,
                Data: clipData
            };
            let groupIndex = -1;
            this.timelineConfig.Groups.forEach((g, idx)=>{
                if(g.Name == "Markers") {
                    groupIndex = idx;
                }
            });
            this.timelineConfig.Groups[groupIndex].Rows[this.types.lastIndexOf(data.serieName)].Keys[compare.Frame] = compare;
            this.setVisible();
            this.setTimelineData();

            setTimeout(() => {
                this.Update();
                this.cdr.detectChanges();
            });
        });
        this.clipRemoved.subscribe((data)=>{
            let groupIndex = -1;
            this.timelineConfig.Groups.forEach((g, idx)=>{
                if(g.Name == "Markers") {
                    groupIndex = idx;
                }
            });
            const index = this.getTimelineIndex(this.timelineConfig.Groups[groupIndex].Rows[this.types.lastIndexOf(data.serieName)].Keys, data.timelineId || data.customId);
            this.timelineConfig.Groups[groupIndex].Rows[this.types.lastIndexOf(data.serieName)].Keys.splice(index, 1);
            this.setVisible();
            this.setTimelineData();

            setTimeout(() => {
                this.Update();
                this.cdr.detectChanges();
            });
        });
    }

    ngOnInit() {
        this.timeline.onClickFrame.subscribe(res => {
            this.onClickFrame.emit(res);
        });
        this.timeline.onDragCurrentTime.subscribe(frame => {
            this.onDragCurrentTime.emit(frame);
        });
    }

    public setVisible() {
        this.timeline.setVisible();
    }
    public setTimelineData() {
        this.timeline.setTimelineData(this.timelineConfig);
    }
    public Update() {
        this.timeline.Update();
    }
    public getTimelineIndex(array, value) {
        for(let i = 0; i < array.length; i++) {
            if(array[i] && array[i].Data.timelineId === value) {
                return i;
            }
        }
        return -1;
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
        for (let e in types) {
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

    private _fillTimeline(data, types, file, series, compRef) {
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
            const timeCodes = data.Scene ? data.Scene.EventData.StringTimecodes.map((val) => {
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
            for (let j = 0; j < timeCodes.length; j++) {
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
                for (let i = 0; i < data.AudioVolume.EventData.AudioTracks; i++) {
                    this.timelineConfig.Groups[this.timelineConfig.Groups.length - 1].Rows[i] =  timelineConfigGroup(waves, i);
                    var keys = waves.TimeFrames.map((el, index) => {
                        return {
                            Frame: el,
                            Length: index + 1 < waves.TimeFrames.length ? (waves.TimeFrames[index + 1] == el ? 1 : waves.TimeFrames[index + 1] - el) : this.timelineConfig.Length - el,
                            Value: waves.Values[i][index],
                            Data: null
                        };
                    });
                    for (let j = 0; j < keys.length; j++) {
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

    public fillTimelineData(types, file, series, compRef) {
        this.file = file;
        this.timelineConfig.Name = "Timeline";
        this.timelineConfig.From = file["FILE_SOM_ABSOLUTE"];
        this.timelineConfig.Length = file["FILE_EOM_ABSOLUTE"] - file["FILE_SOM_ABSOLUTE"];
        this.timelineConfig.Framerate = TMDTimecode.getFrameRate(TimeCodeFormat[file["TimecodeFormat"]]).frameRate;
        this.timelineConfig.TimecodeFormat = file["TimecodeFormat"];
        this.timelineConfig.Groups = [];

        if(!this.videoInfo) {
            this.detailService.getVideoInfo(file["ID"], {
                smudge: true,
                scene: true,
                waveform: false,
                audiovolume: true
            }).subscribe(
                (resp) => {
                    this._fillTimeline(resp, types, file, series, compRef);
                }
            );
        } else {
            this._fillTimeline(this.videoInfo, types, file, series, compRef);
        }
        compRef.instance.setTimelineData(this.timelineConfig);
    }

    public loadComponentData() {
        this.timeline.loadComponentData();
    };
    public SetTimelineTime(frames) {
        this.timeline.SetTimelineTime(frames);
    }
}
