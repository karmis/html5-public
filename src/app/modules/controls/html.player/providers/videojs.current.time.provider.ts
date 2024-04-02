import { IMFXHtmlPlayerComponent } from "../imfx.html.player";
import { TimeCodeFormat } from "../../../../utils/tmd.timecode";
import { ItemTypes } from "../item.types";
import { Injectable } from "@angular/core";
import { TimecodeProvider } from "./timecode.provider";
import { AbstractPlayerProvider } from "./abstract.player.provider";

@Injectable()
export class VideoJSCurrentTimeProvider extends AbstractPlayerProvider {

    private _time;

    constructor(private timecodeProvider: TimecodeProvider) {
        super();
    }

    getTimelineTime() {
        return this._time;
    }

    init() {
        let providerRef = this;

        if (!this.componentRef.simpleMode) {
            this.componentRef.videojs.getComponent("SeekBar").prototype.handleMouseMove = function handleMouseMove(event) {
                if (!isSingleLeftClick(event)) {
                    return;
                }

                var newTime;
                var distance = this.calculateDistance(event);
                var liveTracker = this.player_.liveTracker;

                if (!liveTracker || !liveTracker.isLive()) {
                    newTime = distance * this.player_.duration(); // Don't let video end while scrubbing.

                    if (newTime === this.player_.duration()) {
                        newTime = newTime - 0.1;
                    }
                } else {
                    if (distance >= 0.99) {
                        liveTracker.seekToLiveEdge();
                        return;
                    }

                    var seekableStart = liveTracker.seekableStart();
                    var seekableEnd = liveTracker.liveCurrentTime();
                    newTime = seekableStart + distance * liveTracker.liveWindow(); // Don't let video end while scrubbing.

                    if (newTime >= seekableEnd) {
                        newTime = seekableEnd;
                    } // Compensate for precision differences so that currentTime is not less
                    // than seekable start


                    if (newTime <= seekableStart) {
                        newTime = seekableStart + 0.1;
                    } // On android seekableEnd can be Infinity sometimes,
                    // this will cause newTime to be Infinity, which is
                    // not a valid currentTime.


                    if (newTime === Infinity) {
                        return;
                    }
                } // Set new time (tell player to seek to new time)

                const segPos = segmentPosition(newTime, providerRef);

                this.player_.currentTime(segPos ? segPos.time : newTime);
            };
            this.componentRef.videojs.getComponent("MouseTimeDisplay").prototype.createEl = function createEl() {
                return providerRef.componentRef.videojs.dom.createEl('div', {
                    className: 'vjs-mouse-display',
                    innerHTML: '<div class="vjs-mouse-display-text"></div><div class="vjs-mouse-display-chunk-number"></div><div class="vjs-mouse-display-file-name"></div>',
                });
            }
            this.componentRef.videojs.getComponent("ProgressControl").prototype.handleMouseMove = function handleMouseMove(event) {
                var seekBar = this.getChild('seekBar');

                if (!seekBar) {
                    return;
                }

                var playProgressBar = seekBar.getChild('playProgressBar');
                var mouseTimeDisplay = seekBar.getChild('mouseTimeDisplay');

                if (!playProgressBar && !mouseTimeDisplay) {
                    return;
                }

                var seekBarEl = seekBar.el();
                var seekBarRect = findPosition(seekBarEl);
                var seekBarPoint = getPointerPosition(seekBarEl, event).x; // The default skin has a gap on either side of the `SeekBar`. This means
                // that it's possible to trigger this behavior outside the boundaries of
                // the `SeekBar`. This ensures we stay within it at all times.

                seekBarPoint = clamp(seekBarPoint, 0, 1);

                if (mouseTimeDisplay) {
                    mouseTimeDisplay.update(seekBarRect, seekBarPoint, event);
                }

                if (playProgressBar) {
                    playProgressBar.update(seekBarRect, seekBar.getProgress());
                }
            }

            this.componentRef.videojs.getComponent("MouseTimeDisplay").prototype.update = function update(seekBarRect, seekBarPoint, event) {
                let duration = this.player_.duration();
                if (this.player_.duration() === Infinity) {
                    (<any>duration) = this.player_.liveTracker.liveCurrentTime(); //this.player_.children()[0].duration;//this.componentRef.player.tech(true).hls ? this.componentRef.player.tech(true).hls.stats.mediaSecondsLoaded : 0;//
                }
                let newTime = seekBarPoint * duration;
                providerRef._time = newTime;
                let time;
                if (providerRef.componentRef.videoDetails) {
                    if (providerRef.componentRef.type == ItemTypes.MEDIA || (providerRef.componentRef.type == ItemTypes.AUDIO && providerRef.componentRef.getTvStandart() && providerRef.componentRef.videoDetails.TimecodeFormat)) {
                        time = providerRef.timecodeProvider.getTimecodeString(newTime, TimeCodeFormat[providerRef.componentRef.videoDetails.TimecodeFormat], providerRef.componentRef.som);
                    } else if (providerRef.componentRef.type == ItemTypes.AUDIO && (!providerRef.componentRef.getTvStandart() || !providerRef.componentRef.videoDetails.TimecodeFormat)) {
                        time = providerRef.timecodeProvider.getAudioTimeString(newTime, providerRef.componentRef.som);
                    } else {
                        time = providerRef.timecodeProvider.getTimeString(newTime);
                    }
                }
                let _left = seekBarRect.width * seekBarPoint;
                let tooltipLeft = '';
                let tooltipRight = '';

                this.el().style.left = _left + 'px';
                // 42px - 'vjs-mouse-display-text' width / 2
                if (_left <= 42) {
                    this.el().getElementsByClassName('vjs-mouse-display-text')[0].style.left = _left * (-1) + 'px';
                    this.el().getElementsByClassName('vjs-mouse-display-text')[0].style.right = '';
                    tooltipLeft =  _left * (-1) + 'px';
                } else if (_left > seekBarRect.width - 42) {
                    this.el().getElementsByClassName('vjs-mouse-display-text')[0].style.right = -1 * (seekBarRect.width - _left) + 'px';
                    this.el().getElementsByClassName('vjs-mouse-display-text')[0].style.left = '';
                    tooltipRight = -1 * (seekBarRect.width - _left) + 'px'
                } else {
                    this.el().getElementsByClassName('vjs-mouse-display-text')[0].style.left = '';
                    this.el().getElementsByClassName('vjs-mouse-display-text')[0].style.right = '';
                }

                if (this.keepTooltipsInside) {
                    let clampedPosition = this.clampPosition_(seekBarRect.width * seekBarPoint);
                    let difference = seekBarRect.width * seekBarPoint - clampedPosition + 1;
                    let tooltipWidth = 200;
                    let tooltipWidthHalf = tooltipWidth / 2;

                    this.tooltip.innerHTML = time;
                    this.tooltip.style.right = '-' + (tooltipWidthHalf - difference) + 'px';
                }

                const segPos = segmentPosition(newTime, providerRef)
                if (segPos) {
                    $('.vjs-mouse-display-chunk-number').text('Chunk #' + segPos.chunkNumber)
                        .css({'left': tooltipLeft, 'right': tooltipRight}).show();
                    $('.vjs-mouse-display-file-name').text(segPos.fileName)
                        .css({'left': tooltipLeft, 'right': tooltipRight})
                        .attr('title', segPos.fileName).show();

                    time = segPos.timecode;
                } else {
                    $('.vjs-mouse-display-chunk-number').hide();
                    $('.vjs-mouse-display-file-name').hide();
                }


                this.el().getElementsByClassName('vjs-mouse-display-text')[0].textContent = time || 'Loading';


            }

            this.componentRef.videojs.getComponent("PlayProgressBar").prototype.updateDataAttr = function updateDataAttr(event) {
                let time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();
                let timeStr;
                if (providerRef.componentRef.videoDetails) {
                    if (providerRef.componentRef.type == ItemTypes.MEDIA || (providerRef.componentRef.type == ItemTypes.AUDIO && providerRef.componentRef.getTvStandart() && providerRef.componentRef.videoDetails.TimecodeFormat)) {
                        timeStr = providerRef.timecodeProvider.getTimecodeString(time, TimeCodeFormat[providerRef.componentRef.videoDetails.TimecodeFormat], providerRef.componentRef.som);
                    } else if (providerRef.componentRef.type == ItemTypes.AUDIO && (!providerRef.componentRef.getTvStandart() || !providerRef.componentRef.videoDetails.TimecodeFormat)) {
                        timeStr = providerRef.timecodeProvider.getAudioTimeString(time, providerRef.componentRef.som);
                    } else {
                        timeStr = providerRef.timecodeProvider.getTimeString(time);
                    }

                }
                this.el_.setAttribute('data-current-time', timeStr);
            };
        }
    }

}

