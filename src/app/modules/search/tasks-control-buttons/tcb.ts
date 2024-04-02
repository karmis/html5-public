/**
 * Created by Sergey Trizna on 13.03.2018.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JobStatuses, JobTextStatuses } from "../../../views/workflow/constants/job.statuses";
import { TasksControlButtonsService } from "./services/tcb.service";
import { IMFXModalProvider } from "../../imfx-modal/proivders/provider";
import { IMFXModalEvent } from "../../imfx-modal/types";
import { TaskAbortComponent } from "./comps/abort.modal/task.abort.component";
import { TaskPendingComponent } from "./comps/pending.modal/task.pending.component";
import { NotificationService } from '../../notification/services/notification.service';
import { Subject } from "rxjs";
import * as _ from 'lodash';
import { IMFXModalComponent } from "../../imfx-modal/imfx-modal";
import { IMFXModalAlertComponent } from "../../imfx-modal/comps/alert/alert";
import { LocalStorageService } from "ngx-webstorage";
import { Router } from "@angular/router";
import { lazyModules } from "../../../app.routes";
import { Select2ItemType } from '../../controls/select2/types';

export interface TCBStateButtonType {
    visibility?: boolean;
    enabled?: boolean;
}

export type OnSavedTaskStatusType = {
    prevStatus: number,
    prevStatusText: string,
    status: number,
    statusText: string,
    lockedBy?: string
};

export type AssignDataType = { status: string, reasonText: string, assignTo: Select2ItemType | null }

@Component({
    selector: 'tasks-control-buttons',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    providers: [
        TasksControlButtonsService,
        IMFXModalProvider
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TasksControlButtonsComponent {
    @Input() commonUpdateDetailSubject: Subject<void>;
    @Input() reloadStatus: Subject<any>;
    @Input() taskFile: any;
    public data: any;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public onSavedStatus: EventEmitter<OnSavedTaskStatusType> = new EventEmitter<OnSavedTaskStatusType>();
    public modal;
    @Input('readonly') protected readonly: boolean = false;
    @Input('status') private status: number = 0;
    @Input('statusText') private statusText: string = '';
    @Input('taskId') private taskId: number = 0;
    @Input('callback') private callback: any = null;
    @Input('lockedBy') private lockedBy: string = null;
    @Input('statusMode') private statusMode: boolean = false;
    private compRef = this;
    private showOverlay: boolean = false;
    private error: boolean = false;
    private text: string = '';
    private btnComp: TCBStateButtonType = {visibility: true, enabled: true};
    private btnResm: TCBStateButtonType = {visibility: false, enabled: true};
    private btnStrt: TCBStateButtonType = {visibility: false, enabled: true};
    private btnAbrt: TCBStateButtonType = {visibility: true, enabled: true};
    private btnPaus: TCBStateButtonType = {visibility: true, enabled: true};
    private btnPend: TCBStateButtonType = {visibility: true, enabled: true};
    private btnUnlock: TCBStateButtonType = {visibility: true, enabled: true};
    private routerEventsSubscr;

    constructor(private injector: Injector,
                private tcbService: TasksControlButtonsService,
                private cd: ChangeDetectorRef,
                private translate: TranslateService,
                private router: Router,
                private modalProvider: IMFXModalProvider,
                private localStorage: LocalStorageService,
                private notificationService: NotificationService) {
        this.routerEventsSubscr = this.router.events.subscribe((res: any) => {
            this.error = false;
            this.text = '';
        })
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.reloadStatus.subscribe((res: any) => {
            this.status = res.taskStatus;
            this.taskId = res.taskId;
            this.statusText = res.statusText;
            this.lockedBy = res.lockedBy;
            this.setTaskStatus();
        });
        this.setTaskStatus();
        this.cd.detectChanges();
    }

    setReadOnly() {
        alert();
        this.btnComp.enabled = false;
        this.btnResm.enabled = false;
        this.btnStrt.enabled = false;
        this.btnAbrt.enabled = false;
        this.btnPaus.enabled = false;
        this.btnPend.enabled = false;
        this.btnUnlock.visibility = false;
        this.cd.detectChanges();
    }

    setTaskStatus(status?: number, lockedBy?: string) {
        if (status) {
            this.status = status;
        }
        if (lockedBy) {
            this.lockedBy = lockedBy;
        }
        this.btnComp = {visibility: true, enabled: true};
        this.btnResm = {visibility: false, enabled: true};
        this.btnStrt = {visibility: false, enabled: true};
        this.btnAbrt = {visibility: true, enabled: true};
        this.btnPaus = {visibility: true, enabled: true};
        this.btnPend = {visibility: true, enabled: true};
        this.btnUnlock = {visibility: false, enabled: true};
        switch (this.status) {
            case JobStatuses.READY:
                this.btnComp.visibility = false;
                this.btnResm.visibility = false;
                this.btnStrt.visibility = true;
                this.btnAbrt.enabled = this.btnPaus.enabled = this.btnPend.enabled = false;
                this.statusText = JobTextStatuses.READY;
                break;
            case JobStatuses.PEND:
                this.btnComp.visibility = false;
                this.btnResm.visibility = true;
                this.btnStrt.visibility = false;
                this.btnPaus.enabled = this.btnPend.enabled = false;
                this.statusText = JobTextStatuses.PEND;
                break;
            case JobStatuses.COMPLETED:
                this.btnAbrt.enabled = this.btnComp.enabled = this.btnPaus.enabled = this.btnPend.enabled = false;
                this.statusText = JobTextStatuses.COMPLETED;
                break;
            case JobStatuses.INPROG:
                this.statusText = JobTextStatuses.INPROG;
                // do nothing
                break;
            case JobStatuses.FAILED:
                this.btnComp.enabled = this.btnPaus.enabled = this.btnPend.enabled = false;
                this.statusText = JobTextStatuses.FAILED;
                break;
            case JobStatuses.PAUSED:
                this.btnComp.visibility = false;
                this.btnResm.visibility = true;
                this.btnStrt.visibility = false;
                this.btnPend.enabled = false;
                this.btnPaus.enabled = false;
                this.statusText = JobTextStatuses.PAUSED;
                break;
            default:
                this.btnAbrt.enabled = this.btnComp.enabled = this.btnPaus.enabled = this.btnPend.enabled = false;
                this.statusText = '';
                break;
        }
        if (this.lockedBy) {
            let data = this.localStorage.retrieve('permissions');
            if (this.lockedBy !== data.FullName) {
                this.btnComp.enabled = false;
                this.btnResm.enabled = false;
                this.btnStrt.enabled = false;
                this.btnAbrt.enabled = false;
                this.btnPaus.enabled = false;
                this.btnPend.enabled = false;
                this.btnUnlock.visibility = true;
            }
        }

        if (this.readonly) {
            this.setReadOnly();
        }

        this.cd.markForCheck();
    };

    tryToSaveTaskStatus(status, reasonText?: string, assignToUser?:number) {
        if (this.readonly){
            return false;
        }
        switch (this.status) {
            case JobStatuses.INPROG: {
                let canSaveStatus = true;
                if (this.callback && this.callback.btnComp) {
                    this.callback.btnComp.callback.call(this.callback.btnComp.context, status).subscribe((res: any) => {
                        canSaveStatus = res;
                        if (canSaveStatus) {
                            this.saveTaskStatus(status, reasonText, assignToUser);
                        }
                    });
                } else {
                    this.saveTaskStatus(status, reasonText, assignToUser);
                }
                break;
            }
            default: {
                this.saveTaskStatus(status, reasonText, assignToUser);
                break;
            }
        }
    }

    saveTaskStatus(status, reasonText?: string, assignToUser?:number) {
        if (this.readonly){
            return false;
        }
        this.showOverlay = true;
        let prevStatus = _.clone(this.status);
        let prevStatusText = _.clone(this.statusText);
        let preErrorText = '<span>' + this.translate.instant('tasks.error_changing_status') + '</span>';
        this.tcbService.saveTaskStatus(this.taskId, status, reasonText, preErrorText).subscribe((res: any) => {
                if (res.Error != '' && res.Error != null) {
                    this.notificationService.notifyShow(2, res.Error);
                } else {
                    this.notificationService.notifyShow(1, 'simple_assessment.save_status_success');
                }
                this.status = res.Status;
                if (this.status == JobStatuses.INPROG || this.status == JobStatuses.RESUME) {
                    let data = this.localStorage.retrieve('permissions');
                    this.setTaskStatus(this.status, data.FullName);
                } else {
                    this.setTaskStatus(this.status);
                }

                if (assignToUser != undefined) {
                    this.tcbService.assignTaskTo(this.taskId, assignToUser).subscribe((res) => {
                        this.postSaveTaskStatus(prevStatus, prevStatusText);
                    })
                } else {
                    this.postSaveTaskStatus(prevStatus, prevStatusText);
                }
            },
            (error) => {
                this._isError(error);
            });
    }

    postSaveTaskStatus(prevStatus, prevStatusText) {
        if(this.commonUpdateDetailSubject) {
            this.commonUpdateDetailSubject.next();

            this.showOverlay = false;
            this.error = false;
            this.onSavedStatus.emit(<OnSavedTaskStatusType>{
                prevStatus: prevStatus,
                prevStatusText: prevStatusText,
                status: this.status,
                statusText: this.statusText,
                lockedBy: this.lockedBy
            });

            this.cd.detectChanges();
        }
    }

    openAbortWizard() {
        if (this.readonly) {
            return false;
        }
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.tcb_abort,
            TaskAbortComponent, {
                size: 'lg',
                title: 'component_qc.abort',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            },
            {
                taskId: this.taskId,
                taskCurrentStatus: this.status
            });
        modal.load().then(() => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.tryToSaveTaskStatus(
                        e.state.status,
                        e.state.reasonText,
                        e.state.assignTo?e.state.assignTo:null);
                }
            });
        });
    }

    // workflow -> 182606 item -< Pending
    openPendingWizard() {
        if (this.readonly) {
            return false;
        }
        // Task Status Selector
        this.modal = this.modalProvider.show(TaskPendingComponent, {
                size: 'lg',
                title: 'component_qc.pending_title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            },
            {
                taskId: this.taskId,
                taskFile: this.taskFile||{}
            });
        this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name == 'ok') {
                this.tryToSaveTaskStatus(
                    e.state.status,
                    e.state.reasonText,
                    e.state.assignTo?e.state.assignTo:null);
            }
        });
    }

    _isError(err) {
        let _error = err.error && err.error.Error || '';

        if (!!_error) {
            this.text = _error;
        } else {
            if (err.status == 500) {
                // server error
                this.text = this.translate.instant('common_server_errors.server_not_work');
                if (this.status == JobStatuses.READY) {
                    this.text = this.translate.instant('simple_assessment.request_timeout');
                }
                let __error = err.error && err.error.Message;
                if (__error) {
                    this.notificationService.notifyShow(2, __error);
                }
            } else if (err.status == 400) {
                this.text = this.translate.instant('common_server_errors.item_not_found');
            } else if (err.status == 404) {
                // element not found
                this.text = this.translate.instant('common_server_errors.bad_request');
            } else if (err.status == 0) {
                // network error
                this.text = this.translate.instant('common_server_errors.check_network');
            } else if (err.status == 408 || err.status == 504) {
                // timeout
                this.text = this.translate.instant('simple_assessment.request_timeout');
            }
        }
        this.showOverlay = false;
        this.error = true;
        this.cd.markForCheck();
        return true;

    }

    public changeStatusForBtn(propName, options: TCBStateButtonType) {
        if (this.readonly) {
            return false;
        }
        this[propName] = $.extend(true, {}, this[propName], options);
        this.cd.markForCheck();
    }

    public unlockTask() {
        if (this.readonly) {
            return false;
        }
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {

            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'simple_assessment.unlock_task_confirm'
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                    let prevStatus = _.clone(this.status);
                    let prevStatusText = _.clone(this.statusText);
                    this.tcbService.unlockTask(this.taskId).subscribe((res: any) => {
                            if (res.Error != '' && res.Error != null) {
                                this.notificationService.notifyShow(2, res.Error);
                            } else {
                                this.notificationService.notifyShow(1, 'simple_assessment.unlock_task_success');
                                this.lockedBy = null;
                            }
                            this.status = res.Status;
                            this.setTaskStatus();
                            this.cd.detectChanges();
                            this.onSavedStatus.emit(<OnSavedTaskStatusType>{
                                prevStatus: prevStatus,
                                prevStatusText: prevStatusText,
                                status: this.status,
                                statusText: this.statusText,
                                lockedBy: this.lockedBy
                            });
                        },
                        (error) => {
                            this._isError(error);
                        });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });

    }
}
