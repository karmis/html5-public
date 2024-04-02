import { Output, Injectable, EventEmitter } from '@angular/core';
import { TMDTimecode, TimeCodeFormat } from "../../../../utils/tmd.timecode";
import { TimecodeProvider } from "./timecode.provider";
import { IMFXHtmlPlayerComponent } from "../imfx.html.player";
import { SegmentsProvider } from "./segments.provider";
import { Observable, Subject, Subscription } from "rxjs";

export interface ClipsProviderInterface {
    config: any;
    moduleContext: any;
    clipData: any;
    onAddClipFromPlayer: EventEmitter<any>;

    setInState();

    setOutState();

    doInitState();

    selectClipState();

    setIn();

    setOut();

    markframe();

    add();

    clear(clearAllPoints?);

    clearState();

    disableButton(el, disable);

    isNumeric(val);

    checkPoint(num);

    getCurrentClip();

    setProgressInterval();

    clearPlayerMarkers(clearPoints);

    clearClipPoints();

    addLastClipState();

    addNextClipState();

    selectClip(clip);

    resetReplaceIdx();
}

@Injectable()
export class ClipsProvider implements ClipsProviderInterface {
    clipData: any = {
        replaceIdx: -1,
        firstPointKey: null,
        firstPoint: {},
        secondPoint: {},
        clips: [],
        clipsUnlimited: true
    };
    moduleContext: IMFXHtmlPlayerComponent | any;
    config: any;
    @Output() onAddClipFromPlayer: EventEmitter<any> = new EventEmitter<any>();
    newSomEom = {
        som: {
            playerTime: 0,
            frames: 0,
            timeCode: ''
        },
        eom: {
            playerTime: 0,
            frames: 0,
            timeCode: ''
        }
    }
    public changedSomEom: Subject<any> = new Subject<any>();
    updateMarkLineInterval = null;

    constructor(private timecodeProvider: TimecodeProvider,
                private segmentsProvider: SegmentsProvider) {
        this.onAddClipFromPlayer.subscribe((resp) => {
            switch (resp.id) {
                case 'markin':
                    this.setIn();
                    break;
                case 'markout':
                    this.setOut();
                    break;
                case 'markframe':
                    this.markframe();
                    break;
                // case 'addclip':
                //     this.add();
                //     break;
                // case 'replaceclip':
                //     this.add(true);
                //     break;
                case 'marksegment':
                    this.markSegment();
                    break;
                case 'clearclip':
                    this.clearClipMarkesrOnly();
                    break;
                case 'gotoin':
                    this.goToIn();
                    break;
                case 'gotoout':
                    this.goToOut();
                    break;
                case 'setsom':
                    this.setsom();
                    break;
                case 'seteom':
                    this.seteom();
                    break;
                default:
                    break;
            }
        });
        // setTimeout(()=>{
        //   this.initCanvasCleaner();
        // })
    }

    // bad idea - it fires too often

    // private initCanvasCleaner() {
    //   if (this.moduleContext instanceof IMFXHtmlPlayerComponent) {
    //     (<IMFXHtmlPlayerComponent>this.moduleContext).playerReady.subscribe(()=>{
    //       var canvas: HTMLCanvasElement = <HTMLCanvasElement>$("#clip-canvas")[0];
    //       if (canvas) {
    //         var context = canvas.getContext('2d');
    //         this.moduleContext.player.on("timeupdate", ()=>{
    //           context.clearRect(0, 0, canvas.width, canvas.height);
    //         })
    //       }
    //     })
    //   }
    // }

    setInState() {
        this.disableButton('markin', false);
        this.disableButton('markout', false);
        this.disableButton('markframe', false);
        // this.disableButton('addclip', true);
        // this.disableButton('replaceclip', true);
        this.disableButton('clearclip', false);
        this.disableButton('gotoin', false);
        this.disableButton('gotoout', true);
    }

    setOutState() {
        this.disableButton('markin', false);
        this.disableButton('markout', false);
        // this.disableButton('addclip', false);
        // this.disableButton('replaceclip', !(this.clipData.replaceIdx != -1));
        this.disableButton('clearclip', false);
        this.disableButton('gotoin', false);
        this.disableButton('gotoout', false);
    };

