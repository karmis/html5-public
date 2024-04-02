import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IMFXModalComponent } from "../../../../modules/imfx-modal/imfx-modal";

@Component({
    selector: 'pages-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})

export class PagesModalComponent {

    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    private mRef: IMFXModalComponent;
    private pageNumber: number = 0;
    private pageNumbers: Array<any> = [];

    constructor(private injector: Injector) {
        this.mRef = this.injector.get('modalRef');
        this.pageNumbers = this.mRef.getData().pageNumbers;
    }

    ngAfterViewInit() {

    }

    apply() {
        this.mRef.modalEvents.emit({
            name: 'ok', state: {pageNumber: this.pageNumber}
        });
        this.mRef.hide();
    }
    onRadioChange(i) {
        this.pageNumber = i;
    }
}
