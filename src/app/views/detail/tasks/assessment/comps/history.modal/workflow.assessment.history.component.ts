import { ChangeDetectorRef, Component, Injector, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IMFXModalComponent } from '../../../../../../modules/imfx-modal/imfx-modal';
import { Subscription } from 'rxjs';


@Component({
    selector: 'workflow-assessment-history-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WorkflowAssessmentHistoryModalComponent {

    public routerEventsSubscr: Subscription;
    private modalRef: IMFXModalComponent;
    private modalIsOpen: boolean;
    private assessmentId;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected injector: Injector,
                private cdr: ChangeDetectorRef
    ) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit() {
        // this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    showModal(assessmentId: number) {
        this.modalIsOpen = true;
        this.assessmentId = assessmentId;

    }

    closeModal() {
        this.modalRef.hide();
        this.modalIsOpen = false;
    }

}

