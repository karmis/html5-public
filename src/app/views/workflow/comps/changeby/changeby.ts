import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {NotificationService} from "../../../../modules/notification/services/notification.service";
import {IMFXModalComponent} from "../../../../modules/imfx-modal/imfx-modal";
import {HttpService} from "../../../../services/http/http.service";
import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {TimeProvider} from "../../../../providers/common/time.provider";
import {IMFXControlsDateTimePickerComponent} from "../../../../modules/controls/datetimepicker/imfx.datetimepicker";


@Component({
    selector: 'wf-changeby-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})

export class WorkflowChangeByModalComponent {

    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    @ViewChild('datetimepicker', {static: false}) private dtp: IMFXControlsDateTimePickerComponent;
    private mRef: IMFXModalComponent;
    private jobs: number[] = [];
    private completedByDateJSON;
    private provider: SlickGridProvider;
    private currentDate: Date;
    private minDate = new Date();
    private fromDetail = false;
    private jobDetails = null;
    constructor(private injector: Injector,
                private notificationRef: NotificationService,
                private cdr: ChangeDetectorRef,
                private httpService: HttpService,
                private timeProvider: TimeProvider) {
        this.mRef = this.injector.get('modalRef');
        this.jobs = this.mRef.getData().jobs;
        this.provider = this.mRef.getData().provider;
        this.fromDetail = !!this.mRef.getData().fromDetail;
        this.jobDetails = this.mRef.getData().jobDetails;
    }

    onSelectValue() {
        this.completedByDateJSON = this.dtp.getValueAsJSON();
        this.currentDate = this.dtp.getValue();
        this.cdr.markForCheck();
    }

    ngAfterViewInit() {
        const row = this.fromDetail ? this.jobDetails : (this.provider.getSelectedRows()[0] as any);
        if(!row){
            return;
        }

        const cd = this.fromDetail ? row.CompleteBy : row.J_COMPL_BY;
        this.currentDate = this.jobs.length === 1 && cd ? new Date(cd) : new Date();
        this.completedByDateJSON = this.currentDate.toJSON();
        this.dtp.setValue(this.currentDate);
        this.cdr.markForCheck();
    }

    apply() {
        this.completedByDateJSON = this.dtp.getValueAsJSON();
        if (this.currentDate) {
            if(this.dtp.getValue() !== null && this.dtp.getValue() < this.minDate){
                this.notificationRef.notifyShow(2, 'basket.date_not_more_than_now');
                return;
            }
            // this.completedByDateJSON = this.completedByDateJSON.slice(0,-1);

            this.httpService.post(
                '/api/v3/jobs/completeby',
                JSON.stringify({
                    Jobs: this.jobs,
                    CompleteBy: this.completedByDateJSON
                })).subscribe(() => {
                this.notificationRef.notifyShow(1, 'changeby.success');
                if(!this.fromDetail)
                    this.provider.refreshGrid();
                this.mRef.hide();
            }, () => {
                this.notificationRef.notifyShow(2, 'changeby.error');
            })
        }
    }

}
