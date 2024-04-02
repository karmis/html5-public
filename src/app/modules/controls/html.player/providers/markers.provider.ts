import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {Injectable} from "@angular/core";
import {AbstractPlayerProvider} from "./abstract.player.provider";
import {ClipsProvider} from "./clips.provider";
import {TimecodeProvider} from "./timecode.provider";
import {HelperProvider} from "./helper.provider";
import { take, takeUntil, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class MarkersProvider extends AbstractPlayerProvider {

    constructor(private clipProvider: ClipsProvider,
                private timecodeProvider: TimecodeProvider,
                private helperProvider: HelperProvider) {
        super();
    };

    init() {
        this.componentRef.player.markers && (!!this.componentRef.player.markers.call) && this.componentRef.player.markers({
            markers: []
        });
    }

    setMarkers(o) {
        let providerRef = this;

        if (!this.componentRef.player.markers
            || !this.componentRef.player.player_)
            return;

        let markers = o.markers;
        let m_type = o.m_type;
        if (m_type == 'locator') {
            this.clipProvider.clearPlayerMarkers(1); // clear only locators
            let som = 0;
            if (this.componentRef.videoDetails) {
                som = this.componentRef.videoDetails.FileSomFrames ? this.componentRef.videoDetails.FileSomFrames : 0;
            }
            let timecodeFormat = TimeCodeFormat[providerRef.componentRef.videoDetails.TimecodeFormat];
            markers.forEach(function (marker) {
                if (som) {
                    var time = TMDTimecode.fromString(marker.time, timecodeFormat).substract(TMDTimecode.fromFrames(som, timecodeFormat)).toSeconds();
                }
                else {
                    var time = TMDTimecode.fromString(marker.time, timecodeFormat).toSeconds();
                }
                providerRef.componentRef.player.markers.add([{
                    time: time,
                    text: '',
                    point: 0,
                    class: 'tags-marker'
                }]);
            });
            if (markers.length == 2) {
                if (som) {
                    var startTime = TMDTimecode.fromString(markers[0].time, timecodeFormat).substract(TMDTimecode.fromFrames(som, timecodeFormat)).toSeconds();
                    var endTime = TMDTimecode.fromString(markers[1].time, timecodeFormat).substract(TMDTimecode.fromFrames(som, timecodeFormat)).toSeconds();
                }
                else {
                    var startTime = TMDTimecode.fromString(markers[0].time, timecodeFormat).toSeconds();
                    var endTime = TMDTimecode.fromString(markers[1].time, timecodeFormat).toSeconds();
                }
                if (startTime != endTime) {
                    let progressControlWidth = providerRef.componentRef.player.controlBar.progressControl.width();
                    let intervalWidth = (endTime - startTime) * 100 / providerRef.componentRef.player.duration() + (3 * 100 / progressControlWidth);
                    providerRef.componentRef.player.markers.add([{
                        time: startTime,
                        text: '',
                        point: 0,
                        class: 'interval-tags-marker',
                        width: intervalWidth
                    }]);
                }
                this.clipProvider.disableButton('marksegment', false);
            }

            let playerMarkers = this.componentRef.player.markers.getMarkers();

            if (playerMarkers.length === 0) {
                return;
            }

            let beginFrom = (typeof startTime == 'number' && playerMarkers.find(el => el.time == startTime))
                ? startTime
                : playerMarkers[0].time;

            // ---dirty hack only for mpd
            if (this.helperProvider.checkFileType('mpd', this.componentRef.player.src()) && this.componentRef.player.duration() - playerMarkers[0].time < 1) {
                this.componentRef.player.currentTime(beginFrom - 0.0001);
            } else
            {
                this.componentRef.player.currentTime(beginFrom);
            }
            // ---end dirty hack
        }
        else if (m_type == 'clip') {
            this.clipProvider.selectClip(o);
        }
    }
    updateIntervalMarker(){
        let allMarkers = this.componentRef.player.markers.getMarkers().filter((el) => {
            return el.class !== 'interval-tags-marker';
        });
        if (allMarkers.length == 0) return;
        let orangeMarkers = this.componentRef.player.markers.getMarkers().filter((el) => {
            return (el.class == 'tags-marker' && el.point == 0);
        });
        let intervalMarker = this.componentRef.player.markers.getMarkers().filter((el) => {
            return el.class == 'interval-tags-marker';
        });
        if (intervalMarker.length == 0) return;
        let progressControlWidth = this.componentRef.player.controlBar.progressControl.width();
        let intervalWidth = (orangeMarkers[1].time - orangeMarkers[0].time) * 100 / this.componentRef.player.duration() + (3 * 100 / progressControlWidth);
        intervalMarker[0].width = intervalWidth;
        this.componentRef.player.markers.removeAll();
        this.componentRef.player.markers.add(allMarkers);
        this.componentRef.player.markers.add(intervalMarker);
    }

    setMediaSomEom(som, eom , somTc, eomTc, somFrames = 0, eomFrames = 0) {
        var markers = this.componentRef.player.markers.getMarkers().filter(function (el, ind) {
            return el.point == -1;
        });
        if (markers.length > 0) {
            for (var i = 0; i < this.componentRef.player.markers.getMarkers().length; i++) {
                if (this.componentRef.player.markers.getMarkers()[i].point == -1) {
                    this.componentRef.player.markers.remove([i]);
                    break;
                }
            }
        }
        this.clipProvider.newSomEom = {
                som: {
                    playerTime: som,
                    frames: somFrames,
                    timeCode: somTc
                },
                eom: {
                    playerTime: eom,
                    frames: eomFrames,
                    timeCode: eomTc
                }
        }
        if (som > 0) {
            this.componentRef.player.markers.add([{
                time: som,
                text: 'Media Som ' + somTc,
                point: -1,
                type: 'som',
                class: 'tags-marker media-som-eom som fa fa-caret-up'
            }]);
        }
        if (eom > 0 && eom < this.componentRef.player.duration().toFixed(5)) { // for example: 707.3066 < 707.3066000000026.toFixed(5)
            this.componentRef.player.markers.add([{
                time: eom,
                text: 'Media Eom ' + eomTc,
                point: -1,
                type: 'eom',
                class: 'tags-marker media-som-eom eom fa fa-caret-up',
            }]);
        }
    }
}
