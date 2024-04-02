import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { IMFXModalComponent } from "../../../../modules/imfx-modal/imfx-modal";

@Component({
    selector: 'change-queue-id-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})

export class ChangeQueueIdModalComponent {

    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    private mRef: IMFXModalComponent;
    private queueId: number = 0;

    constructor(private injector: Injector) {
        this.mRef = this.injector.get('modalRef');
        this.queueId = this.mRef.getData().queueId;
    }

    ngAfterViewInit() {

    }

    apply() {
        this.mRef.modalEvents.emit({
            name: 'ok', state: {queueId: this.queueId}
        });
        this.mRef.hide();
    }
}
