import {ElementRef, ViewChild} from "@angular/core";

export abstract class TimelineBaseComponent {
    @ViewChild('mainTimelineWrapper', {static: false}) mainTimelineWrapper: ElementRef;
    @ViewChild('hoverTooltip', {static: false}) hoverTooltip: ElementRef;

// <editor-fold desc="Utility">

    protected showHoverTooltip(e) {
        const offset = $(this.mainTimelineWrapper.nativeElement).offset();
        const x = this.clamp(e.pageX - offset.left, 0 + this.hoverTooltip.nativeElement.offsetWidth / 2,
            this.mainTimelineWrapper.nativeElement.clientWidth - this.hoverTooltip.nativeElement.offsetWidth / 2);
        let y = this.clamp(e.pageY - offset.top, -50, this.mainTimelineWrapper.nativeElement.clientHeight);

        if (y < this.hoverTooltip.nativeElement.offsetHeight / 2 + 10) {
            y = y + 10;
        } else {
            y = y - this.hoverTooltip.nativeElement.offsetHeight - 10;
        }

        this.hoverTooltip.nativeElement.style.left = x - this.hoverTooltip.nativeElement.offsetWidth / 2 + "px";
        this.hoverTooltip.nativeElement.style.top = y + "px";
    }

    protected getMousePosInCanvas(canvas, evt) {
        let rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

        return {
            x: Math.floor((evt.clientX - rect.left) * scaleX),   // scale mouse coordinates after they have
            y: Math.floor((evt.clientY - rect.top) * scaleY)     // been adjusted to be relative to element
        }
    }

    protected clamp(current, min, max) {
        return Math.min(Math.max(current, min), max);
    };

// </editor-fold>
}
