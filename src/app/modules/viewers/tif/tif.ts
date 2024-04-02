import {Component, ViewEncapsulation, ViewChild, Input, ChangeDetectorRef, ElementRef} from '@angular/core';
var Tiff = require('tiff.js');
@Component({
    selector: 'tif-viewer',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})

export class TIFViewerComponent {
    @Input('config') private config: any = {
        url: ''
    }
    @ViewChild('imageContainer', {static: true}) private imageContainer: ElementRef;
    @ViewChild('imageOverlay', {static: true}) private imageOverlay: ElementRef;
    @ViewChild('wrapper', {static: true}) private wrapper: ElementRef;
    private xhr = null;

    constructor() {

    }

    ngOnDestroy() {
        if(this.xhr)
            this.xhr.abort();
    }

    ngAfterViewInit() {
        this.xhr = new XMLHttpRequest();
        this.xhr.responseType = 'arraybuffer';
        this.xhr.open('GET', this.config.url);
        this.xhr.onload = (e) => {
            Tiff.initialize({
                TOTAL_MEMORY: 100000000
            });
            var tiff = new Tiff({
                buffer: this.xhr.response
            });
            var tiffCanvas = tiff.toCanvas();

            var wrapperW = $(this.wrapper.nativeElement).innerWidth() - 20;
            var wrapperH = $(this.wrapper.nativeElement).innerHeight() - 20;

            if(tiffCanvas && tiffCanvas.width > 0 && tiffCanvas.height > 0) {
                var orientationHorizontal = tiffCanvas.width >= tiffCanvas.height;
                var ratio;
                var w;
                var h;
                if (orientationHorizontal) {
                    ratio = tiffCanvas.height / tiffCanvas.width;
                    w = this.clamp(tiffCanvas.width, 0, wrapperW);
                    h = w * ratio;
                } else {
                    ratio = tiffCanvas.width / tiffCanvas.height;
                    h = this.clamp(tiffCanvas.height, 0, wrapperH);
                    w = h * ratio;
                }

                var destCanvas = document.createElement("canvas");
                destCanvas.width = w;
                destCanvas.height = h;
                var destCtx = destCanvas.getContext('2d');
                destCtx.drawImage(tiffCanvas, 0, 0, tiffCanvas.width, tiffCanvas.height, 0, 0, w, h);
                $(this.imageContainer.nativeElement).append(destCanvas);
            }

            this.toggleOverlay(false);
        };
        this.xhr.send();
    }

    private toggleOverlay(show) {
        if(show)
            $(this.imageOverlay.nativeElement).show();
        else
            $(this.imageOverlay.nativeElement).hide();
    }

    private clamp(current, min, max) {
        return Math.min(Math.max(current, min), max);
    }
}