    doInitState() {
        this.disableButton('markin', false);
        this.disableButton('markout', false);
        this.disableButton('markframe', false);
        this.disableButton('addclip', true);
        this.disableButton('replaceclip', true);
        this.disableButton('clearclip', true);
        this.disableButton('gotoin', true);
        this.disableButton('gotoout', true);
    };

    selectClipState(withGoInOut = false) {
        this.disableButton('markin', false);
        this.disableButton('markout', false);
        this.disableButton('markframe', false);
        this.disableButton('addclip', false);
        this.disableButton('replaceclip', false);
        this.disableButton('clearclip', false);
        if (withGoInOut) {
            this.disableButton('gotoin', false);
            this.disableButton('gotoout', false);
        }
    }

    disableAllMarkersButtons() {
        this.disableButton('markin', true);
        this.disableButton('markout', true);
        this.disableButton('markframe', true);
        this.disableButton('addclip', true);
        this.disableButton('replaceclip', true);
        this.disableButton('clearclip', true);
        this.disableButton('gotoin', true);
        this.disableButton('gotoout', true);
    }

    setDisablesStatusSomEomBtns(status = true) {
        this.disableButton('setsom', status);
        this.disableButton('seteom', status);
    }

    private hasFirstPoint() {
        return this.clipData.firstPoint && this.clipData.firstPoint.time
    }

    private hasSecondPoint() {
        return this.clipData.secondPoint && this.clipData.secondPoint.time
    }

