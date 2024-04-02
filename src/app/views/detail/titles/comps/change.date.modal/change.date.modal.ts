import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NotificationService } from "../../../../../modules/notification/services/notification.service";
import { IMFXModalComponent } from "../../../../../modules/imfx-modal/imfx-modal";
import { TimeProvider } from "../../../../../providers/common/time.provider";
import { IMFXControlsDateTimePickerComponent } from "../../../../../modules/controls/datetimepicker/imfx.datetimepicker";
import { DetailProvider } from "../../../../../modules/search/detail/providers/detail.provider";

@Component({
    selector: 'change-date-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})

export class ChangeDateByModalComponent {

    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    @ViewChild('datetimepicker', {static: false}) private dtp: IMFXControlsDateTimePickerComponent;
    private mRef: IMFXModalComponent;
    private ids: number[] = [];
    private oldDate: string;
    private changeDateJSON;
    private provider: DetailProvider;
    private currentDate: Date;
    private minDate = new Date();

    constructor(private injector: Injector,
                private notificationRef: NotificationService,
                private cdr: ChangeDetectorRef,
                private timeProvider: TimeProvider) {
        this.mRef = this.injector.get('modalRef');
        this.ids = this.mRef.getData().ids;
        this.oldDate = this.mRef.getData().date;
        this.provider = this.mRef.getData().provider;
    }

    onSelectValue() {
        this.changeDateJSON = this.dtp.getValueAsJSON();
        this.currentDate = this.dtp.getValue();
        this.cdr.markForCheck();
    }

    ngAfterViewInit() {
        if (this.oldDate !== null) {
            this.currentDate = this.oldDate ? new Date(this.oldDate.split('.')[0]) : null;
            this.changeDateJSON = this.oldDate;
            this.dtp.setValue(this.currentDate);
            this.cdr.markForCheck();
        }
    }

    apply() {
        this.changeDateJSON = this.dtp.getValueAsJSON().split('.')[0];
        if (this.currentDate) {
            this.provider.service.changeDateByModal(this.ids, this.changeDateJSON)
                .subscribe((res) => {
                    this.notificationRef.notifyShow(1, 'changeby.success');
                    this.mRef.modalEvents.emit({
                        name: 'ok', state: {newDate: this.changeDateJSON}
                    });
                    this.mRef.hide();
                }, () => {
                    this.notificationRef.notifyShow(2, 'changeby.error');
                });
        }
    }

}