function segmentPosition(time, providerRef) {
    const source = providerRef.componentRef.src;
    if (!source || typeof source === 'string') {
        return null
    }
    var durations = source.map(function (a) {
        return a.seconds
    });

    for (var i = 0; i < source.length - 1; i++) {
        var prevDurationSum = 0;
        for (var j = 0; j <= i; j++) {
            prevDurationSum += durations[j];
        }
        if (prevDurationSum - 8  <= time && time <= prevDurationSum + 8) {
            return {
                chunkNumber: i + 1,
                fileName: source[i].fileName,
                time: prevDurationSum,
                timecode: providerRef.timecodeProvider.getTimecodeString(prevDurationSum, TimeCodeFormat[providerRef.componentRef.videoDetails.TimecodeFormat], providerRef.componentRef.som)
            };
        }
    }
    return null;
}

var clamp = function clamp(number, min, max) {
    number = Number(number);
    return Math.min(max, Math.max(min, isNaN(number) ? min : number));
};


/**
 * Get the position of an element in the DOM.
 *
 * Uses `getBoundingClientRect` technique from John Resig.
 *
 * @see http://ejohn.org/blog/getboundingclientrect-is-awesome/
 *
 * @param  {Element} el
 *         Element from which to get offset.
 *
 * @return {module:dom~Position}
 *         The position of the element that was passed in.
 */

