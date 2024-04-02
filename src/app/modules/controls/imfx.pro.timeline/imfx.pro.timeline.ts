import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";

import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";
import {NotificationService} from "../../notification/services/notification.service";
import {IMFXProTimeline, IMFXProTimelineRow, IMFXProTimelineType} from "./models/imfx.pro.timeline.model";
import {Subject} from 'rxjs';
import {TimelineBaseComponent} from "../../../utils/TimelineBaseComponent";

declare let window: any;

@Component({
    selector: 'imfx-pro-timeline',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})

export class IMFXProTimelineComponent extends TimelineBaseComponent implements OnInit {
    public timelineType: string = 'IMFXProTimeline';
    public onResize: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClickFrame: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDragCurrentTime: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDragClip: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClickClip: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRowHeaderClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() onTimelineItemMoved: EventEmitter<any> = new EventEmitter<any>();
    @Output() onGroupGearButtonClicked: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('currentTime', {static: false}) currentTimeLine: ElementRef;
    @ViewChild('dragItemLine', {static: false}) dragItemLine: ElementRef;
    @ViewChild('zoomSliderWrapper', {static: false}) zoomSliderWrapper: ElementRef;
    @ViewChild('zoomSlider', {static: false}) zoomSlider: ElementRef;
    @ViewChild('currentTimeNumbersWrapper', {static: false}) currentTimeNumbersWrapper: ElementRef;
    @ViewChild('timeRowCanvas', {static: false}) timeRowCanvas: ElementRef;
    @ViewChild('timeRowCanvasBuffer', {static: false}) timeRowCanvasBuffer: ElementRef;
    @ViewChild('rowsWrapper', {static: false}) rowsWrapper: ElementRef;
    @ViewChild('scrollableArea', {static: false}) scrollableArea: ElementRef;
    @ViewChild('timelineScrollWrapper', {static: false}) timelineScrollWrapper: ElementRef;
    @ViewChild('timelineScroll', {static: false}) timelineScroll: ElementRef;
    @ViewChild('clipBoxView', {static: false}) clipBoxView: ElementRef;

    @ViewChildren('timelineRow') canvasesArray: QueryList<ElementRef>;
    @ViewChildren('timelineRowBuffer') canvasesArrayBuffer: QueryList<ElementRef>;
    @ViewChildren('imageSources') imageSourcesArray: QueryList<ElementRef>;

    private timeDragActive: boolean = false;
    private sliderDragActive: boolean = false;
    private zoomDragActive: boolean = false;
    private clipDragActive: boolean = false;
    private clipClickActive: boolean = false;
    private clipDragMarkerShow: boolean = false;
    private itemDragActive: boolean = false;
    private itemDragMarkerShow: boolean = false;
    private timeWrapperOffset;
    private timeWrapperWidth;
    private zoomSliderWrapperOffset;
    private zoomSliderWrapperWidth;
    private sliderDragRelativePos;
    private sliderDragOuterWidth;
    private initialSliderWidth;
    private sliderZoomRelativePos;
    private sliderZoomSide: 'L' | 'R';
    private zoomDragInitialPos;
    private currentVisibleRange = {
        From: 0,
        To: 0,
        Max: 0
    };
    private currentFrame = 0;
    private hoveredKey = null;
    private hoveredTimeKey = null;
    private groupsLabelWidth = 200;
    private canvasHeight = 20;
    private canvasHeightTime = 32;
    private loading = true;
    private destroyed$: Subject<any> = new Subject();
    private wrongRange = false;
    private BufferData = {
        From: 0,
        To: 0
    };
    private isZoom = false;
    private isVisibleTab = false;
    private dataUpdated = false;
    private timelineData: IMFXProTimeline;
    private currentDragCanvas = null;
    private currentItemInDrag = null;
    private currentClipInDrag = null;
    private selectedClip = null;
    private changeFrameTimeout;
    private changeFrameTimeoutActive = false;
    private relativeClipDragOffset = 0;
    private newClipFrame = -1;
    private currentDragFrame = null;
    private preventClickEvent = false;

    constructor(protected notificationRef: NotificationService,
                public cdr: ChangeDetectorRef) {
        super();
        this.onResize.subscribe(() => {
            if (!this.wrongRange && this.currentTimeNumbersWrapper) {
                new Promise((r1) => {
                    r1();
                }).then(() => {
                    this.cdr.detectChanges();
                    new Promise((r2) => {
                        r2();
                    }).then(() => {
                        this.isZoom = true;
                        this.onScrollRows({deltaY: 1});
                        this.onScrollRows({deltaY: -1});
                        this.isZoom = false;
                    });
                });
            }
        });
    }

    ngOnInit() {
        window["timeline"] = this;
        if (this.timelineData)
            this.Update(null, true, true);
    }

    setTimelineData(data) {
        this.timelineData = data;

        /*//TODO TEST DATA
        if(!this.timelineData.ClipsData) {
            this.timelineData.Groups[0] = {
                Expandable: false,
                Expanded: true,
                Name: "Preview",
                WithHeader: false,
                Rows: [
                    {
                        Type: IMFXProTimelineType.Image,
                        Height: 60,
                        Name: "Preview",
                        Keys: "",
                        Data: {
                            CanvasImageHeight: 60,
                            CanvasImageFrameWidth: 106,
                            FrameDivider: 0,
                            Collapsable: false
                        }
                    }
                ]
            };
            let timeCodes = [];
            this.timelineData.Groups[0].Rows[0].Data.TimecodesMap = {};

            let clipLength = this.timelineData.Length / 10;
            this.timelineData.ClipsData = [];

            for (let i = 0; i < 10; i++) {
                let startFrame = clipLength * i;
                let length = clipLength;

                this.timelineData.ClipsData.push({
                    ClipId: i.toString(),
                    TimelineStartFrame: startFrame,
                    RealFrame: startFrame,
                    Length: length
                });
                timeCodes.push(startFrame);
                this.timelineData.Groups[0].Rows[0].Data.TimecodesMap[timeCodes[timeCodes.length - 1]] = {
                    frame: timeCodes[timeCodes.length - 1],
                    index: timeCodes.length - 1
                };
            }

            this.getMergedBase64Image(fakeImages, 106, 60, (src)=>{
                this.timelineData.Groups[0].Rows[0].Keys = src;
                this.Update(null, true, true);
            });
            this.timelineData.Groups[0].Rows[0].Data.Timecodes = timeCodes;
        }*/

        this.dataUpdated = true;
    }

    public clearSelectedClip() {
        this.selectedClip = null;
    }

    public getMergedBase64Image(base64imagesSrc: Array<string>, width: number, height: number, callback) {
        let imagesObj = [];
        const canvas = document.createElement("canvas");
        let counter = 0;
        canvas.width = width * base64imagesSrc.length;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (base64imagesSrc.length == 0) {
            callback("");
        }
        for (let i = 0; i < base64imagesSrc.length; i++) {
            const image = new Image();
            imagesObj.push(image);
            image.onload = () => {
                counter++;
                if (counter == imagesObj.length) {
                    for (let j = 0; j < base64imagesSrc.length; j++) {
                        ctx.drawImage(imagesObj[j], 0, 0, imagesObj[j].width, imagesObj[j].height, j * width, 0, width, height);
                    }
                    callback(canvas.toDataURL("image/png"));
                }
            };
            image.src = base64imagesSrc[i];
        }
    }

    public loadComponentData() {
        this.isVisibleTab = true;
        this.Update(null, true, true);
    };

    setVisible() {
        this.isVisibleTab = true;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.cdr.detach();
    }


    public Update(timelineData?: any, force: boolean = false, updateVisibleRnge: boolean = true) {
        this.loading = true;
        if (timelineData) {
            this.timelineData = timelineData;
        }
        if (updateVisibleRnge) {
            this.updateVissibleFrames(this.currentVisibleRange.From);
            if (this.currentVisibleRange.From == this.currentVisibleRange.To) {
                this.wrongRange = true;
                this.loading = false;
                try {
                    this.cdr.detectChanges();
                } catch (e) {

                }
                return;
            } else {
                this.wrongRange = false;
                try {
                    this.cdr.detectChanges();
                } catch (e) {

                }
                if (force) {
                    this.resetZoom(true);
                    this.RedrawAllCanvases();
                }

            }
        }

        new Promise((r) => {
            r();
        }).then(() => {
            this.setZoom();
            this.RedrawAllCanvases(force);
        });
    }