    public setsom() {
        let time = this.moduleContext.player.currentTime();
        const newSOMFRAMES = this.timecodeProvider.getFramesFromTimecode(time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], this.moduleContext.som);
        if (this.newSomEom.eom.frames !== 0 && newSOMFRAMES > this.newSomEom.eom.frames) {
            return
        }
        this.newSomEom.som.frames = newSOMFRAMES;
        // this.disableButton('gotoin', false);
        let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
        let tcStr = this.timecodeProvider.getTimecodeString(time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som);
        this.newSomEom.som.timeCode = tcStr;
        var markers = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == -1;
        });
        if (markers.length > 0) {
            for (var i = 0; i < this.moduleContext.player.markers.getMarkers().length; i++) {
                if (this.moduleContext.player.markers.getMarkers()[i].point == -1 && this.moduleContext.player.markers.getMarkers()[i].type === 'som') {
                    this.moduleContext.player.markers.remove([i]);
                    break;
                }
            }
        }
        this.moduleContext.player.markers.add([{
            time: time,
            text: 'Media Som ' + tcStr,
            point: -1,
            type: 'som',
            class: 'tags-marker media-som-eom som fa fa-caret-up'
        }]);

        this.changedSomEom.next(this.newSomEom);
    };

    public seteom() {
        let time = this.moduleContext.player.currentTime();
        const newEOMFRAMES = this.timecodeProvider.getFramesFromTimecode(time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], this.moduleContext.som);
        if (newEOMFRAMES < this.newSomEom.som.frames) {
            return
        }
        this.newSomEom.eom.frames = newEOMFRAMES;
        let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
        let tcStr = this.timecodeProvider.getTimecodeString(time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som);
        this.newSomEom.eom.timeCode = tcStr;
        var markers = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == -1;
        });
        if (markers.length > 0) {
            for (var i = 0; i < this.moduleContext.player.markers.getMarkers().length; i++) {
                if (this.moduleContext.player.markers.getMarkers()[i].point == -1 && this.moduleContext.player.markers.getMarkers()[i].type === 'eom') {
                    this.moduleContext.player.markers.remove([i]);
                    break;
                }
            }
        }

        this.moduleContext.player.markers.add([{
            time: time,
            text: 'Media Eom ' + tcStr,
            type: 'eom',
            point: -1,
            class: 'tags-marker media-som-eom eom fa fa-caret-up',
        }]);

        this.changedSomEom.next(this.newSomEom);
    };

    public setIn(inTime?) {
        let time = (inTime !== null && inTime !== undefined) ? inTime : this.moduleContext.player.currentTime();
        //for not possible to "Mark Out" before "Mark In"
        var markers = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == 2;
        })
        if (markers.length > 0 && markers[0].time < time) {
            this.clear();
        }
        //----------------
        this.checkPoint(1);
        this.moduleContext.player.markers.add([{
            time: time,
            point: 1,
            class: 'in-marker'
        }]);
        this.clipData.firstPoint = {
            time: time,
            thumbnail: this.getCurrentClip()
        };
        this.clipData.firstPointKey = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == 1;
        })[0].key;
        if (this.updateMarkLineInterval) {
            clearInterval(this.updateMarkLineInterval)
        }
        this.updateMarkLineInterval = setInterval(() => {
            this.setProgressInterval();
        }, 500)
        this.disableButton('addclip', false);
        // this.hasSecondPoint() ? this.setOutState() : this.setInState();
        if (this.segmentsProvider.isSegmented() && !this.hasSecondPoint()) {
            let chunk = this.segmentsProvider.getSegmentByRelativeTimeSeconds(time);
            if (chunk) {
                this.setOut(this.moduleContext.player.duration() * chunk.percent);
            }
        }
        this.disableButton('gotoin', false);
        let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
        let tcStr = this.timecodeProvider.getTimecodeString(time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som);
        let st = this.moduleContext.clipboardProvider.pasteLocal();
        if (!st) {
            st = {inTc: tcStr};
        } else {
            st.inTc = tcStr;
        }

        this.moduleContext.clipboardProvider.copyLocal(st);
    };

    public setOut(outTime?) {
        let time = (outTime !== null && outTime !== undefined) ? outTime : this.moduleContext.player.currentTime();
        //for not possible to "Mark Out" before "Mark In"
        var markers = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == 1;
        })
        // if second marker is smaller then first
        if ((markers.length > 0 && markers[0].time > time)) {
            return;
        }
        //----------------
        this.checkPoint(2);
        this.moduleContext.player.markers.add([{
            time: time,
            point: 2,
            thumbnail: this.getCurrentClip(),
            class: 'out-marker'
        }]);

        this.clipData.secondPoint = {
            time: time,
            thumbnail: this.getCurrentClip()
        };

        if (this.updateMarkLineInterval) {
            clearInterval(this.updateMarkLineInterval)
        }

        this.updateMarkLineInterval = setInterval(() => {
            this.setProgressInterval();
        }, 500)

        this.disableButton('gotoout', false);
        // this.setOutState();
        let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
        let tcStr = this.timecodeProvider.getTimecodeString(time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som);
        let st = this.moduleContext.clipboardProvider.pasteLocal();
        if (!st) {
            st = {outTc: tcStr};
        } else {
            st.outTc = tcStr;
        }
        this.moduleContext.clipboardProvider.copyLocal(st);
    };

    public goToIn() {
        let clipMarkers = this.moduleContext.player.markers.getMarkers().filter(function (el) {
            return el.point > 0;
        });
        clipMarkers.length && this.moduleContext.player.currentTime(clipMarkers[0].time);
    }

    public goToOut() {
        let clipMarkers = this.moduleContext.player.markers.getMarkers().filter(function (el) {
            return el.point > 0;
        });
        clipMarkers.length && this.moduleContext.player.currentTime(clipMarkers[1].time);
    }

    public goToSegmentStart() {
        let clipMarkers = this.moduleContext.player.markers.getMarkers().filter(el => el.class == 'tags-marker');
        clipMarkers.length && this.moduleContext.player.currentTime(clipMarkers[0].time);
    }

    public goToSegmentEnd() {
        let clipMarkers = this.moduleContext.player.markers.getMarkers().filter(el => el.class == 'tags-marker');
        clipMarkers.length && this.moduleContext.player.currentTime(clipMarkers[1].time);
    }

    public markframe() {
        this.setCurrentPointClip().subscribe((res: any) => {
            this.clearClipMarkesrOnly();
            this.setIn();
            this.setOut();
        });
    }

    public markSegment() {
        this.clearClipMarkesrOnly();
        var markers = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.class == 'tags-marker';
        });
        if (markers.length == 2) {
            this.setIn(markers[0].time);
            this.setOut(markers[1].time);
        }
    }

    public add(replace: boolean = false) {
        // if first and second points exists
        if (Object.keys(this.clipData.firstPoint).length > 0 && Object.keys(this.clipData.secondPoint).length > 0) {
            let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
            var newClip = {
                startTime: this.clipData.firstPoint.time,
                startThumbnail: this.clipData.firstPoint.thumbnail,
                startTimecodeString: this.timecodeProvider.getTimecodeString(this.clipData.firstPoint.time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som),
                stopTime: this.clipData.secondPoint.time,
                stopThumbnail: this.clipData.secondPoint.thumbnail,
                stopTimecodeString: this.timecodeProvider.getTimecodeString(this.clipData.secondPoint.time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som),
                itemID: this.moduleContext.file.ID,
                file: this.moduleContext.file
            };
            // this.clipData.clipsUnlimited ? this.addNextClipState() : this.addLastClipState();
            // this.clear();
            this.clearClipMarkesrOnly();
            this.clearClipPoints();
            // this.clearState();
            if (replace) {
                this.moduleContext.clipReplaced.emit({
                    oldClipId: this.clipData.replaceIdx,
                    newClip: newClip
                });
            } else {
                this.moduleContext.clipAdded.emit(newClip);
            }
        }
    };

    public clear(clearPoints?: number) {
        this.clearPlayerMarkers(clearPoints);
    };

    clearState() {
        this.doInitState();
    }

    disableButton(el, disable) {
        $('.' + el).attr('disabled', disable);
    };

    isNumeric(val) {
        // parseFloat NaNs numeric-cast false positives (null|true|false|"")
        // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
        // subtraction forces infinities to NaN
        // adding 1 corrects loss of precision from parseFloat (#15100)
        return !Array.isArray(val) && (val - parseFloat(val) + 1) >= 0;
    };

    checkPoint(num) {
        var markers = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == num;
        })
        if (markers.length > 0) {
            for (var i = 0; i < this.moduleContext.player.markers.getMarkers().length; i++) {
                if (this.moduleContext.player.markers.getMarkers()[i].point == num) {
                    this.moduleContext.player.markers.remove([i]);
                    break;
                }
            }
        }
    };

    getCurrentClip() {
        if (this.moduleContext.type == 150) // for audio
            return '';
        if (this.moduleContext.isLive && this.moduleContext.type == 150) {
            return "./assets/img/audio-poster.PNG"
        } else {
            var canvas: HTMLCanvasElement = <HTMLCanvasElement>$("#clip-canvas")[0];//imfx-video-{{file.ID}}
            if (!canvas) {
                return null;
            }
            var blankCanvas: HTMLCanvasElement = <HTMLCanvasElement>$("#empty-canvas")[0];//imfx-video-{{file.ID}}
            blankCanvas.width = 683;
            blankCanvas.height = 384;

            var video: HTMLVideoElement = <HTMLVideoElement>$("video")[0];
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 683;
            canvas.height = 384;

            var vRatio = (canvas.height / video.videoHeight) * video.videoWidth;
            var horizontalOffset = (canvas.clientWidth - vRatio) / 2;
            context.drawImage(video, horizontalOffset, 0, vRatio, canvas.clientHeight);
            //context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);

            if (this.moduleContext.player.src() == (document.location.origin + document.location.pathname)) {
                return "./assets/img/dpsinvert.png"
            } else {
                var url = "";
                try {
                    url = canvas.toDataURL();
                    let blank = blankCanvas.toDataURL();
                    if (url == blank) {
                        throw new Error("Video frame did not loaded yet, can not make a preview");
                    }
                } catch (e) {
                    // console.error(e);
                    url = "./assets/img/default-thumb.png"
                } finally {
                    return url
                }
            }
        }
    };

    setProgressInterval() {
        if (!this.clipData.secondPoint) {
            //  alert('Select second point!');
            return;
        }
        if (!this.clipData.firstPoint) {
            //   alert('Select first point!');
            return;
        }
        if (this.clipData.secondPoint.time - this.clipData.firstPoint.time > 0 && this.clipData.firstPointKey) {
            var dur = this.moduleContext.player.duration();
            if (dur === Infinity) {
                dur = (<any>window).liveDuration;
            }
            var intervalWidth = (this.clipData.secondPoint.time - this.clipData.firstPoint.time) * 100 / dur;
            $('[data-marker-key="' + this.clipData.firstPointKey + '"]').css('width', intervalWidth + '%');
        }
    };

    clearPlayerMarkers(clearPoints: number = 0) {
        let player = this.moduleContext.player;
        if (!this.moduleContext.player) {
            return;
        }
        var arr = []; // remove all except som and eom
        this.disableButton('marksegment', true);
        switch (clearPoints) {
            case 0: // clear all points
                this.clearClipPoints();
                break;
            case 1: // clear only yellow markers (locators)
                arr = player.markers.getMarkers().filter((el) => {
                    return el.point > 0;
                });
                break;
            case 2: // clear only green markers (clip)
                arr = player.markers.getMarkers().filter((el) => {
                    return el.point == 0;
                });
                this.clearClipPoints();
                break;
            case 3: // dont't clear markers and clips, just update
                arr = player.markers.getMarkers().filter((el) => {
                    return el.point >= 0;
                });
            default:
                break;
        }
        let somEom = player.markers.getMarkers().filter(el => {
            return el.point == -1;
        });
        player.markers.removeAll();
        player.markers.add(arr);
        player.markers.add(somEom);
        let firstPoint = player.markers.getMarkers().filter(function (el, ind) {
            return el.point == 1;
        })[0];
        if (firstPoint) {
            this.clipData.firstPointKey = firstPoint.key;
        }
        this.setProgressInterval();
        this.selectClipState();
    };

    clearClipMarkesrOnly() {
        var arr = this.moduleContext.player.markers.getMarkers().filter(function (el) {
            return el.point <= 0;
        });
        this.moduleContext.player.markers.removeAll();
        this.moduleContext.player.markers.add(arr);
        this.moduleContext.clipboardProvider.pasteLocal(true);
        this.disableButton('gotoin', true);
        this.disableButton('gotoout', true);
        if (this.updateMarkLineInterval) {
            clearInterval(this.updateMarkLineInterval)
        }
    }

    clearClipPoints() {
        this.clipData.firstPointKey = null;
        this.clipData.firstPoint = {};
        this.clipData.secondPoint = {};
    };

    // last of N available (from directive params)
    addLastClipState() {
        this.disableButton('markin', true);
        this.disableButton('markout', true);
        this.disableButton('addclip', true);
        this.disableButton('replaceclip', true);
        this.disableButton('clearclip', true);
        this.disableButton('gotoin', true);
        this.disableButton('gotoout', true);
    }

    // directive has no limit for clips
    addNextClipState() {
        this.doInitState();
    }

    clearNotClipMarkers() {
        var arr = this.moduleContext.player.markers.getMarkers().filter(function (el) {
            return el.point > 0;
        });
        this.disableButton('marksegment', true);
        this.moduleContext.player.markers.removeAll();
        this.moduleContext.player.markers.add(arr);
    }

    selectClip(o) {
        let som = this.moduleContext.som;

        if (som === undefined || isNaN(som)) {
            console.log('SOM is undefined');
            return;
        }

        let markers = o.markers;
        this.clipData.replaceIdx = o.id;
        let timecodeFormat = TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat];
        let clip = {
            startTime: TMDTimecode.fromString(markers[0].time, timecodeFormat).substract(TMDTimecode.fromFrames(som, timecodeFormat)).toSeconds(),
            stopTime: TMDTimecode.fromString(markers[1].time, timecodeFormat).substract(TMDTimecode.fromFrames(som, timecodeFormat)).toSeconds()
        };
        let arr = this.moduleContext.player.markers.getMarkers().filter(function (el) {  // remember som/eom
            return el.point == -1;
        });
        this.moduleContext.player.markers.removeAll();
        this.moduleContext.player.markers.add(arr);
        this.moduleContext.player.markers.add([{
            time: clip.startTime,
            point: 1,
            class: 'in-marker'
        }]);
        this.clipData.firstPoint = {
            time: clip.startTime,
            thumbnail: markers[0].thumbnail
        };
        this.clipData.firstPointKey = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == 1;
        })[0].key;
        this.moduleContext.player.markers.add([{
            time: clip.stopTime,
            point: 2,
            // thumbnail: clip.stopThumbnail,
            class: 'out-marker'
        }]);
        this.clipData.secondPoint = {
            time: clip.stopTime,
            // thumbnail: clip.stopThumbnail
        };
        this.moduleContext.player.currentTime(this.moduleContext.player.markers.getMarkers()[0].time);
        this.setProgressInterval();
        this.selectClipState();
    }

    setCurrentPointClip(): Observable<Subscription> {
        return new Observable((observer: any) => {
            let time = this.moduleContext.player.currentTime();
            this.clear();
            this.moduleContext.player.markers.add([{
                time: time,
                point: 1,
                class: 'in-marker'
            }]);
            this.clipData.firstPoint = {
                time: time,
                thumbnail: this.getCurrentClip()
            };
            this.clipData.firstPointKey = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
                return el.point == 1;
            })[0].key;
            this.moduleContext.player.markers.add([{
                time: time,
                point: 2,
                thumbnail: this.getCurrentClip(),
                class: 'out-marker'
            }]);

            this.clipData.secondPoint = {
                time: time,
                thumbnail: this.getCurrentClip()
            };
            observer.next(this.clipData);
            observer.complete();
        });
    }

    getCurrentPointClip(): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.setCurrentPointClip().subscribe((res: any) => {
                let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
                var newClip = {
                    startTime: this.clipData.firstPoint.time,
                    startThumbnail: this.clipData.firstPoint.thumbnail,
                    startTimecodeString: this.timecodeProvider.getTimecodeString(this.clipData.firstPoint.time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som),
                    stopTime: this.clipData.secondPoint.time,
                    stopThumbnail: this.clipData.secondPoint.thumbnail,
                    stopTimecodeString: this.timecodeProvider.getTimecodeString(this.clipData.secondPoint.time, TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat], som),
                    itemID: this.moduleContext.file.ID
                };
                observer.next(newClip);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getInOutPoint(replace?: boolean) {
        let inPoint = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point === 1;
        })[0];
        let outPoint = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point === 2;
        })[0];
        let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
        let timecodeFormat = TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat];

        let inTimecode = null;
        let outTimecode = null;
        if (inPoint) {
            inTimecode = this.timecodeProvider.getTimecodeString(inPoint.time, timecodeFormat, som);
        }
        if (outPoint) {
            outTimecode = this.timecodeProvider.getTimecodeString(outPoint.time, timecodeFormat, som);
        }
        // let duration = this.getDuration();
        this.moduleContext.clipAdded.emit({
            startTimecodeString: inTimecode,
            stopTimecodeString: outTimecode,
            replace: replace
        });
    }

    getDuration() {
        let som = this.moduleContext.videoDetails.FileSomFrames ? this.moduleContext.videoDetails.FileSomFrames : 0;
        let timecodeFormat = TimeCodeFormat[this.moduleContext.videoDetails.TimecodeFormat];
        let _in = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point === 1;
        })[0]
        let _out = this.moduleContext.player.markers.getMarkers().filter(function (el, ind) {
            return el.point === 2;
        })[0]
        let inTimecode = "00:00:00:00";
        let outTimecode = "00:00:00:00";
        if (!!_in) {
            inTimecode = this.timecodeProvider.getTimecodeString(_in.time, timecodeFormat, som);
        }
        if (!!_out) {
            outTimecode = this.timecodeProvider.getTimecodeString(_out.time, timecodeFormat, som);
        }
        let duration = TMDTimecode.fromString(outTimecode, timecodeFormat).substract(TMDTimecode.fromString(inTimecode, timecodeFormat));
        return duration;
    }

    resetReplaceIdx() {
        this.clipData.replaceIdx = -1;
        this.setOutState();
    }
}
