import {Injectable} from "@angular/core";
import {AbstractPlayerProvider} from "./abstract.player.provider";
import {FocusProvider} from "./focus.provider";
import {ClipsProvider} from "./clips.provider";
import { ShortcutsStatic } from '../shortcuts.static';
import { TimecodeProvider } from './timecode.provider';
import {PlaybackSliderProvider} from "./playback.slider.provider";
import {TimecodeControlsProvider} from "./timecode.controls.provider";

@Injectable()
export class HotkeysProvider extends AbstractPlayerProvider {

    private SHORTCUTS = ShortcutsStatic._deepCopy(ShortcutsStatic.defaultHotkeysData);
    private PERMANENT_SHORTCUTS = ShortcutsStatic._deepCopy(ShortcutsStatic.permanentHotkeys);

    private BTNS_IDS = {
        ADD: "#addclip",
        REPLACE: "#replaceclip",
        CLEAR: "#clearclip",
        MARK_IN: "#markin",
        MARK_OUT: "#markout",
        GO_TO_IN: "#gotoin",
        GO_TO_OUT: "#gotoout"
    };

    constructor(private focusProvider: FocusProvider,
                private clipsProvider: ClipsProvider,
                private timecodeProvider: TimecodeProvider,
                private timecodeControlsProvider: TimecodeControlsProvider,
                private playbackSliderProvider: PlaybackSliderProvider ) {
        super();
    }

    setHotkeys (data) {
        this.SHORTCUTS = $.extend(true, {}, ShortcutsStatic.defaultHotkeysData, data);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (!this.componentRef.isPlayerDataLoaded || this.componentRef.simpleMode || this.componentRef.playerEnabledInPopout) { // if small player or not loaded or it play in popout
            return;
        }
        let activeElement = this.componentRef.playerElement.nativeElement.ownerDocument.activeElement || event.target;
        if (activeElement.nodeName == "TEXTAREA" || activeElement.nodeName == "INPUT") {  // if input, or textarea has focus
            return;
        }
        if ($('#' + this.componentRef.playerElement.nativeElement.id).length == 0) {  // for reuse strategy when player from Info panel stored in memory but don't display on the screen
            return;
        }
        let actions = {
            TOGGLE_PLAY: this._TOGGLE_PLAY,
            BACKWARD: this._BACKWARD,
            BACKWARD_FRAME: this._BACKWARD_FRAME,
            FORWARD: this._FORWARD,
            FORWARD_FRAME: this._FORWARD_FRAME,
            BACKWARD_10: this._BACKWARD_10,
            FORWARD_10: this._FORWARD_10,
            BACKWARD_20: this._BACKWARD_20,
            FORWARD_20: this._FORWARD_20,
            ADD: this._ADD,
            REPLACE: this._REPLACE,
            CLEAR: this._CLEAR,
            MARK_IN: this._MARK_IN,
            MARK_OUT: this._MARK_OUT,
            GO_TO_IN: this._GO_TO_IN,
            GO_TO_OUT: this._GO_TO_OUT,
            INCREASE_SPEED: this._INCREASE_SPEED,
            DECREASE_SPEED: this._DECREASE_SPEED,
            GO_TO_SEGMENT_START: this._GO_TO_SEGMENT_START,
            GO_TO_SEGMENT_END: this._GO_TO_SEGMENT_END,
            GO_TO_START: this._GO_TO_START,
            GO_TO_END: this._GO_TO_END
        };

        let shortCut = ShortcutsStatic.defineHotkeyBundle(event);
        let act_key = this.getActNameByShortcut(shortCut) || null;

        if (act_key &&  typeof actions[act_key] == 'function') {
            actions[act_key].call(this, event);
            // global overlap other events on capture stage
            event.stopPropagation();
        }
    }

