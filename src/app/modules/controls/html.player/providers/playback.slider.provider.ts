import {Injectable, NgZone} from "@angular/core";
import {AbstractPlayerProvider} from "./abstract.player.provider";

@Injectable()
export class PlaybackSliderProvider  extends AbstractPlayerProvider {
    constructor(private zone: NgZone) {
        super();
    }
    getPlaybackRateFromSlider(num) {
        return {
            "-4": 0.1,
            "-3": 0.2,
            "-2": 0.4,
            "-1": 0.5,
            "0": 1,
            "1": 1.5,
            "2": 2,
            "3": 4,
            "4": 8
        }[num];
    }
    getPlaybackRateFromPlayer(num) {
        return {
            "0.1": -4,
            "0.2": -3,
            "0.4": -2,
            "0.5": -1,
            "1": 0,
            "1.5": 1,
            "2": 2,
            "4": 3,
            "8": 4
        }[num];
    }
    getPlayerPlaybackRate() {
        let rate = this.componentRef.player.playbackRate();
        return this.getPlaybackRateFromPlayer(rate);
    }
    setPlayerPlaybackRate(rate) {
        const playerRate = this.getPlaybackRateFromSlider(rate);
        if (!playerRate) return;
        this.componentRef.player.playbackRate(playerRate);
        let slider = this.componentRef.player.controlBar.getChildById('sub_control_bar').getChildById('center_control_bar').getChildById('playback-slider-box').el();
        (<any>$(slider)).slider('value', rate);
    }
}
