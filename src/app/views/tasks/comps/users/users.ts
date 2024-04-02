import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { Router } from "@angular/router";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { TasksSlickGridProvider } from "../../providers/tasks.slick.grid.provider";
import { TreeStandardListTypes } from "../../../../modules/controls/tree/types";
import { IMFXControlsTreeComponent } from "../../../../modules/controls/tree/imfx.tree";
import { LookupSearchService } from "../../../../services/lookupsearch/common.service";
import { AreasSitesService } from "../../../../services/areas/areas.sites";
import { SlickGridProvider } from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { DebounceProvider } from "../../../../providers/common/debounce.provider";
import { JobService } from "../../../workflow/services/jobs.service";
import { WorkflowUsersComponent } from "../../../workflow/comps/users/users";
import { IMFXControlTreeProvider } from "../../../../modules/controls/tree/providers/control.tree.provider";
import { WFTasksIMFXControlTreeProvider } from "./providers/wf.tasks.tree.provider";
import { SearchFormProvider } from "../../../../modules/search/form/providers/search.form.provider";
import { WorkflowSlickGridProvider } from '../../../workflow/providers/workflow.slick.grid.provider';

@Component({
    selector: 'workflow-dd-users',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [
        LookupSearchService,
        AreasSitesService,
        WFTasksIMFXControlTreeProvider,
        {provide: IMFXControlTreeProvider, useClass: WFTasksIMFXControlTreeProvider},
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TasksUsersComponent extends WorkflowUsersComponent {
    @Input('slickGridProvider') slickGridProvider: TasksSlickGridProvider;
    @ViewChild('tree', {static: false}) public tree: IMFXControlsTreeComponent;
    public users: any[] = [];
    public preventBuildPage: boolean = false;
    constructor(public cdr: ChangeDetectorRef,
                public injector: Injector,
                public router: Router,
                public lookupSearchService: LookupSearchService,
                public areasSitesService: AreasSitesService,
                public debounceProvider: DebounceProvider,
                public jobService: JobService,
                @Inject(NotificationService) public notificationRef: NotificationService,
                public sfp: SearchFormProvider,
                public sgp: SlickGridProvider) {
        super(cdr, injector, router, lookupSearchService, areasSitesService, debounceProvider, jobService, notificationRef,
            sfp,sgp)
        this.componentContext = this;
    }

    buildWithSelected() {
        const searchModel = this.sfp.getModel();
        (<TasksSlickGridProvider>this.sgp).selectedTreeNodes = this.tree.getSelected();
        (<TasksSlickGridProvider>this.sgp).buildPage(searchModel, false, true);
    }

    getLookups() {
        this.lookupSearchService.getLookup('job-schedule-nodes')
            .subscribe(
                (data: any) => {
                    this.users = this.tree.turnArrayOfObjectToStandart(data, {
                        key: 'Id',
                        title: 'NodeName',
                        children: 'Children',
                    });
                    this.tree.setSource(this.users);
                    this.bindSbs();
                    setTimeout(() => {
                        this.tree.selectAll();
                    });
                },
                (error: any) => {
                    console.error('Failed', error);
                }
            );
    }

    onDrop(event) {
        let mode = this.slickGridProvider.wfdragmode;
        let rows = !mode ? this.slickGridProvider.getSelectedRows() : this.slickGridProvider.item;
        let node = this.tree.getNodeByEvent(event);

        let jobs = [];
        if (!mode) {
            jobs = rows.map((n) => {
                return n.ID;
            });
        } else {
            jobs = [rows.ID];
        }

        if (node) {
            let nodeObj = node.data.dirtyObj;
            let route = 'tasks';
            this.assign(nodeObj.Id, nodeObj.NodeType, jobs, 'pass', route);
        }
    }

    assign(id: number, type: string, jobs: number[] = [], action: 'pass' | 'share' | 'passclear', route) {
        this.jobService.assign(id, type, jobs, action, route).subscribe((resp) => {
            this.notificationRef.notifyShow(1, "tasks.success_assign");
            (<TasksSlickGridProvider>this.slickGridProvider).refreshGrid();
            if (this.slickGridProvider.getData().length >= 1) {
                this.slickGridProvider.setSelectedRow(0);
            }
        }, () => {
            this.notificationRef.notifyShow(2, "tasks.error_assign");
        });
    }

    // onDrop(event) {
    //     let rows = this.slickGridProvider.getSelectedRows();
    //     let node = this.tree.getNodeByEvent(event);
    //
    //     let appointmentContent = this.appointmentModal.getContent();
    //     // debugger
    //     this.appointmentModal.onShow.subscribe(() => {
    //         appointmentContent.onShow(rows, node);
    //         $.each(this.appointmentModal.onShow.observers, (k, o) => {
    //             (<any>o).unsubscribe();
    //         });
    //     });
    //     this.appointmentModal.show();
    // }
}
