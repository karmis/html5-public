import {ChangeDetectorRef, Component, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IMFXModalComponent} from '../../../../../modules/imfx-modal/imfx-modal';
import {WorkflowWizardInfoComponentProvider} from './providers/wizard.provider';
import {IMFXTaskHistoryGridComponent} from '../../../../../modules/controls/task.history.grid/task.history.grid.component';
import {IMFXTaskAdvancedLogGridComponent} from '../../../../../modules/controls/task.advanced.log.grid/task.advanced.log.grid.component';
import {Subscription} from 'rxjs';


@Component({
    selector: 'wf-wizard-info-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        WorkflowWizardInfoComponentProvider,
    ]
    // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WorkflowWizardInfoComponent {

    @ViewChild('history', {static: false}) public historyEl: IMFXTaskHistoryGridComponent; // tab 0
    @ViewChild('advancedLog', {static: false}) public advancedLogEl: IMFXTaskAdvancedLogGridComponent; // tab 1
    public activeTab = 0;
    public routerEventsSubscr: Subscription;
    private modalRef: IMFXModalComponent;
    private modalIsOpen: boolean;
    private taskObj;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected injector: Injector,
                public provider: WorkflowWizardInfoComponentProvider,
                private cdr: ChangeDetectorRef
    ) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit() {
        // this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    showModal(task?) {
        if (!task) {
            return;
        }
        this.modalIsOpen = true;
        this.taskObj = task;

    }

    closeModal() {
        this.modalRef.hide();
        this.modalIsOpen = false;
    }

    public refreshGrid(tabId?: number) {

        if (tabId == 0) {
            if (!this.historyEl.slickGridComp) {
                return;
            }
            this.historyEl.slickGridComp.provider.refreshGrid();
        } else if (tabId == 1) {
            if (!this.advancedLogEl.slickGridComp) {
                return;
            }
            this.advancedLogEl.slickGridComp.provider.refreshGrid();
        }
    }

}


