import {ChangeDetectorRef, Component, EventEmitter, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {IMFXProTimelineComponent} from "../imfx.pro.timeline/imfx.pro.timeline";
import {IMFXProTimeline, IMFXProTimelineType} from "../imfx.pro.timeline/models/imfx.pro.timeline.model";
import {TimelineSerieItem} from "../imfx.pro.timeline.wrapper/timeline.config";
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";

@Component({
  selector: 'imfx-pro-timeline-additional-buttons-wrapper',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ImfxProTimelineAdditionalButtonsWrapperComponent {
    public onResize: EventEmitter<any> = new EventEmitter<any>();
    public timelineType: string = 'IMFXProTimeline';
    @Output("onClipRemoved") public onClipRemoved: EventEmitter<any> = new EventEmitter<any>();
    @Output("onButtonPressed") public onButtonPressed: EventEmitter<any> = new EventEmitter<any>();
    @Output("onClickClip") public onClickClip: EventEmitter<any> = new EventEmitter<any>();
    @Output("onDragClip") public onDragClip: EventEmitter<any> = new EventEmitter<any>();
    @Output("OnAddClip") public OnAddClip: EventEmitter<any> = new EventEmitter<any>();
    @Output("OnReplaceClip") public OnReplaceClip: EventEmitter<any> = new EventEmitter<any>();
    @Output("OnRemoveClip") public OnRemoveClip: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('timeline', {static: true}) private timeline: IMFXProTimelineComponent;

    private timelineConfig:IMFXProTimeline = new IMFXProTimeline();
    private clipImages = [];
    private lastClipId = 0;
    private file;
    private readOnly: boolean = false;
    private selectedItem = null;

    constructor(public cdr: ChangeDetectorRef) {
        this.onResize.subscribe(()=>{
            this.timeline.onResize.emit();
        });
    }

    ngOnInit() {
        this.timeline.onClickClip.subscribe(clip => {
            if(this.selectedItem && clip && this.selectedItem.ClipId == clip.ClipId) {
                this.selectedItem = null;
            }
            else {
                this.selectedItem = clip;
            }
            if(!this.selectedItem) {
                this.onClickClip.emit();
                return;
            }


            let inTC = new TMDTimecode({
                type: "frames",
                timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
                frames: clip.RealFrame
            }).toString();
            let outTc = new TMDTimecode({
                type: "frames",
                timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
                frames: clip.RealFrame + clip.Length
            }).toString();
            this.onClickClip.emit({
                inTC: inTC,
                id: clip.ClipId,
                outTc: outTc,
                mediaId: clip.MediaId
            });
        });

        this.timeline.onDragClip.subscribe(dragData => {
            if(dragData.newFrame == dragData.oldData.TimelineStartFrame) {
                return;
            }
            let groupIndex = -1;
            this.timelineConfig.Groups.forEach((g, idx)=>{
                if(g.Name == "Preview") {
                    groupIndex = idx;
                }
            });
            const oldIndex = this.timelineConfig.ClipsData.findIndex((val) => {
                return val.ClipId == dragData.oldData.ClipId;
            });
            let newIndex = -1;
            let movedLeft = false;
            if(dragData.newFrame < dragData.oldData.TimelineStartFrame) {
                movedLeft = true;
                for (let i = 0; i < oldIndex; i++) {
                    if(dragData.newFrame >= this.timelineConfig.ClipsData[i].TimelineStartFrame)
                        newIndex = i;
                    else
                        break;
                }
            }
            else {
                if(dragData.newFrame >= this.timelineConfig.Length)
                    newIndex = this.timelineConfig.ClipsData.length;
                else
                    for (let i = this.timelineConfig.ClipsData.length - 1; i > oldIndex; i--) {
                        if(dragData.newFrame >= this.timelineConfig.ClipsData[i].TimelineStartFrame)
                            break;
                        newIndex = i;
                    }
            }
            this.clipImages.splice(newIndex, 0, this.clipImages[oldIndex]);
            this.clipImages.splice(movedLeft ? oldIndex + 1 : oldIndex, 1);

            this.timeline.getMergedBase64Image(this.clipImages, 106, 60, (resultImage) => {
                this.timelineConfig.ClipsData.splice(newIndex, 0, dragData.oldData);
                this.timelineConfig.ClipsData.splice(movedLeft ? oldIndex + 1 : oldIndex, 1);

                this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes = [];

                let startFrame = 0;
                for (let i = 0; i < this.timelineConfig.ClipsData.length; i++) {
                    this.timelineConfig.ClipsData[i].TimelineStartFrame = startFrame;
                    startFrame += this.timelineConfig.ClipsData[i].Length;
                    this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.push(this.timelineConfig.ClipsData[i].TimelineStartFrame);
                }
                this.resetTimecodesMap(groupIndex);

                this.timelineConfig.Groups[groupIndex].Rows[0].Keys = resultImage;
                this.timeline.setVisible();
                this.timeline.setTimelineData(this.timelineConfig);
                this.onDragClip.emit(this.timelineConfig.ClipsData);

                setTimeout(() => {
                    this.timeline.Update(null, true, true);
                    this.timeline.cdr.detectChanges();
                });
            });
        });
    }

    public getTimelineData() {
        let clips = this.timelineConfig.ClipsData;
        return clips.map(clip => {
            return {
                in: TMDTimecode.fromFrames(clip.RealFrame, TimeCodeFormat[this.file["TimecodeFormat"]]).toString(),
                out: TMDTimecode.fromFrames(clip.RealFrame + clip.Length, TimeCodeFormat[this.file["TimecodeFormat"]]).toString(),
                id: clip.ClipId,
                mediaId: clip.MediaId,
                thumbnail:  this.clipImages[clip.ClipId]
            }
        })
    }

    public setCurrentFile(file){
        this.file = file;
    }

    public fillTimeline(file, items:Array<TimelineSerieItem>, readOnly: boolean) {
        this.file = file;
        this.readOnly = readOnly;
        this.fillTimelineData(file, items);
    }

    public loadComponentData() {
        this.timeline.loadComponentData();
    };

    public clipReplacedHandler(data) {
        let groupIndex = -1;
        this.timelineConfig.Groups.forEach((g, idx)=>{
            if(g.Name == "Preview") {
                groupIndex = idx;
            }
        });
        const clipindex = this.timelineConfig.ClipsData.findIndex((val) => {
            return val.ClipId == this.selectedItem.ClipId;
        });
        this.clipImages[clipindex] = data.newClip.startThumbnail ? data.newClip.startThumbnail : this.clipImages[clipindex];

        this.timeline.getMergedBase64Image(this.clipImages, 106, 60, (resultImage) => {
            let inF = new TMDTimecode({
                type: "string",
                timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
                timecodeString: data.newClip.startTimecodeString
            }).toFrames() - this.timelineConfig.From;
            let outF = new TMDTimecode({
                type: "string",
                timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
                timecodeString: data.newClip.stopTimecodeString
            }).toFrames() - this.timelineConfig.From;
            this.timelineConfig.ClipsData[clipindex].RealFrame = inF;
            this.timelineConfig.Length -= this.timelineConfig.ClipsData[clipindex].Length;
            this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes = [];
            for (let i = 0; i < this.timelineConfig.ClipsData.length; i++) {
                if(i > clipindex) {
                    this.timelineConfig.ClipsData[i].TimelineStartFrame -= this.timelineConfig.ClipsData[clipindex].Length;
                    this.timelineConfig.ClipsData[i].TimelineStartFrame += (outF - inF);
                }
                this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.push(this.timelineConfig.ClipsData[i].TimelineStartFrame);
            }
            this.resetTimecodesMap(groupIndex);
            this.timelineConfig.ClipsData[clipindex].Length = outF - inF;
            this.timelineConfig.Length += this.timelineConfig.ClipsData[clipindex].Length;

            this.finalizeClipUpdate(groupIndex, resultImage);
        });
    }

    private finalizeClipUpdate(groupIndex, resultImage) {
        this.timelineConfig.Groups[groupIndex].Rows[0].Keys = resultImage;
        this.timeline.setVisible();
        this.timeline.setTimelineData(this.timelineConfig);

        setTimeout(() => {
            this.timeline.Update(null, true, true);
            this.clearSelectedClip();
            this.timeline.cdr.detectChanges();
        });
    }

    public Update(timelineData?: any, force: boolean = false, updateVisibleRnge: boolean = true) {
        this.timeline.Update(timelineData, force, updateVisibleRnge);
    }

    public clipAddedHandler(data) {
        if(!this.timelineConfig)
            return;
        let inF = new TMDTimecode({
            type: "string",
            timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
            timecodeString: data.startTimecodeString
        }).toFrames() - this.timelineConfig.From;
        let outF = new TMDTimecode({
            type: "string",
            timecodeFormat: TimeCodeFormat[this.file["TimecodeFormat"]],
            timecodeString: data.stopTimecodeString
        }).toFrames() - this.timelineConfig.From;

        let groupIndex = -1;
        this.timelineConfig.Groups.forEach((g, idx)=>{
            if(g.Name == "Preview") {
                groupIndex = idx;
            }
        });
        if(this.timelineConfig.Length == 1 && (!this.timelineConfig.ClipsData || this.timelineConfig.ClipsData.length == 0))
            this.timelineConfig.Length = 0;

        this.clipImages.push(data.startThumbnail);
        this.timeline.getMergedBase64Image(this.clipImages, 106, 60, (resultImage) => {
            this.timelineConfig.ClipsData.push({
                ClipId: this.lastClipId.toString(),
                RealFrame: inF,
                Length: outF - inF,
                TimelineStartFrame: this.timelineConfig.Length,
                MediaId: this.file.ID
            });
            this.lastClipId++;
            this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.push(this.timelineConfig.Length);
            this.timelineConfig.Groups[groupIndex].Rows[0].Data.TimecodesMap[this.timelineConfig.Length] = {
                frame: this.timelineConfig.Length,
                index: this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.length - 1
            };
            this.timelineConfig.Length += outF - inF;
            this.finalizeClipUpdate(groupIndex, resultImage);
        });
    }
    public setReadOnlyMode(readOnly: boolean) {
        this.readOnly = readOnly;
        this.cdr.detectChanges();
    }

    public setSelectedClipById(id) {
        this.timeline.setSelectedClipById(id);
    }
    private fillTimelineData(file, items:Array<TimelineSerieItem>) {
        this.timelineConfig.Name = "Timeline";
        this.timelineConfig.From = 0;
        this.timelineConfig.Length = 0;
        this.timelineConfig.Framerate = TMDTimecode.getFrameRate(TimeCodeFormat[file["TimecodeFormat"]]).frameRate;
        this.timelineConfig.TimecodeFormat = file["TimecodeFormat"];
        this.timelineConfig.Groups = [];
        this.timelineConfig.ClipsData = [];

        if(!this.timelineConfig.Groups[0])
            this.timelineConfig.Groups.push({
                Name: "Preview",
                Expandable: true,
                Expanded: true,
                WithHeader: false,
                Rows: []
            });
        const timeCodes = [];
        for (let i = 0; i < items.length; i++)
        {
            let s = new TMDTimecode({
                type: "string",
                timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                timecodeString: items[i].startTimecode
            }).toFrames();
            let e = new TMDTimecode({
                type: "string",
                timecodeFormat: TimeCodeFormat[file["TimecodeFormat"]],
                timecodeString: items[i].endTimecode
            }).toFrames();
            timeCodes.push(this.timelineConfig.Length);
            if(items[i].thumbnail) {
                this.clipImages.push(items[i].thumbnail);
            }
            this.timelineConfig.ClipsData.push({
                ClipId: this.lastClipId.toString(),
                RealFrame: s,
                Length: e - s,
                TimelineStartFrame: this.timelineConfig.Length,
                MediaId: items[i].mediaId
            });
            this.lastClipId++;
            this.timelineConfig.Length += e - s;
        }
        this.timelineConfig.Groups[0].Rows[0] = {
            Name: "Preview",
            Type: IMFXProTimelineType.Image,
            Keys: "",
            Height: 60,
            Data: {
                CanvasImageHeight: 60,
                CanvasImageFrameWidth: 106,
                FrameDivider: 0,
                Collapsable: true,
                TimecodesMap: {},
                Timecodes: timeCodes,
            }
        };
        for (let j = 0; j < timeCodes.length; j++) {
            this.timelineConfig.Groups[0].Rows[this.timelineConfig.Groups[0].Rows.length - 1].Data.TimecodesMap[timeCodes[j]] = {
                frame: timeCodes[j],
                index: j
            };
        }

        this.timeline.getMergedBase64Image(this.clipImages, 106, 60, (resultImage) => {
            this.timelineConfig.Groups[0].Rows[0].Keys = resultImage;
            if(this.timelineConfig.Length == 0)
                this.timelineConfig.Length = 1;
            this.timeline.setVisible();
            this.timeline.setTimelineData(this.timelineConfig);

            setTimeout(() => {
                if (this.timeline instanceof IMFXProTimelineComponent)
                    this.timeline.Update();
            });
        });
    }

    private clearSelectedClip() {
        this.selectedItem = null;
        this.timeline.clearSelectedClip();
    }

    private removeClip() {
        let groupIndex = -1;
        this.timelineConfig.Groups.forEach((g, idx)=>{
            if(g.Name == "Preview") {
                groupIndex = idx;
            }
        });
        const clipindex = this.timelineConfig.ClipsData.findIndex((val) => {
            return val.ClipId == this.selectedItem.ClipId;
        });
        this.clipImages.splice(clipindex, 1);
        this.timeline.getMergedBase64Image(this.clipImages, 106, 60, (resultImage) => {
            this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes = [];
            for (let i = 0; i < this.timelineConfig.ClipsData.length; i++) {
                if(i >= clipindex) {
                    this.timelineConfig.ClipsData[i].TimelineStartFrame -= this.selectedItem.Length;
                }
                this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.push(this.timelineConfig.ClipsData[i].TimelineStartFrame);
            }
            this.timelineConfig.ClipsData.splice(clipindex, 1);
            this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.splice(clipindex, 1);
            this.resetTimecodesMap(groupIndex);
            this.timelineConfig.Length -= this.selectedItem.Length;
            if(this.timelineConfig.Length <= 0)
                this.timelineConfig.Length = 1;
            this.timelineConfig.Groups[groupIndex].Rows[0].Keys = resultImage;
            this.timeline.setVisible();
            this.timeline.setTimelineData(this.timelineConfig);

            this.onClipRemoved.emit(this.selectedItem);
            this.selectedItem = null;
            setTimeout(() => {
                this.timeline.Update(null, true, true);
                this.clearSelectedClip();
                this.timeline.cdr.detectChanges();
            });
        });
    }

    private resetTimecodesMap(groupIndex) {
        this.timelineConfig.Groups[0].Rows[0].Data.TimecodesMap = {};
        for (let j = 0; j < this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes.length; j++) {
            this.timelineConfig.Groups[0].Rows[0].Data.TimecodesMap[this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes[j]] = {
                frame: this.timelineConfig.Groups[groupIndex].Rows[0].Data.Timecodes[j],
                index: j
            };
        }
    }

    private addClip() {
        this.onButtonPressed.emit(false);
    }
    private replaceClip() {
        this.onButtonPressed.emit(true);
    }
    private disableReplaceBnt(){
        return !this.selectedItem;
    }
}
