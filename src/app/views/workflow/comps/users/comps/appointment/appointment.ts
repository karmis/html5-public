import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation} from "@angular/core";
import {JobService} from "../../../../services/jobs.service";
import {NotificationService} from "../../../../../../modules/notification/services/notification.service";
import {SlickGridProvider} from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {WorkflowSlickGridProvider} from "../../../../providers/workflow.slick.grid.provider";

@Component({
    selector: 'wf-appointment-Component',
    templateUrl: "tpl/index.html",
    providers: [
        JobService
        // LookupSearchLocationService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppointmentComponent {
    private data: any;
    public jobs: any = {};
    public nodeObj: any = {};

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private notificationRef: NotificationService,
                private sgp: SlickGridProvider,
                private jobService: JobService) {
        this.data = this.injector.get('data');
    }

    ngAfterViewInit() {

    }

    onShow(jobs, node) {
        this.jobs = jobs;
        if (node) {
            this.nodeObj = node.data.dirtyObj;
        }
        this.cdr.detectChanges();
    }


    assign(id: number, type: string, jobs: number[] = [], action: 'pass' | 'share' | 'passclear', route) {
        this.jobService.assign(id, type, jobs, action, route).subscribe((resp) => {
            this.notificationRef.notifyShow(1, "workflow.success_assign");
            (<WorkflowSlickGridProvider>this.sgp).refreshGrid()
        }, () => {
            this.notificationRef.notifyShow(2, "workflow.error_assign");
        });
    }
}
