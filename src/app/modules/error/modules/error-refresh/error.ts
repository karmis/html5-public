import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { IMFXModalComponent } from '../../../imfx-modal/imfx-modal';

@Component({
    selector: 'error-refresh-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ]
})
export class ErrorRefreshModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    protected modalRef: IMFXModalComponent;
    // private data;
    // private key = "isDebugMode";

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef) {
        this.modalRef = injector.get('modalRef');
    }


    detectChanges() {
        this.cdr.detectChanges();
    }

    refresh() {
        location.reload();
    }
}