    getActNameByShortcut (shortCut) {
        for (let key in this.SHORTCUTS) {
            if (this.SHORTCUTS[key].active && shortCut == this.SHORTCUTS[key].combin) {
                return key;
            }
        }

        for (let key in this.PERMANENT_SHORTCUTS) {
            if (this.SHORTCUTS[key].active && shortCut == this.PERMANENT_SHORTCUTS[key].combin) {
                return key;
            }
        }
        return;
    }

    // toDo
    // getActNameByShortcut (shortCut, arrShortCuts, useActiveFlag?:false) {
    //     for (let key in arrShortCuts) {
    //         if ((!useActiveFlag || arrShortCuts[key].active)
    //             && shortCut == arrShortCuts[key].combin) {
    //             return key;
    //         }
    //     }
    //     return;
    // }

    private _TOGGLE_PLAY = (event) => {
        this.componentRef.togglePlay(this.componentRef.player.paused());
        event.preventDefault();
    };

    private _BACKWARD = (event) => {
        this.componentRef.player.currentTime(this.componentRef.player.currentTime() - 1);
    };

    private _FORWARD = (event) => {
        this.componentRef.player.currentTime(this.componentRef.player.currentTime() + 1);
    };

    private _BACKWARD_FRAME = (event) => {
        this.timecodeControlsProvider.makeBackwardFrame();
    };

    private _FORWARD_FRAME = (event) => {
        this.timecodeControlsProvider.makeForwardFrame();
    };

    private _BACKWARD_10 = (event) => {
        this.componentRef.player.currentTime(this.componentRef.player.currentTime() - 10);
    };

    private _FORWARD_10 = (event) => {
        this.componentRef.player.currentTime(this.componentRef.player.currentTime() + 10);
    };

    private _BACKWARD_20 = (event) => {
        this.componentRef.player.currentTime(this.componentRef.player.currentTime() - 20);
    };

    private _FORWARD_20 = (event) => {
        this.componentRef.player.currentTime(this.componentRef.player.currentTime() + 20);
    };

    private _ADD = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.ADD).attr('disabled')) {
            return;
        }
        this.clipsProvider.add(false);
    };

    private _REPLACE = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.REPLACE).attr('disabled')) {
            return;
        }
        this.clipsProvider.add(true);
    };

    private _CLEAR = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.CLEAR).attr('disabled')) {
            return;
        }
        this.clipsProvider.clear();
    };

    private _MARK_IN = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.MARK_IN).attr('disabled')) {
            return;
        }
        this.clipsProvider.setIn();
    };

    private _MARK_OUT = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.MARK_OUT).attr('disabled')) {
            return;
        }
        this.clipsProvider.setOut();
    };

    private _GO_TO_IN = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.GO_TO_IN).attr('disabled')) {
            return;
        }
        this.clipsProvider.goToIn();
    };

    private _GO_TO_OUT = (event) => {
        if (!this.componentRef.clipBtns || $(this.BTNS_IDS.GO_TO_OUT).attr('disabled')) {
            return;
        }
        this.clipsProvider.goToOut();
    };

    private _INCREASE_SPEED = (event) => {
        let rate = this.playbackSliderProvider.getPlayerPlaybackRate();
        this.playbackSliderProvider.setPlayerPlaybackRate(rate + 1);
    };

    private _DECREASE_SPEED = (event) => {
        let rate = this.playbackSliderProvider.getPlayerPlaybackRate();
        this.playbackSliderProvider.setPlayerPlaybackRate(rate - 1);
    };

    private _GO_TO_SEGMENT_START = (event) => {
        this.clipsProvider.goToSegmentStart();
    };

    private _GO_TO_SEGMENT_END = (event) => {
        this.clipsProvider.goToSegmentEnd();
    };

    private _GO_TO_START = (event) => {
        this.componentRef.player.currentTime(0);
    };

    private _GO_TO_END = (event) => {
        this.componentRef.togglePlay(false);
        this.componentRef.player.currentTime(this.componentRef.player.duration());
    };
}
