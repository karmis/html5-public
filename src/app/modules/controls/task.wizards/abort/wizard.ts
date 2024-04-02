import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TasksControlButtonsService } from '../../../search/tasks-control-buttons/services/tcb.service';
import { NotificationService } from '../../../notification/services/notification.service';
import { TaskWizardAbortComponentProvider } from './providers/wizard.provider';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'task-wizard-abort-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        TasksControlButtonsService,
        TaskWizardAbortComponentProvider,
    ]
})

export class TaskWizardAbortComponent {
    // public routerEventsSubscr: Subscription;
    private data: any;
    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    @ViewChild('abortReason', {static: true}) private abortReason : ElementRef;
    private validForm: boolean = true;
    private reasonText: string = '';
    private requestMessage: string = '';
    private firstStep = 0;
    private lastStep = 1;
    private currentStep = 0;
    private isSuccessRes: boolean = null;
    private mode: 'single' | 'multiple' = 'single';

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                public provider: TaskWizardAbortComponentProvider,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        // modal data
        this.data = this.injector.get('modalRef');
        // ref to component
        this.provider.moduleContext = this;
        this.mode = this.data._data.data.mode;
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    ngAfterViewInit() {
        this.abortReason.nativeElement.focus();
    }

    onShow() {
    }

    onSelect() {
    }

    isSelected(): boolean {
        return false;
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
        /*if (!this.reasonText) {
            this.validForm = false;
        } else {
            this.validForm = true;
        }*/
        this.validForm = true;
        this.cdr.detectChanges();
    }

    getFinishStepTitle() {
        let finishStepTitle = (this.isSuccessRes === false)
            ? 'workflow.topPanel.wizard.abort.failed'
            : 'workflow.topPanel.wizard.abort.finished';
        return finishStepTitle;
    }

    sendStatus() {
        // if (!this.reasonText) {
        //     this.validForm = false;
        //     this.cdr.detectChanges();
        // } else {
            this.validForm = true;
            this.currentStep = 1;
            this.cdr.detectChanges();
            let tcbs = this.injector.get(TasksControlButtonsService);
            if (this.mode == 'single') {
                tcbs.restartTask(this.data._data.data.taskIds[0], this.reasonText).subscribe((res: any) => {
                        if (!!res.error) {
                            this.requestMessage = res.error;
                        } else {
                            this.requestMessage = 'Restart has been successful';
                            this.isSuccessRes = true;
                            setTimeout(() => {
                                this.data.modalEvents.emit({
                                    name: 'ok', state: {}
                                });
                            });
                        }
                        this.cdr.detectChanges();
                    }
                    , (err: HttpErrorResponse) => {
                        let _err = err.error;
                        this.requestMessage = _err.Error;
                        this.isSuccessRes = false;
                        this.cdr.detectChanges();
                    });
            } else {
                tcbs.restartTasks(this.data._data.data.taskIds, this.reasonText).subscribe((res: any) => {
                        if (!!res.error) {
                            this.requestMessage = res.error;
                        } else {
                            this.requestMessage = 'Restart has been successful';
                            this.isSuccessRes = true;
                            setTimeout(() => {
                                this.data.modalEvents.emit({
                                    name: 'ok', state: {}
                                });
                            });
                        }
                        this.cdr.detectChanges();
                    }
                    , (err: HttpErrorResponse) => {
                        let _err = err.error;
                        this.requestMessage = _err.Error;
                        this.isSuccessRes = false;
                        this.cdr.detectChanges();
                    });

            }
        //}
    }
}
