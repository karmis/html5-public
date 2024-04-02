import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {IMFXModalComponent} from "../../imfx-modal/imfx-modal";
import {PDFViewerComponent} from "../../viewers/pdf/pdf";

@Component({
    selector: 'document-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class DocumentModalComponent implements OnInit, AfterViewInit {
    @ViewChild('pdfViewer', {static: false}) private pdfViewer: PDFViewerComponent;
    // @ViewChild('overlayDoc', {static: false}) private overlay: any;
    private modalRef: IMFXModalComponent;
    private data;

    constructor(private injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        // this.overlay.show();
        this.pdfViewer.toggleFullSize = () => {
            this.modalRef.hide();
            // this.overlay.hide();
        };
    }

    ngOnDestroy() {
    }

    closeModal() {
        this.data.hide();
        // this.showOverlay = false;
    }
}