    public SetTimelineTime(time) {
        if (this.wrongRange || !this.timelineData || this.cdr['destroyed'])
            return;
        if (!this.timeDragActive) {
            this.moveCurrentTimeTo(time - this.timelineData.From);
            this.cdr.detectChanges();
        }
    }

    public setSelectedClipById(id) {
        const clip = this.timelineData.ClipsData[id];
        this.currentClipInDrag = clip;
        this.selectedClip = clip;
        this.onClickClip.emit(this.selectedClip);
        this.cdr.detectChanges();
    }

    private moveCurrentTimeTo(time, withCenter = true, withEmit = false, withRedraw = true) {
        if (!this.currentTimeNumbersWrapper)
            return;
        const parsed = parseInt(time, 10);
        if (isNaN(parsed)) {
            time = 0;
        } else {
            time = parsed;
        }
        this.currentFrame = this.clamp(time, 0, this.timelineData.Length);
        const multiplier = this.currentTimeNumbersWrapper.nativeElement.clientWidth / (this.currentVisibleRange.To - this.currentVisibleRange.From);

        const half = Math.floor((this.currentVisibleRange.To - this.currentVisibleRange.From) / 2);

        if (withCenter && (this.currentFrame < this.currentVisibleRange.From + half || this.currentFrame > this.currentVisibleRange.From + half)) {
            const diff = this.currentVisibleRange.To - this.currentVisibleRange.From;

            const from = this.clamp(this.currentFrame - half, 0, this.timelineData.Length);
            const to = this.currentVisibleRange.From + diff;
            if (this.currentVisibleRange.From != from || this.currentVisibleRange.To != to) {
                this.currentVisibleRange.From = this.clamp(this.currentFrame - half, 0, this.timelineData.Length);
                this.currentVisibleRange.To = this.currentVisibleRange.From + diff;

                if (this.currentVisibleRange.To > this.timelineData.Length) {
                    this.currentVisibleRange.To = this.timelineData.Length;
                    this.currentVisibleRange.From = this.currentVisibleRange.To - diff;
                }
                this.zoomSlider.nativeElement.style.left = this.currentTimeNumbersWrapper.nativeElement.clientWidth * (this.currentVisibleRange.From / this.timelineData.Length) + "px";
                if (withRedraw)
                    this.RedrawAllCanvases();
            }
            let x = this.clamp(Math.floor(multiplier * (this.currentFrame - this.currentVisibleRange.From)), 0, this.currentTimeNumbersWrapper.nativeElement.clientWidth);
            this.currentTimeLine.nativeElement.style.left = this.groupsLabelWidth + x + "px";
        } else {
            let x = this.clamp(Math.ceil(multiplier * (this.currentFrame - this.currentVisibleRange.From)), 0, this.currentTimeNumbersWrapper.nativeElement.clientWidth);
            this.currentTimeLine.nativeElement.style.left = this.groupsLabelWidth + x + "px";
        }
        if (withEmit) {
            this.onDragCurrentTime.emit(this.timelineData.From + this.currentFrame);
        }
    }

    private prevFrame(frame?) {
        if (frame === undefined)
            frame = this.currentFrame;
        this.moveCurrentTimeTo(this.clamp(frame - 1, 0, this.timelineData.Length), true, true);
    }

    private nextFrame(frame?) {
        if (frame === undefined)
            frame = this.currentFrame;
        this.moveCurrentTimeTo(this.clamp(frame + 1, 0, this.timelineData.Length), true, true);
    }

