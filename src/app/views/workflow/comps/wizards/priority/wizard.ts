import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../modules/notification/services/notification.service';
import { WorkflowWizardPriorityComponentProvider } from './providers/wizard.provider';
import { WorkflowChangePriorityModel } from './types';
import { SlickGridProvider } from '../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { JobService } from '../../../services/jobs.service';
import { WorkflowSlickGridProvider } from '../../../providers/workflow.slick.grid.provider';
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
        {provide: SlickGridProvider, useClass: WorkflowSlickGridProvider},
        WorkflowWizardPriorityComponentProvider
    ]
})

export class WorkflowWizardPriorityComponent {
    // @ViewChild('controlUsageTypes', {static: false}) controlUsageTypes: IMFXControlsLookupsSelect2Component;
    // @ViewChild('controlMediaTypeFiles', {static: false}) controlMTF: IMFXControlsLookupsSelect2Component;
    public routerEventsSubscr: Subscription;
    // @ViewChild('versionWizardMediaGrid', {static: false}) public grid: VersionWizardMediaComponent;
    private data: any;
    private model: WorkflowChangePriorityModel = {
        Jobs: [],
        Priority: 0,
        UpdateChildren: true
    };
    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;

    constructor(private injector: Injector,
                public provider: WorkflowWizardPriorityComponentProvider,
                private service: JobService,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.data = this.injector.get('modalRef');

    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    onShow() {
        this.model.Jobs = this.data.getData().Jobs;
        if (this.model.Jobs.length == 1) {
            this.model.Priority = this.data.getData().Priority[0];
        }
    }

    isSelectedPriority(val): boolean {
        return this.model.Priority === val;
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
        let self = this;
        this.service.changePriority(this.model).subscribe(() => {
            self.notificationRef.notifyShow(1, 'version.wizard.priority.success');
            self.data.modalEvents.emit({
                name: 'ok', state: {}
            });
            self.closeModal();
        }, (err) => {
            self.notificationRef.notifyShow(2, 'version.wizard.priority.error');
        });
    }

    closeModal() {
        this.data.hide();
        this.provider.modalIsOpen = false;
    }
}
