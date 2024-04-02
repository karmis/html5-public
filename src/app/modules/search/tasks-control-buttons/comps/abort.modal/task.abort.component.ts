import {
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { IMFXModalComponent } from "../../../../imfx-modal/imfx-modal";
import { TaskAbortComponentProvider } from "./providers/task.abort.provider";
import { NotificationService } from "../../../../notification/services/notification.service";
import { Subscription } from 'rxjs';
import {JobStatuses} from "../../../../../views/workflow/constants/job.statuses";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'task-abort-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TaskAbortComponentProvider]
})

export class TaskAbortComponent {
    public routerEventsSubscr: Subscription;
    protected reasonText: string = '';
    private data: any;
    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    private modalRef: IMFXModalComponent;
    private requestMessage: string = '';
    private abortRequest: string = 'ABORT';
    private curretStatusIsFailed: boolean = false;
    private valid: boolean = true;
    private valid_error: string = '';

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                public provider: TaskAbortComponentProvider,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                @Inject(TranslateService) protected translate: TranslateService) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.data = this.injector.get('modalRef');
        this.curretStatusIsFailed = (this.data._data.data.taskCurrentStatus == JobStatuses.FAILED);
    }

    /**
     * Hide modal
     */
    closeModal() {
        this.data.hide();
        this.provider.modalIsOpen = false;
    }

    doTextareaValueChange($event) {
        this.reasonText = $event.currentTarget.value;
        this.valid = true;
        this.cdr.detectChanges();
    }

    sendReset() {
        this.valid = true;
        this.valid_error = '';
        this.abortRequest = 'ABORT';
        this.sendStatus();
    };

    sendFail() {
        if(this.validate()) {
            this.abortRequest = 'FAILED';
            this.sendStatus();
        }
    }

    sendStatus() {
        this.data.modalEvents.emit({
            name: 'ok', state: {status: this.abortRequest, reasonText: this.reasonText}
        });
        this.closeModal();
    }
    validate() {
        this.valid = true;
        this.valid_error = '';
        if (!this.reasonText || this.reasonText == ''){
            this.valid = false;
            this.valid_error = this.translate.instant('component_qc.empty_message_error');
        }
        this.cdr.detectChanges();
        return this.valid;
    }
}