    private prevMarker(row) {
        let doLoop = true;
        row.Keys.slice().reverse().forEach((el) => {
            if (doLoop && el.Frame < this.currentFrame) {
                this.currentFrame = el.Frame;
                this.moveCurrentTimeTo(this.clamp(el.Frame, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
        });
    }

    private nextMarker(row) {
        let doLoop = true;
        row.Keys.slice().forEach((el) => {
            if (doLoop && el.Frame > this.currentFrame) {
                this.currentFrame = el.Frame;
                this.moveCurrentTimeTo(this.clamp(el.Frame, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
        });
    }

    private prevSilence(row) {
        let move = false;
        let prefFrameIsSilence = false;
        let fr = this.currentFrame;
        row.Keys.slice().forEach((el) => {
            if (el.Frame < this.currentFrame && el.Value == 0 && !prefFrameIsSilence) {
                move = true;
                fr = el.Frame;
            }
            prefFrameIsSilence = el.Value == 0;
        });
        if (move) {
            this.currentFrame = fr;
            this.moveCurrentTimeTo(this.clamp(fr, 0, this.timelineData.Length), true, true);
        }
    }

    private nextSilence(row) {
        let doLoop = true;
        let prefFrameIsSilence = false;
        row.Keys.slice().forEach((el) => {
            if (doLoop && el.Frame > this.currentFrame && el.Value == 0 && !prefFrameIsSilence) {
                this.currentFrame = el.Frame;
                this.moveCurrentTimeTo(this.clamp(el.Frame, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
            prefFrameIsSilence = el.Value == 0;
        });
    }

    private prevScene(row) {
        let doLoop = true;
        row.Data.Timecodes.slice().reverse().forEach((el) => {
            if (doLoop && el < this.currentFrame) {
                this.currentFrame = el;
                this.moveCurrentTimeTo(this.clamp(el, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
        });
    }

    private nextScene(row) {
        let doLoop = true;
        row.Data.Timecodes.slice().forEach((el) => {
            if (doLoop && el > this.currentFrame) {
                this.currentFrame = el;
                this.moveCurrentTimeTo(this.clamp(el, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
        });
    }

    private toggleCollapse(row) {
        row.Data.Collapsable = !row.Data.Collapsable;
        this.RedrawAllCanvases(true);
    }

    private updateVissibleFrames(From) {
        if (!!this.timelineData) {
            this.currentVisibleRange.Max = this.timelineData.Length;
            this.currentVisibleRange.From = From;
            this.currentVisibleRange.To = this.currentVisibleRange.From + this.currentVisibleRange.Max;
            this.wrongRange = false;
        } else {
            this.wrongRange = true;
        }
    }

    private startTimeDrag(e) {
        this.timeDragActive = true;
        this.timeWrapperOffset = $(this.currentTimeNumbersWrapper.nativeElement).offset();
        this.timeWrapperWidth = this.currentTimeNumbersWrapper.nativeElement.clientWidth;
    }

    private checkTimeDrag(e) {
        if (this.timeDragActive) {
            const multiplier = this.calcCurrentFrameAndMultiplier(e);
            if (!this.changeFrameTimeoutActive) {
                if (e.pageX - this.timeWrapperOffset.left <= 0) {
                    this.changeFrameTimeoutActive = true;
                    this.prevFrame();
                    this.changeFrameTimeout = setTimeout(() => {
                        clearTimeout(this.changeFrameTimeout);
                        this.changeFrameTimeoutActive = false;
                    }, 100);
                } else if (e.pageX - this.timeWrapperOffset.left >= this.timeWrapperWidth) {
                    this.changeFrameTimeoutActive = true;
                    this.nextFrame();
                    this.changeFrameTimeout = setTimeout(() => {
                        clearTimeout(this.changeFrameTimeout);
                        this.changeFrameTimeoutActive = false;
                    }, 100);
                }
            }

            const offset = (this.currentFrame - this.currentVisibleRange.From) * multiplier;
            this.currentTimeLine.nativeElement.style.left = this.groupsLabelWidth + offset + "px";
        }
    }

    private endTimeDrag(e) {
        if (this.timeDragActive) {
            this.onDragCurrentTime.emit(this.timelineData.From + this.currentFrame);
        }
        this.timeDragActive = false;
    }

    private startZoomDrag(e, side) {
        this.sliderZoomSide = side;
        if (this.sliderZoomSide == "L") {
            this.sliderZoomRelativePos = e.pageX - $(this.zoomSlider.nativeElement).offset().left;
            this.zoomDragInitialPos = e.pageX - $(this.zoomSliderWrapper.nativeElement).offset().left - this.sliderZoomRelativePos;
        } else {
            this.sliderZoomRelativePos = e.pageX - $(this.zoomSlider.nativeElement).offset().left;
            this.zoomDragInitialPos = e.pageX - $(this.zoomSliderWrapper.nativeElement).offset().left - this.sliderZoomRelativePos;
        }
        this.initialSliderWidth = $(this.zoomSlider.nativeElement).outerWidth();
        this.zoomDragActive = true;
        this.zoomSliderWrapperOffset = $(this.zoomSliderWrapper.nativeElement).offset();
        this.zoomSliderWrapperWidth = this.zoomSliderWrapper.nativeElement.clientWidth;
    }

    private startSliderDrag(e) {
        this.sliderDragActive = true;
        this.zoomSliderWrapperOffset = $(this.zoomSliderWrapper.nativeElement).offset();
        this.sliderDragRelativePos = e.pageX - $(this.zoomSlider.nativeElement).offset().left;
        this.sliderDragOuterWidth = $(this.zoomSlider.nativeElement).outerWidth();
        this.zoomSliderWrapperWidth = this.zoomSliderWrapper.nativeElement.clientWidth;
    }

    private checkSliderOrZoomDrag(e) {
        if (this.zoomDragActive) {
            if (this.sliderZoomSide == "L") {
                let x = this.clamp(e.pageX - this.zoomSliderWrapperOffset.left - this.sliderZoomRelativePos, 0, this.zoomDragInitialPos + this.initialSliderWidth - 30); // + $(this.zoomSlider.nativeElement).outerWidth() - 10
                const diff = this.zoomDragInitialPos - x;
                this.zoomSlider.nativeElement.style.left = x + "px";
                this.zoomSlider.nativeElement.style.width = this.initialSliderWidth + diff + "px";
            }
            if (this.sliderZoomSide == "R") {
                let x = this.clamp(e.pageX - this.zoomSliderWrapperOffset.left, 0,
                    this.zoomSliderWrapperWidth);
                const offset = this.zoomSlider.nativeElement.offsetLeft;
                let width = x - offset;
                width = this.clamp(width, 30, this.zoomSliderWrapperWidth);
                this.zoomSlider.nativeElement.style.width = width + "px";
            }
        }
        if (this.sliderDragActive) {
            let x = this.clamp(e.pageX - this.zoomSliderWrapperOffset.left - this.sliderDragRelativePos, 0, this.zoomSliderWrapperWidth - this.sliderDragOuterWidth);
            this.zoomSlider.nativeElement.style.left = x + "px";
        }
        if (this.zoomDragActive || this.sliderDragActive) {
            this.setZoom();
            if (this.zoomDragActive) {
                this.RedrawAllCanvases(true);
            } else {
                this.RedrawAllCanvases(false);
            }
        }
    }

    private endSliderOrZoomDrag(e) {
        this.zoomDragActive = false;
        this.sliderDragActive = false;
    }

    private resetZoom(withRedraw = false) {
        if (this.currentTimeNumbersWrapper) {
            this.currentVisibleRange.Max = Math.min(this.currentTimeNumbersWrapper.nativeElement.clientWidth, this.timelineData.Length);

            this.zoomSlider.nativeElement.style.left = "0px";
            $(this.zoomSlider.nativeElement).outerWidth(this.currentTimeNumbersWrapper.nativeElement.clientWidth);
            setTimeout(() => {
                this.zoomSlider.nativeElement.style.left = "0px";
                $(this.zoomSlider.nativeElement).outerWidth(this.currentTimeNumbersWrapper.nativeElement.clientWidth);
            });

            this.currentVisibleRange.From = 0;
            this.currentVisibleRange.To = this.timelineData.Length;

            if (this.currentFrame < this.currentVisibleRange.From) {
                this.moveCurrentTimeTo(this.currentVisibleRange.From, false, false, withRedraw);
            } else if (this.currentFrame > this.currentVisibleRange.To) {
                this.moveCurrentTimeTo(this.currentVisibleRange.To, false, false, withRedraw);
            } else {
                this.moveCurrentTimeTo(this.currentFrame, false, false, withRedraw);
            }
        }
    }

    private setZoom() {
        if (this.currentTimeNumbersWrapper && this.timelineData) {
            this.currentVisibleRange.Max = Math.min(this.currentTimeNumbersWrapper.nativeElement.clientWidth, this.timelineData.Length);
            const left = this.zoomSlider.nativeElement.offsetLeft / this.currentTimeNumbersWrapper.nativeElement.clientWidth;
            const width = ($(this.zoomSlider.nativeElement).outerWidth() + 1) / this.currentTimeNumbersWrapper.nativeElement.clientWidth;
            this.currentVisibleRange.From = Math.floor(left * this.timelineData.Length);
            this.currentVisibleRange.To = this.clamp(Math.ceil(left * this.timelineData.Length + width * this.timelineData.Length), 0, this.timelineData.Length);

            if (this.currentFrame < this.currentVisibleRange.From) {
                this.moveCurrentTimeTo(this.currentVisibleRange.From, false, false, false);
            } else if (this.currentFrame > this.currentVisibleRange.To) {
                this.moveCurrentTimeTo(this.currentVisibleRange.To, false, false, false);
            } else {
                this.moveCurrentTimeTo(this.currentFrame, false, false, false);
            }
        }
    }

    private gearClick(group) {
        this.onGroupGearButtonClicked.emit(group);
    }

    private toggleGroup(group) {
        group.Expanded = !group.Expanded;
        this.cdr.detectChanges();
        this.RedrawAllCanvases();
    }

    private onImageLoad(rowIndex) {
        $('#imageLoader' + rowIndex).hide();
        this.RedrawAllCanvases(true);
    }

    private CopyDataTime() {
        if (this.timeRowCanvas.nativeElement.height > 0 && this.timeRowCanvasBuffer.nativeElement.height > 0 && this.timeRowCanvas.nativeElement.width > 0 && this.timeRowCanvasBuffer.nativeElement.width > 0) {
            const destCtx = this.timeRowCanvas.nativeElement.getContext('2d');
            const diffDraw = (this.currentVisibleRange.To - this.currentVisibleRange.From) / this.timeRowCanvas.nativeElement.width;
            const start = (this.currentVisibleRange.From - this.BufferData.From) / diffDraw;
            destCtx.clearRect(0, 0, this.timeRowCanvas.nativeElement.width, this.timeRowCanvas.nativeElement.height);
            destCtx.drawImage(this.timeRowCanvasBuffer.nativeElement, Math.floor(start), 0, this.timeRowCanvas.nativeElement.width, this.timeRowCanvas.nativeElement.height, 0, 0, this.timeRowCanvas.nativeElement.width, this.timeRowCanvas.nativeElement.height);
        } else {
            this.BufferData.From = 0;
            this.BufferData.To = 0;
        }
    }

    private CopyData(sourceCanvas, destinationCanvas) {
        if (destinationCanvas.height > 0 && sourceCanvas.height > 0 && destinationCanvas.width > 0 && sourceCanvas.width > 0) {
            const destCtx = destinationCanvas.getContext('2d');
            const diffDraw = (this.currentVisibleRange.To - this.currentVisibleRange.From) / destinationCanvas.width;
            const start = (this.currentVisibleRange.From - this.BufferData.From) / diffDraw;
            destCtx.clearRect(0, 0, destinationCanvas.width, destinationCanvas.height);
            destCtx.drawImage(sourceCanvas, Math.floor(start), 0, destinationCanvas.width, destinationCanvas.height, 0, 0, destinationCanvas.width, destinationCanvas.height);
        } else {
            this.BufferData.From = 0;
            this.BufferData.To = 0;
        }
    }

    private RedrawAllCanvases(force = false) {
        if (!this.timeRowCanvas || !this.isVisibleTab) {
            return;
        }

        if (this.currentVisibleRange.From >= this.BufferData.From && this.currentVisibleRange.To < this.BufferData.To && !force) {
            const canvasesSource = this.canvasesArrayBuffer.toArray();
            let canvasesDestination = this.canvasesArray.toArray();
            for (let i = 0; i < canvasesSource.length; i++) {
                if (canvasesSource[i].nativeElement.height > 0)
                    this.CopyData(canvasesSource[i].nativeElement, canvasesDestination[i].nativeElement);
            }
            this.CopyDataTime();
        } else {
            this.BufferData.From = this.currentVisibleRange.From;
            this.BufferData.To = this.clamp(this.BufferData.From + ((this.currentVisibleRange.To - this.currentVisibleRange.From) * 2), 0, this.timelineData.Length);

            const canvases = this.canvasesArrayBuffer.toArray();
            let canvasesDestination = this.canvasesArray.toArray();
            this.redrawTimeCanvas(this.timeRowCanvasBuffer.nativeElement, this.BufferData.From, this.BufferData.To);
            this.redrawOtherCanvases(canvases, canvasesDestination);

            for (let i = 0; i < canvases.length; i++) {
                if (canvases[i].nativeElement.height > 0)
                    this.CopyData(canvases[i].nativeElement, canvasesDestination[i].nativeElement);
            }
            this.CopyDataTime();

            new Promise((r) => {
                r();
            }).then(() => {
                this.updateScroll();
            });
        }
        this.loading = false;
    }

    private processGroups(totalData) {
        for (let i = 0; i < this.timelineData.Groups.length; i++) {
            const group = this.timelineData.Groups[i];
            //if (group.Expanded) //TODO rethink this part for excluding collapsed groups with correct redraw on expand
            {
                for (let j = 0; j < group.Rows.length; j++) {
                    const row = group.Rows[j];
                    if (this.isCanvasType(row.Type) && totalData.index + 1 < totalData.canvases.length) {
                        totalData.index++;

                        totalData.rows[totalData.index] = row;
                        totalData.ctxs[totalData.index] = totalData.canvases[totalData.index].nativeElement.getContext('2d');

                        const tmp = totalData.canvasesDestination[totalData.index].nativeElement.getContext('2d');
                        tmp.webkitImageSmoothingEnabled = false;
                        tmp.mozImageSmoothingEnabled = false;
                        tmp.ImageSmoothingEnabled = false;

                        totalData.canvasesDestination[totalData.index].nativeElement.width = $(totalData.canvasesDestination[totalData.index].nativeElement).outerWidth();
                        totalData.canvases[totalData.index].nativeElement.width = $(totalData.canvasesDestination[totalData.index].nativeElement).outerWidth() * 2;

                        if (row.Type == IMFXProTimelineType.Image) {
                            totalData.imageIndex++;
                            totalData.srcImagess[totalData.index] = totalData.sourceImages[totalData.imageIndex].nativeElement;
                            totalData.canvases[totalData.index].nativeElement.height = row.Data.CanvasImageHeight;
                            totalData.canvasesDestination[totalData.index].nativeElement.height = row.Data.CanvasImageHeight;
                            if (!row.Keys) {
                                $('#imageLoader' + j + "-" + i).hide();
                            }
                        } else if (row.Type == IMFXProTimelineType.Waveform) {
                            totalData.canvases[totalData.index].nativeElement.height = row.Data.ScaleMax;
                            totalData.canvasesDestination[totalData.index].nativeElement.height = row.Data.ScaleMax;
                        } else if (row.Type == IMFXProTimelineType.Marker && row.Height !== undefined) {
                            totalData.canvases[totalData.index].nativeElement.height = row.Height;
                            totalData.canvasesDestination[totalData.index].nativeElement.height = row.Height;
                        } else {
                            totalData.canvases[totalData.index].nativeElement.height = this.canvasHeight;
                            totalData.canvasesDestination[totalData.index].nativeElement.height = this.canvasHeight;
                        }
                        totalData.width = totalData.canvasesDestination[totalData.index].nativeElement.width;
                        totalData.ctxs[totalData.index].webkitImageSmoothingEnabled = false;
                        totalData.ctxs[totalData.index].mozImageSmoothingEnabled = false;
                        totalData.ctxs[totalData.index].ImageSmoothingEnabled = false;
                        if (row.Type != IMFXProTimelineType.Image) {
                            totalData.leftKeys[totalData.index] = row.Keys.filter((val) => {
                                return val.Frame <= this.BufferData.From && val.Frame + val.Length >= this.BufferData.From;
                            });
                            totalData.leftKeys[totalData.index] = totalData.leftKeys[totalData.index].length > 0 ? totalData.leftKeys[totalData.index][0] : null;
                            if (row.Type == IMFXProTimelineType.Marker) {
                                totalData.ctxs[totalData.index].fillStyle = '#2A8CEA';
                            }
                        }
                    }
                }
            }
        }
    }

    private PERFORMANCE_BAD_PART(key, f, value, rows, x, diffDraw, ctxs, srcImagess, leftKeys) {
        const lastFilledWave = [];
        const lastFilledScene = [];
        let k = this.BufferData.From;
        const lenKeys: number = this.BufferData.To;
        for (; k <= lenKeys; k++) {
            let i = 0;
            const lenRows: number = rows.length;
            for (; i < lenRows; i++) {
                if (rows[i].Type != IMFXProTimelineType.Image && (rows[i].Keys[k] || leftKeys[i] && leftKeys[i].Frame <= k && leftKeys[i].Frame + leftKeys[i].Length >= k)) {
                    key = rows[i].Keys[k] ? rows[i].Keys[k] : leftKeys[i];
                    f = key.Frame;
                    value = key.Value;

                    if (rows[i].Type == IMFXProTimelineType.Waveform) {
                        let len = rows[i].Keys[k] ? key.Length : leftKeys[i].Length - (k - leftKeys[i].Frame);
                        const xPos = Math.floor(x / diffDraw);
                        const xLen = Math.ceil(Math.max(1, len / diffDraw));
                        if (lastFilledWave[i] && lastFilledWave[i].xPos == xPos && lastFilledWave[i].value >= value && value != 0)
                            continue;
                        if (value > 0) {
                            if (value > 35) {
                                ctxs[i].fillStyle = '#C63636';
                                ctxs[i].fillRect(xPos, (rows[i].Data.ScaleMax - value), xLen, value - 35);
                            }
                            if (value > 30) {
                                ctxs[i].fillStyle = '#EDA800';
                                ctxs[i].fillRect(xPos, (rows[i].Data.ScaleMax - Math.min(value, 35)), xLen, Math.min(value, 35) - 30);
                            }
                            if (value > 10) {
                                ctxs[i].fillStyle = '#8CBF45';
                                ctxs[i].fillRect(xPos, (rows[i].Data.ScaleMax - Math.min(value, 30)), xLen, Math.min(value, 30) - 10);
                            }

                            ctxs[i].fillStyle = '#668d37';
                            ctxs[i].fillRect(xPos, (rows[i].Data.ScaleMax - Math.min(value, 10)), xLen, Math.min(value, 10));
                        } else {
                            ctxs[i].fillStyle = '#888888';
                            ctxs[i].fillRect(xPos, 0, xLen, rows[i].Data.ScaleMax);
                        }
                        //lastFilledWave[i] = Math.floor(x / diffDraw) + Math.ceil(Math.max(1, len / diffDraw)) - 1;
                        lastFilledWave[i] = {
                            xPos: xPos,
                            xLen: xLen,
                            value: value
                        };
                    } else if (rows[i].Type == IMFXProTimelineType.Marker) {
                        let len = rows[i].Keys[k] ? key.Length : leftKeys[i].Length - (k - leftKeys[i].Frame);
                        if (value > 0) {
                            ctxs[i].fillRect(Math.floor(x / diffDraw), 0, Math.floor(Math.max(1, len / diffDraw)), rows[i].Height !== undefined ? rows[i].Height : this.canvasHeight);
                        }
                    }
                } else if (rows[i].Type == IMFXProTimelineType.Image) {
                    if (rows[i].Data.Timecodes) {
                        let key = rows[i].Data.TimecodesMap[k] ? rows[i].Data.TimecodesMap[k] : null;
                        if (key) {
                            const verticalOffset = Math.floor(key.index / 1000);
                            const srcX = key.index % 1000;
                            let posX = Math.floor(x / diffDraw);
                            if (lastFilledScene[i] == posX)
                                continue;

                            let nextKeyIndex = rows[i].Data.TimecodesMap[k].index + 1;
                            let nextTimecode = rows[i].Data.Timecodes[nextKeyIndex];
                            let w = rows[i].Data.CanvasImageFrameWidth;
                            if (nextTimecode) {
                                let nextX = Math.floor(nextTimecode / diffDraw);
                                if (nextX == posX)
                                    continue;
                                w = Math.min(nextX - posX, rows[i].Data.CanvasImageFrameWidth);
                            }

                            if (k == this.BufferData.From) {
                                if (k >= key.frame && k <= key.frame + (rows[i].Data.CanvasImageFrameWidth * Math.max(1, Math.ceil(diffDraw)))) {
                                    posX = Math.floor((x - (k - key.frame)) / diffDraw);
                                    if (srcImagess[i].complete)
                                        ctxs[i].drawImage(srcImagess[i], srcX * rows[i].Data.CanvasImageFrameWidth, verticalOffset * rows[i].Data.CanvasImageHeight, w, rows[i].Data.CanvasImageHeight, posX, 0, w, rows[i].Data.CanvasImageHeight);
                                }
                            } else {
                                if (srcImagess[i].complete)
                                    ctxs[i].drawImage(srcImagess[i], srcX * rows[i].Data.CanvasImageFrameWidth, verticalOffset * rows[i].Data.CanvasImageHeight, w, rows[i].Data.CanvasImageHeight, posX, 0, w, rows[i].Data.CanvasImageHeight);
                            }
                            lastFilledScene[i] = posX;
                        }
                    } else {
                        if ((k % rows[i].Data.FrameDivider == 0 && rows[i].Data || k == this.BufferData.From) && !rows[i].Data.Collapsable) {
                            let frameStart = Math.floor(k / rows[i].Data.FrameDivider) * rows[i].Data.CanvasImageFrameWidth;
                            let canvasPos = Math.floor(x / diffDraw);
                            if (k == this.BufferData.From) {
                                let leftImg = this.BufferData.From - (this.BufferData.From % rows[i].Data.FrameDivider);
                                frameStart = Math.floor(leftImg / rows[i].Data.FrameDivider) * rows[i].Data.CanvasImageFrameWidth;
                                canvasPos = Math.floor(x - (k - leftImg) / diffDraw);
                            }
                            if (srcImagess[i].complete)
                                ctxs[i].drawImage(srcImagess[i], frameStart, 0, rows[i].Data.CanvasImageFrameWidth, rows[i].Data.CanvasImageHeight, canvasPos, 0, rows[i].Data.CanvasImageFrameWidth, rows[i].Data.CanvasImageHeight);
                        } else {
                            const divider = rows[i].Data.FrameDivider / diffDraw >= rows[i].Data.CanvasImageFrameWidth ?
                                (rows[i].Data.FrameDivider * Math.max(1, Math.ceil(diffDraw))) :
                                (rows[i].Data.CanvasImageFrameWidth * Math.max(1, Math.ceil(diffDraw)));
                            if ((k % divider == 0 ||
                                k == this.BufferData.From) &&
                                (rows[i].Data && rows[i].Data.Collapsable || !rows[i].Data)) {

                                let frameStart = Math.floor(k / rows[i].Data.FrameDivider) * rows[i].Data.CanvasImageFrameWidth;
                                let canvasPos = Math.floor(x / diffDraw);

                                if (k == this.BufferData.From) {
                                    let leftImg = this.BufferData.From - (this.BufferData.From % divider);
                                    frameStart = Math.floor(leftImg / rows[i].Data.FrameDivider) * rows[i].Data.CanvasImageFrameWidth;
                                    canvasPos = Math.floor(x - (k - leftImg) / diffDraw);
                                }
                                if (srcImagess[i].complete)
                                    ctxs[i].drawImage(srcImagess[i], frameStart, 0, rows[i].Data.CanvasImageFrameWidth, rows[i].Data.CanvasImageHeight, canvasPos, 0, rows[i].Data.CanvasImageFrameWidth, rows[i].Data.CanvasImageHeight);
                            }
                        }
                    }
                }
            }
            x++;
        }
        return;
    }

    private getFillerWidth(item) {
        return this.clamp(<number>this.getClipWidth(item, false) - this.timelineData.Groups[0].Rows[0].Data.CanvasImageFrameWidth - 1, 0, Number.MAX_SAFE_INTEGER) + "px";
    }

    private roundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (let side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }

    private redrawOtherCanvases(canvases, canvasesDestination) {
        const totalData = {
            sourceImages: this.imageSourcesArray.toArray(),
            index: -1,
            imageIndex: -1,
            ctxs: [],
            srcImagess: [],
            rows: [],
            leftKeys: [],
            width: 0,
            canvases: canvases,
            canvasesDestination: canvasesDestination
        };
        this.processGroups(totalData);
        const x = 0;
        const key = null;//row.Keys[k] ? row.Keys[k] : leftKey;
        const f = 0;//key.Frame;
        const value = 0;//key.Value;
        const diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / totalData.width;

        this.PERFORMANCE_BAD_PART(key, f, value, totalData.rows, x, diffDraw, totalData.ctxs, totalData.srcImagess, totalData.leftKeys);
        this.cdr.detectChanges();
    }

    private redrawCanvas(canvas, row, from, to, hoverFrame = undefined, srcImage = undefined) {
        if (!row)
            return;
        const diffDraw = (Math.abs(from - to)) / canvas.width;
        if (hoverFrame != undefined) {
            this.hoveredKey = null;
        }

        let leftKey;
        let x = 0;
        if (row.Type != IMFXProTimelineType.Image) {
            let leftKey = row.Keys.filter((val) => {
                return val.Frame <= from && val.Frame + val.Length >= from;
            });
            leftKey = leftKey.length > 0 ? leftKey[0] : null;
        }

        for (let k = from; k <= to; k++) {
            if (hoverFrame != undefined) {
                if (row.Type != IMFXProTimelineType.Image && (row.Keys[k] || leftKey && leftKey.Frame <= k && leftKey.Frame + leftKey.Length >= k)) {
                    const key = row.Keys[k] ? row.Keys[k] : leftKey;
                    const f = key.Frame;
                    const value = key.Value;
                    if ((row.Type == IMFXProTimelineType.Marker && value > 0 || row.Type == IMFXProTimelineType.Waveform) && f <= from + Math.floor(hoverFrame.x * diffDraw) && f + key.Length > from + Math.floor(hoverFrame.x * diffDraw)) {
                        this.hoveredKey = key;
                        this.hoveredKey.Type = row.Type;
                        this.cdr.detectChanges();
                    }
                }
            }
            x++;
        }

        this.updateScroll();
    }

    private sendClickedFrame(e, row) {
        if (this.preventClickEvent) {
            this.preventClickEvent = false;
            return;
        }
        if (row.Type == IMFXProTimelineType.Image) {
            let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / e.target.width;
            let frame = this.timelineData.From + this.currentVisibleRange.From + Math.floor(this.getMousePosInCanvas(e.target, e).x * diffDraw) - this.timelineData.From;

            if (row.Data.Timecodes) {
                const move = false;
                for (let i = row.Data.Timecodes.length - 1; i >= 0; i--) {
                    if (frame >= row.Data.Timecodes[i] && frame <= row.Data.Timecodes[i] + row.Data.CanvasImageFrameWidth * diffDraw) {
                        frame = row.Data.Timecodes[i];
                        this.moveCurrentTimeTo(frame, false, true);
                        break;
                    }
                }
            } else {
                const startFrame = Math.floor(frame / row.Data.FrameDivider) * row.Data.FrameDivider;
                if (frame >= startFrame && frame < startFrame + row.Data.CanvasImageFrameWidth * diffDraw) {
                    frame = Math.floor(frame / row.Data.FrameDivider) * row.Data.FrameDivider;
                    this.moveCurrentTimeTo(frame, false, true);
                }
            }
        } else {
            let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / e.target.width;
            const keyIndex = this.currentVisibleRange.From + Math.floor(this.getMousePosInCanvas(e.target, e).x * diffDraw);
            const targetKeys = row.Keys.filter((val) => {
                if ((row.Type == IMFXProTimelineType.Marker && val.Value > 0 || row.Type == IMFXProTimelineType.Waveform) && val.Frame <= keyIndex && val.Frame + val.Length > keyIndex) {
                    return true;
                }
                return false;
            });
            if (targetKeys.length > 0) {
                const result = Object.assign({}, targetKeys[0]);

                if (row.Type == IMFXProTimelineType.Waveform) {
                    this.moveCurrentTimeTo(result.Frame, false, true);
                } else {
                    result.Frame = this.timelineData.From + result.Frame;
                    this.onClickFrame.emit(result);
                }
            }
        }
    }

    private clearHoverOnCanvas(e, row, rowIndex = undefined) {
        if (!this.timeDragActive && !this.zoomDragActive && !this.sliderDragActive && !this.itemDragActive && !this.clipDragActive) {
            const canvas = e.target;
            this.hoveredKey = null;
            if (typeof rowIndex !== 'undefined') {
                rowIndex = $('#imageSources' + rowIndex)[0];
            }
            this.redrawCanvas(canvas, row, this.currentVisibleRange.From, this.currentVisibleRange.To, undefined, rowIndex);
        }
    }

    private checkHoverInCanvas(e, row, rowIndex = undefined) {
        if (!this.timeDragActive && !this.zoomDragActive && !this.sliderDragActive && !this.isZoom && !this.itemDragActive && !this.clipDragActive) {
            const canvas = e.target;
            if (typeof rowIndex !== 'undefined') {
                rowIndex = $('#imageSources' + rowIndex)[0];
            }
            this.redrawCanvas(canvas, row, this.currentVisibleRange.From, this.currentVisibleRange.To, this.getMousePosInCanvas(canvas, e), rowIndex);
            this.showHoverTooltip(e);
        }
    }

    private redrawTimeCanvasHover(canvas, from, to, hoverFrame = undefined) {
        const diffDraw = (Math.abs(from - to)) / canvas.width;
        if (hoverFrame != undefined) {
            this.hoveredTimeKey = this.getTimecode(from + Math.floor(hoverFrame.x * diffDraw));
        } else {
            this.hoveredTimeKey = null;
        }

        this.cdr.detectChanges();
    }

    private redrawTimeCanvas(canvas, from, to) {

        const tmp = this.timeRowCanvas.nativeElement.getContext('2d');//canvases[index].nativeElement.getContext('2d');
        tmp.webkitImageSmoothingEnabled = false;
        tmp.mozImageSmoothingEnabled = false;
        tmp.ImageSmoothingEnabled = false;
        this.timeRowCanvas.nativeElement.width = $(this.timeRowCanvas.nativeElement).outerWidth();
        this.timeRowCanvas.nativeElement.height = this.canvasHeightTime;

        const ctx = canvas.getContext('2d');//canvases[index].nativeElement.getContext('2d');
        canvas.width = $(this.timeRowCanvas.nativeElement).outerWidth() * 2;//Math.abs(from - to) + 1;
        canvas.height = this.canvasHeightTime;

        const diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / this.timeRowCanvas.nativeElement.width;

        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.ImageSmoothingEnabled = false;

        let x = 0;

        for (let k = from; k <= to; k++) {

            if (k % (100 * Math.max(1, Math.ceil(diffDraw))) == 0) {
                ctx.font = "12px sinkin_sans400_regular";
                ctx.fillStyle = '#818181';
                const timecode = this.getTimecode(k);
                ctx.fillText(timecode, Math.floor(x / diffDraw) + 3, 25);
                ctx.fillStyle = '#818181';
                ctx.fillRect(Math.floor(x / diffDraw), 0, 1, 25);
            } else if (k % (10 * Math.max(1, Math.ceil(diffDraw))) == 0) {
                ctx.fillStyle = '#818181';
                ctx.fillRect(Math.floor(x / diffDraw), 0, 1, 10);
            } else if (k % (5 * Math.max(1, Math.ceil(diffDraw))) == 0) {
                ctx.fillStyle = '#818181';
                ctx.fillRect(Math.floor(x / diffDraw), 0, 1, 3);
            }
            x++;
        }
        this.updateScroll();
        this.cdr.detectChanges();
    }

    private getTimecode(currentFrame, withSom = true) {
        const t = new TMDTimecode({
            type: "frames",
            timecodeFormat: TimeCodeFormat[this.timelineData["TimecodeFormat"]],
            frames: ((withSom ? this.timelineData.From : 0) + currentFrame)
        });
        return t.toString();
    }

    private onClickRowHeader(row) {
        this.onRowHeaderClicked.emit(row);
    }

    private onClickTime(e) {
        const diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / e.target.width;
        const frame = this.timelineData.From + this.currentVisibleRange.From + Math.floor(this.getMousePosInCanvas(e.target, e).x * diffDraw);
        this.moveCurrentTimeTo(frame - this.timelineData.From, true, true);
    }

    private clearHoverOnTimeCanvas(e) {
        if (!this.timeDragActive && !this.zoomDragActive && !this.sliderDragActive && !this.itemDragActive && !this.clipDragActive) {
            const canvas = e.target;
            this.hoveredTimeKey = null;
            this.redrawTimeCanvasHover(canvas, this.currentVisibleRange.From, this.currentVisibleRange.To);
        }
    }

    private checkHoverInTimeCanvas(e) {
        if (!this.timeDragActive && !this.zoomDragActive && !this.sliderDragActive && !this.itemDragActive && !this.clipDragActive) {
            const canvas = e.target;
            this.redrawTimeCanvasHover(canvas, this.currentVisibleRange.From, this.currentVisibleRange.To, this.getMousePosInCanvas(canvas, e));
            this.showHoverTooltip(e);
        }
    }

    private isCanvasType(type: IMFXProTimelineType) {
        return type == IMFXProTimelineType.Waveform || type == IMFXProTimelineType.Marker || type == IMFXProTimelineType.Image;
    }

    private isImageCanvas(type: IMFXProTimelineType) {
        return type == IMFXProTimelineType.Image;
    }

    private isWaveCanvas(type: IMFXProTimelineType) {
        return type == IMFXProTimelineType.Waveform;
    }

    private getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    private getMousePosInScrollableArea(evt) {
        const rect = this.scrollableArea.nativeElement.getBoundingClientRect(), // abs. size of element
            scaleX = $(this.scrollableArea.nativeElement).width() / rect.width,    // relationship bitmap vs. element for X
            scaleY = $(this.scrollableArea.nativeElement).height() / rect.height;  // relationship bitmap vs. element for Y

        return {
            x: Math.floor((evt.clientX - rect.left) * scaleX) - this.groupsLabelWidth,   // scale mouse coordinates after they have
            y: Math.floor((evt.clientY - rect.top) * scaleY)     // been adjusted to be relative to element
        }
    }

    private updateScroll() {
        this.onScrollRows(null);
    }

    private onScrollRows(e) {
        if (this.isZoom && e && e.deltaY != 0) {
            const coef = this.timelineData && this.timelineData.Length > 0 ? Math.max(15 * ((this.BufferData.To - this.BufferData.From) / this.timelineData.Length), 1) : 1;
            const val = e ? -e.deltaY * coef : 0;
            let diff = Math.floor(this.currentVisibleRange.To - this.currentVisibleRange.From);
            const half = diff / 2;

            const clampLimit = Math.floor(15 / this.currentTimeNumbersWrapper.nativeElement.clientWidth * this.timelineData.Length);

            const zoomedHalf = Math.floor(this.clamp(half - val, clampLimit, this.timelineData.Length / 2));
            this.currentVisibleRange.From = this.clamp(this.currentFrame - zoomedHalf, 0, this.timelineData.Length);
            this.currentVisibleRange.To = this.clamp(this.currentVisibleRange.From + zoomedHalf * 2, 0, this.timelineData.Length);
            if (this.currentVisibleRange.From + zoomedHalf * 2 > this.timelineData.Length) {
                this.currentVisibleRange.To = Math.max(this.timelineData.Length, 1);
                this.currentVisibleRange.From = this.clamp(this.currentVisibleRange.To - zoomedHalf * 2, 0, this.timelineData.Length);
            }
            this.currentVisibleRange.To = Math.max(this.currentVisibleRange.To, 1);
            const l = this.currentTimeNumbersWrapper.nativeElement.clientWidth * (this.currentVisibleRange.From / this.timelineData.Length);
            const w = this.currentTimeNumbersWrapper.nativeElement.clientWidth * (this.currentVisibleRange.To / this.timelineData.Length) - l;
            this.zoomSlider.nativeElement.style.left = l + "px";
            this.zoomSlider.nativeElement.style.width = w + "px";

            const multiplier = this.currentTimeNumbersWrapper.nativeElement.clientWidth / (this.currentVisibleRange.To - this.currentVisibleRange.From);
            const x = this.clamp(Math.ceil(multiplier * (this.currentFrame - this.currentVisibleRange.From)), 0, this.currentTimeNumbersWrapper.nativeElement.clientWidth);
            this.currentTimeLine.nativeElement.style.left = this.groupsLabelWidth + x + "px";

            this.RedrawAllCanvases(true);
        } else {
            const wrapperHeight = $(this.rowsWrapper.nativeElement).outerHeight();
            const scrollableHeight = $(this.scrollableArea.nativeElement).outerHeight();

            let diff = this.clamp(wrapperHeight / scrollableHeight, 0, 1);
            const scrollWrapperHeight = $(this.timelineScrollWrapper.nativeElement).outerHeight();
            this.timelineScroll.nativeElement.style.height = scrollWrapperHeight * diff + "px";

            const min = wrapperHeight >= scrollableHeight ? 0 : wrapperHeight - scrollableHeight;
            const scrollValue = e ? -e.deltaY : 0;
            const initialTop = parseInt($(this.scrollableArea.nativeElement).css('top'), 10);
            const newTop = this.clamp(initialTop + scrollValue, min, 0);
            if (initialTop != newTop) {
                $(this.scrollableArea.nativeElement).css('top', newTop);
                this.timelineScroll.nativeElement.style.top = -newTop * (scrollWrapperHeight / scrollableHeight) + "px";
            }
        }
    }

    private checkKeyDown(e) {
        if (e.keyCode == 16) {
            this.isZoom = true;
        }
    }

    private checkKeyUp(e) {
        if (e.keyCode == 16) {
            this.isZoom = false;
        }
    }

    private startTimelineItemDrag(e, row: IMFXProTimelineRow, groupIndex, rowIndex, rowImageIndex = undefined) {
        if (row.WithDrag && (row.Type == IMFXProTimelineType.Marker || row.Type == IMFXProTimelineType.Image && row.Data.Timecodes)) {
            this.currentDragCanvas = e.target;
            if (typeof rowImageIndex !== 'undefined') {
                rowImageIndex = $('#imageSources' + rowImageIndex)[0];
            }
            if (row.Type == IMFXProTimelineType.Image) {
                let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / this.currentDragCanvas.width;
                let frame = this.currentVisibleRange.From + Math.floor(this.getMousePosInCanvas(this.currentDragCanvas, e).x * diffDraw);

                if (row.Data.Timecodes) {
                    for (let i = row.Data.Timecodes.length - 1; i >= 0; i--) {
                        if (frame >= row.Data.Timecodes[i] && frame <= row.Data.Timecodes[i] + row.Data.CanvasImageFrameWidth * diffDraw) {
                            frame = row.Data.Timecodes[i];

                            this.hoveredKey = null;
                            this.hoveredTimeKey = null;

                            this.timeWrapperOffset = $(this.currentTimeNumbersWrapper.nativeElement).offset();
                            this.timeWrapperWidth = this.currentTimeNumbersWrapper.nativeElement.clientWidth;
                            this.currentItemInDrag = {
                                Type: IMFXProTimelineType.Image,
                                Frame: this.timelineData.From + frame,
                                TimecodeIndex: i,
                                RowIndex: rowIndex,
                                GroupIndex: groupIndex,
                                CanvasImageFrameWidth: row.Data.CanvasImageFrameWidth,
                                CanvasImageFrameHeight: row.Data.CanvasImageFrameHeight
                            };
                            this.preventClickEvent = true;
                            this.itemDragActive = true;
                            break;
                        }
                    }
                }
            } else {
                let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / this.currentDragCanvas.width;
                const keyIndex = this.currentVisibleRange.From + Math.floor(this.getMousePosInCanvas(this.currentDragCanvas, e).x * diffDraw);
                const targetKeys = row.Keys.filter((val, idx) => {
                    if (row.Type == IMFXProTimelineType.Marker && val.Value > 0 && val.Frame <= keyIndex && val.Frame + val.Length > keyIndex) {
                        val.__idx = idx;
                        return true;
                    }
                    return false;
                });
                if (targetKeys.length > 0) {
                    const result = Object.assign({}, targetKeys[0]);
                    result.Frame = this.timelineData.From + result.Frame;
                    result.RowIndex = rowIndex;
                    result.GroupIndex = groupIndex;
                    result.TimecodeIndex = result.__idx;
                    this.hoveredKey = null;
                    this.hoveredTimeKey = null;
                    this.timeWrapperOffset = $(this.currentTimeNumbersWrapper.nativeElement).offset();
                    this.timeWrapperWidth = this.currentTimeNumbersWrapper.nativeElement.clientWidth;
                    this.currentItemInDrag = result;
                    this.itemDragActive = true;
                }
            }
            e.preventDefault();
            return false;
        }
    }

    private checkTimelineItemDrag(e) {
        if (this.itemDragActive) {
            this.moveCurrentItemDrag(e);
        }
    }

    private moveCurrentItemDrag(e) {
        this.itemDragMarkerShow = true;
        const multiplier = this.calcCurrentFrameAndMultiplier(e);
        if (e.pageX - this.timeWrapperOffset.left <= 0) {
            this.prevFrame();
        } else if (e.pageX - this.timeWrapperOffset.left >= this.timeWrapperWidth) {
            this.nextFrame();
        }
        const offset = (this.currentFrame - this.currentVisibleRange.From) * multiplier;
        this.dragItemLine.nativeElement.style.left = this.groupsLabelWidth + offset + "px";
    }

    private endTimelineItemDrag(e) {
        if (this.itemDragActive) {
            this.itemDragActive = false;
            if (this.currentDragCanvas && this.itemDragMarkerShow) {
                const diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / this.currentDragCanvas.width;
                const keyIndex = this.clamp(this.currentVisibleRange.From + Math.floor(this.getMousePosInCanvas(this.currentDragCanvas, e).x * diffDraw), this.timelineData.From, this.timelineData.From + this.timelineData.Length);
                if (this.currentItemInDrag)
                    this.onTimelineItemMoved.emit({
                        newFrame: keyIndex,
                        oldData: this.currentItemInDrag
                    });
            }
            this.itemDragMarkerShow = false;
            this.currentDragCanvas = null;
            this.currentItemInDrag = null;
            setTimeout(() => {
                this.preventClickEvent = false;
            });
        }
    }

    private prevClip() {
        let doLoop = true;
        this.timelineData.ClipsData.slice().reverse().forEach((el) => {
            if (doLoop && el.TimelineStartFrame < this.currentFrame) {
                this.currentFrame = el.TimelineStartFrame;
                this.moveCurrentTimeTo(this.clamp(el.TimelineStartFrame, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
        });
    }

    private nextClip() {
        let doLoop = true;
        this.timelineData.ClipsData.slice().forEach((el) => {
            if (doLoop && el.TimelineStartFrame > this.currentFrame) {
                this.currentFrame = el.TimelineStartFrame;
                this.moveCurrentTimeTo(this.clamp(el.TimelineStartFrame, 0, this.timelineData.Length), true, true);
                doLoop = false;
            }
        });
    }

    private getClipWidth(clip, inPixels = true) {
        if (inPixels) {
            let resultStyle = "";
            if (this.scrollableArea) {
                let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / ($(this.scrollableArea.nativeElement).width() - this.groupsLabelWidth);
                resultStyle = Math.floor((clip.Length) / diffDraw) + "px";
            }
            return resultStyle;
        } else {
            let result = 0;
            if (this.scrollableArea) {
                let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / ($(this.scrollableArea.nativeElement).width() - this.groupsLabelWidth);
                result = Math.floor((clip.Length) / diffDraw);
            }
            return result;
        }
    }

    private getClipLeft(clip, inPixels = true) {
        if (inPixels) {
            let resultStyle = "";
            if (this.scrollableArea) {
                let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / ($(this.scrollableArea.nativeElement).width() - this.groupsLabelWidth);
                resultStyle = Math.floor((clip.TimelineStartFrame - this.currentVisibleRange.From) / diffDraw) + "px";
            }
            return resultStyle;
        } else {
            let result = 0;
            if (this.scrollableArea) {
                let diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / ($(this.scrollableArea.nativeElement).width() - this.groupsLabelWidth);
                result = Math.floor((clip.TimelineStartFrame - this.currentVisibleRange.From) / diffDraw);
            }
            return result;
        }
    }

    private checkClipDrag(e) {
        if (this.clipDragActive) {
            this.clipDragMarkerShow = true;
            this.clipClickActive = false;
            if (this.selectedClip) {
                this.selectedClip = null;
                this.onClickClip.emit(this.selectedClip);
            }

            const offset = $(this.scrollableArea.nativeElement).offset();
            const x = e.pageX - offset.left - this.groupsLabelWidth;
            const diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / ($(this.scrollableArea.nativeElement).width() - this.groupsLabelWidth);
            const frame = this.currentVisibleRange.From + Math.floor(this.getMousePosInScrollableArea(e).x * diffDraw);
            if (x >= 0) {
                //inside canvas area
                let o = (frame - this.currentVisibleRange.From) / diffDraw;
                this.clipBoxView.nativeElement.style.left = o - this.relativeClipDragOffset + "px";

                for (let i = this.timelineData.ClipsData.length - 1; i >= 0; i--) {
                    const clip = this.timelineData.ClipsData[i];
                    if (frame >= clip.TimelineStartFrame && frame < clip.TimelineStartFrame + clip.Length) {
                        let o = (clip.TimelineStartFrame - this.currentVisibleRange.From) / diffDraw;
                        this.newClipFrame = clip.TimelineStartFrame;
                        this.dragItemLine.nativeElement.style.left = this.groupsLabelWidth + o + "px";
                        break;
                    } else if (i == this.timelineData.ClipsData.length - 1 && frame >= clip.TimelineStartFrame + clip.Length) {
                        let o = (clip.TimelineStartFrame + clip.Length - this.currentVisibleRange.From) / diffDraw;
                        this.newClipFrame = clip.TimelineStartFrame + clip.Length;
                        this.dragItemLine.nativeElement.style.left = this.groupsLabelWidth + o + "px";
                        break;
                    }
                }
            }
            this.currentDragFrame = frame;
            if (!this.changeFrameTimeoutActive) {
                if (e.pageX - this.timeWrapperOffset.left <= 0) {
                    this.changeFrameTimeoutActive = true;
                    this.prevFrame(frame);
                    this.changeFrameTimeout = setTimeout(() => {
                        clearTimeout(this.changeFrameTimeout);
                        this.changeFrameTimeoutActive = false;
                    }, 500);
                } else if (e.pageX - this.timeWrapperOffset.left >= this.timeWrapperWidth) {
                    this.changeFrameTimeoutActive = true;
                    this.nextFrame(frame);
                    this.changeFrameTimeout = setTimeout(() => {
                        clearTimeout(this.changeFrameTimeout);
                        this.changeFrameTimeoutActive = false;
                    }, 500);
                }
            }
        }
    }

    private endClipDrag(e) {
        if (this.clipDragActive) {
            if (this.clipClickActive) {
                this.onClickClip.emit(this.selectedClip);
                if (this.selectedClip)
                    this.moveCurrentTimeTo(this.selectedClip.TimelineStartFrame, false, false);
            } else if (this.newClipFrame >= 0 && this.currentClipInDrag) {
                this.onDragClip.emit({
                    newFrame: this.newClipFrame,
                    oldData: this.currentClipInDrag
                });

            }
            this.clipDragActive = false;
            this.clipClickActive = false;
            this.clipDragMarkerShow = false;
            this.currentClipInDrag = null;
            this.newClipFrame = -1;
            setTimeout(() => {
                this.preventClickEvent = false;
            });
        }
    }

    private startClipDrag(e) {
        if (this.timelineData.ClipsData) {
            const offset = $(this.scrollableArea.nativeElement).offset();
            const x = e.pageX - offset.left - this.groupsLabelWidth;
            if (x >= 0) {
                //inside canvas area
                const diffDraw = (Math.abs(this.currentVisibleRange.From - this.currentVisibleRange.To)) / ($(this.scrollableArea.nativeElement).width() - this.groupsLabelWidth);
                const frame = this.currentVisibleRange.From + Math.floor(this.getMousePosInScrollableArea(e).x * diffDraw);
                this.hoveredKey = null;
                this.hoveredTimeKey = null;
                for (let i = this.timelineData.ClipsData.length - 1; i >= 0; i--) {
                    const clip = this.timelineData.ClipsData[i];
                    if (frame >= clip.TimelineStartFrame && frame < clip.TimelineStartFrame + clip.Length) {
                        this.currentClipInDrag = clip;
                        if (this.selectedClip && this.selectedClip.ClipId == clip.ClipId) {
                            this.selectedClip = null;
                            this.onClickClip.emit(this.selectedClip);
                        } else {
                            this.selectedClip = clip;
                        }
                        $(this.clipBoxView.nativeElement).height($(this.scrollableArea.nativeElement).outerHeight());
                        $(this.clipBoxView.nativeElement).width(clip.Length / diffDraw);
                        this.clipDragActive = true;
                        this.clipClickActive = true;
                        this.preventClickEvent = true;
                        this.relativeClipDragOffset = (frame - this.currentVisibleRange.From) / diffDraw - (clip.TimelineStartFrame - this.currentVisibleRange.From) / diffDraw;
                        const o = (clip.TimelineStartFrame - this.currentVisibleRange.From) / diffDraw;
                        this.dragItemLine.nativeElement.style.left = this.groupsLabelWidth + o + "px";

                        this.timeWrapperOffset = $(this.currentTimeNumbersWrapper.nativeElement).offset();
                        this.timeWrapperWidth = this.currentTimeNumbersWrapper.nativeElement.clientWidth;
                        break;
                    }
                }
            }
            e.preventDefault();
            return false;
        }
    }

    private rowResizeStarted = false;
    private rowResizeGroupIndex = 0;
    private rowResizeRowIndex = 0;
    private rowResizeStartY = 0;
    private rowResizeCurrentY = 0;
    private rowResizeStartHeight = 0;
    private minWaveformHeight = 40;

    private startRowResizeDrag(e, groupIndex, rowIndex) {
        this.rowResizeStarted = true;
        this.rowResizeGroupIndex = groupIndex;
        this.rowResizeRowIndex = rowIndex;
        this.rowResizeStartY = e.pageY;
        this.rowResizeStartHeight = $("#row-wrapper-" + groupIndex + "-" + rowIndex).outerHeight(true);
        e.preventDefault();
        return false;
    }

    private checkRowResizeDrag(e) {
        if(!this.rowResizeStarted)
            return;

        this.rowResizeCurrentY = e.pageY;
        const diff = this.rowResizeCurrentY - this.rowResizeStartY;
        let height = this.rowResizeStartHeight + diff;
        if(height < this.minWaveformHeight) {
            height = this.minWaveformHeight;
        }
        $("#row-wrapper-" + this.rowResizeGroupIndex + "-" + this.rowResizeRowIndex).height(height)
    }

    private endRowResizeDrag(e) {
        this.rowResizeStarted = false;
        this.rowResizeGroupIndex = 0;
        this.rowResizeRowIndex = 0;
        this.rowResizeStartY = 0;
        this.rowResizeCurrentY = 0;
        e.preventDefault();
        return false;
    }

    private calcCurrentFrameAndMultiplier(e) {
        const multiplier = this.currentTimeNumbersWrapper.nativeElement.clientWidth / (this.currentVisibleRange.To - this.currentVisibleRange.From);
        const x = this.clamp(e.pageX - this.timeWrapperOffset.left, 0, this.timeWrapperWidth);
        this.currentFrame = this.currentVisibleRange.From + Math.floor(x / multiplier);

        return multiplier;
    }
}
