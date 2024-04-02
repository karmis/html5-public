import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { Router } from "@angular/router";
import { NotificationService } from "../../../../../modules/notification/services/notification.service";
import { MyTasksWizardPriorityComponentProvider } from "./providers/wizard.provider";
import { WorkflowChangePriorityModel } from "./types";
import { JobService } from "../../../services/jobs.service";
import { Subscription } from 'rxjs';


@Component({
    selector: 'wf-wizard-priority-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {provide: JobService, useClass: JobService},
        MyTasksWizardPriorityComponentProvider
    ]
})

export class MyTasksWizardPriorityComponent {
    public routerEventsSubscr: Subscription;
    // @ViewChild('controlMediaTypeFiles', {static: false}) controlMTF: IMFXControlsLookupsSelect2Component;
    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    // @ViewChild('versionWizardMediaGrid', {static: false}) public grid: VersionWizardMediaComponent;
    private data: any;
    private model: WorkflowChangePriorityModel = {
        Tasks: [],
        Priority: 0,
        UpdateChildren: true
    };

    constructor(private injector: Injector,
                public provider: MyTasksWizardPriorityComponentProvider,
                private service: JobService,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.data = this.injector.get('modalRef');
    }

    onShow() {
        this.model.Tasks = this.data.getData().Tasks;
        if (this.model.Tasks.length == 1) {
            this.model.Priority = this.data.getData().Priority[0];
        }
    }

    isSelectedPriority(val): boolean {
        return this.model.Priority == val;
    }

    onSelectPriority(val) {
        this.model.Priority = val;
    }

    onChangeUpdateChildren($event) {
        this.model.UpdateChildren = $event.target.checked;
    }

    isUpdateChildren(): boolean {
        return this.model.UpdateChildren;
    }

    apply() {
        this.service.changePriority(this.model).subscribe(() => {
            this.notificationRef.notifyShow(1, 'version.wizard.priority.success');
            this.data.modalEvents.emit({
                name: 'ok', state: {}
            });
            this.closeModal();
        }, (err) => {
            this.notificationRef.notifyShow(2, 'version.wizard.priority.error');
        });
    }

    closeModal() {
        this.data.hide();
        this.provider.modalIsOpen = false;
    }
}
