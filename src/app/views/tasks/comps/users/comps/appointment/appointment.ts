import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation} from "@angular/core";
import {JobService} from "../../../../services/jobs.service";
import {NotificationService} from "../../../../../../modules/notification/services/notification.service";
import {SlickGridProvider} from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {TasksSlickGridProvider} from "../../../../providers/tasks.slick.grid.provider";

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
    private sgp: SlickGridProvider;
    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private notificationRef: NotificationService,
                private jobService: JobService) {
        this.data = this.injector.get('data');
        this.sgp = this.injector.get(SlickGridProvider);
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


    assign(id: number, type: string, jobs: number[] = [], action: 'pass' | 'share' | 'passclear') {
        this.jobService.assign(id, type, jobs, action).subscribe((resp) => {
            this.notificationRef.notifyShow(1, "common.ok");
            (<TasksSlickGridProvider>this.sgp).refreshGrid();
        }, () => {
            this.notificationRef.notifyShow(2, "common.error");
        });
    }
}
