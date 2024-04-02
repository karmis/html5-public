/**
 * Created by Sergey Trizna on 16.05.2017.
 */
import {
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { NativeNavigatorProvider } from '../../../providers/common/native.navigator.provider';
// import * as pdfjsLib from './libs/pdf.js'

@Component({
    selector: 'pdf-viewer',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})

export class PDFViewerComponent {
    public currentPDF: any = null;
    protected shownMaxPagesInCanvasMode: number = 5;
    protected totalPagesInDocument: number = 0;
    private _config: any = {
        url: '',
        renderMode: 'embedding',
        fullSize: false
    };
    private showEmptyPdf: boolean = false;
    @Input('config') private config;
    private isEmpty: boolean = true;
    @ViewChild('target', {static: false}) private compRef;
    private PDFObject;
    private shownPages: number = 0;

    constructor(private cdr: ChangeDetectorRef,
                private navProvider: NativeNavigatorProvider) {
        this.config = $.extend(true, this._config, this.config);
    }

    ngAfterViewInit() {
        this.config = $.extend(true, this._config, this.config);
        this.showEmptyPdf = !this.config.url;
        this.PDFObject = require('./libs/pdfobject.js');
        if (!this.config.url) {
            this.clear();
            return;
        }
        if (this.config.renderMode == 'canvas') {
            this.renderPDFByURLToCanvas(this.config.url);
        } else {
            this.renderPDFByURL(this.config.url);
        }
    }

    renderPDFByURL(url: string) {
        this.renderPDFByURLEmbedding(url);
        // if (!this.navProvider.isFirefox() && !this.navProvider.isSafari()) {
        //     this.renderPDFByURLEmbedding(url);
        // } else {
        //     console.warn('PDFObject is not defined; Rendering to canvas');
        //     this.renderPDFByURLToCanvas(url);
        // }
    }

    renderPDFByURLEmbedding(url: string, selector?: string) {
        let options = (!this.navProvider.isSafari())
            ? {
                pdfOpenParams: {
                    view: 'FitH',
                    pagemode: 'none',
                    toolbar: 0,
                    navpanes: 1,
                }
            }
            : {};

        this.config.renderMode = 'embedding';
        if (!selector) {
            selector = this.compRef.nativeElement;
        }

        this.PDFObject.embed(url, selector, options);

        this.show();
        // @TODO dirty hack
        setTimeout(() => {
            this.cdr.detectChanges()
        }, 0);

    }

    renderPDFByURLToCanvas(url: string) {
        this.show();
        this.config.renderMode = 'canvas';

        // pdfjsLib.GlobalWorkerOptions.workerSrc = './libs/pdf.worker.js';
        // const loadingTask = pdfjsLib.getDocument(url);
        // loadingTask.promise.then((pdf) => {
        //     this.currentPDF = pdf;
        //     this.shownPages = this.totalPagesInDocument = pdf.numPages;
        //     if (this.shownPages > this.shownMaxPagesInCanvasMode) {
        //         this.shownPages = this.shownMaxPagesInCanvasMode;
        //     }
        //     this.cdr.markForCheck();
        //     for (let i = 1; i <= this.shownPages; i++) {
        //         pdf.getPage(i).then((page) => {
        //             let viewport = page.getViewport(1.5);
        //             let canvas = (<any>$('<canvas></canvas>')[0]);
        //             let ctx = canvas.getContext('2d');
        //             let renderContext = {
        //                 canvasContext: ctx,
        //                 viewport: viewport
        //             };
        //             canvas.height = viewport.height;
        //             canvas.width = viewport.width;
        //             this.compRef.nativeElement.appendChild(canvas);
        //             page.render(renderContext);
        //         });
        //     }
        // });
    }

    renderPDFFromContent(blob: Blob) {
        this.showEmptyPdf = false;
        let URL = (<any>window).URL || (<any>window).webkitURL;
        let downloadUrl = URL.createObjectURL(blob);
        this.renderPDFByURL(downloadUrl);
    }

    toggleFullSize() {
        this.config.fullSize = !this.config.fullSize;
        let bg = $('#test-for-overlay').find('#pdf-background');
        if (bg.length === 0) {
            $('#test-for-overlay').prepend(`<div id="pdf-background" style="position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: #000;
            opacity: .5;"></div>`);
        } else {
            $(bg).remove();
        }
    }

    clear() {
        this.isEmpty = true;
        this.compRef.nativeElement.innerHTML = '';
    }

    show() {
        this.isEmpty = false;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        let x = event.keyCode;
        if (x === 27 && this.config.fullSize) {
            this.toggleFullSize();
        }
    }
}