function findPosition(el) {
    if (!el || el && !el.offsetParent) {
        return {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
    }

    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var left = 0;
    var top = 0;

    do {
        left += el.offsetLeft;
        top += el.offsetTop;
        el = el.offsetParent;
    } while (el);

    return {
        left: left,
        top: top,
        width: width,
        height: height
    };
}


/**
 * Get the pointer position within an element.
 *
 * The base on the coordinates are the bottom left of the element.
 *
 * @param  {Element} el
 *         Element on which to get the pointer position on.
 *
 * @param  {EventTarget~Event} event
 *         Event object.
 *
 * @return {module:dom~Coordinates}
 *         A coordinates object corresponding to the mouse position.
 *
 */

function getPointerPosition(el, event) {
    var boxTarget = findPosition(event.target);
    var box = findPosition(el);
    var boxW = box.width;
    var boxH = box.height;
    var offsetY = event.offsetY - (box.top - boxTarget.top);
    var offsetX = event.offsetX - (box.left - boxTarget.left);

    if (event.changedTouches) {
        offsetX = event.changedTouches[0].pageX - box.left;
        offsetY = event.changedTouches[0].pageY + box.top;
    }

    var position = {
        y: 1 - Math.max(0, Math.min(1, offsetY / boxH)),
        x: Math.max(0, Math.min(1, offsetX / boxW)),
    };
    return position;
}

/**
 * Check if an event was a single left click.
 *
 * @param  {EventTarget~Event} event
 *         Event object.
 *
 * @return {boolean}
 *         Will be `true` if a single left click, `false` otherwise.
 */

function isSingleLeftClick(event) {
    // Note: if you create something draggable, be sure to
    // call it on both `mousedown` and `mousemove` event,
    // otherwise `mousedown` should be enough for a button
    if (event.button === undefined && event.buttons === undefined) {
        // Why do we need `buttons` ?
        // Because, middle mouse sometimes have this:
        // e.button === 0 and e.buttons === 4
        // Furthermore, we want to prevent combination click, something like
        // HOLD middlemouse then left click, that would be
        // e.button === 0, e.buttons === 5
        // just `button` is not gonna work
        // Alright, then what this block does ?
        // this is for chrome `simulate mobile devices`
        // I want to support this as well
        return true;
    }

    if (event.button === 0 && event.buttons === undefined) {
        // Touch screen, sometimes on some specific device, `buttons`
        // doesn't have anything (safari on ios, blackberry...)
        return true;
    } // `mouseup` event on a single left click has
    // `button` and `buttons` equal to 0


    if (event.type === 'mouseup' && event.button === 0 && event.buttons === 0) {
        return true;
    }

    if (event.button !== 0 || event.buttons !== 1) {
        // This is the reason we have those if else block above
        // if any special case we can catch and let it slide
        // we do it above, when get to here, this definitely
        // is-not-left-click
        return false;
    }

    return true;
}
