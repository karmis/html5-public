import { ChangeDetectorRef, ComponentRef, ElementRef, Inject, Injector, ViewChild } from '@angular/core';
import { WorkflowService } from '../../../../services/workflow/workflow.service';
import { ComponentQCService } from '../component.qc/services/component.qc.service';
import { SplashProvider } from '../../../../providers/design/splash.provider';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MediaAppSettings } from '../../../media/constants/constants';
import { ComponentQCProvider } from '../component.qc/providers/component.qc.provider';
import { LocalStorageService } from 'ngx-webstorage';
import { NotificationService } from '../../../../modules/notification/services/notification.service';
import { JobStatuses } from '../../../workflow/constants/job.statuses';
import { Observable, Subject, Subscription } from 'rxjs';
import { PassFailOption } from '../assessment/constants/constants';
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../modules/imfx-modal/imfx-modal';
import { lazyModules } from '../../../../app.routes';
import {
    WorkflowAssessmentHistoryModalComponent
} from '../assessment/comps/history.modal/workflow.assessment.history.component';

export class DetailsSharedComponent {
    public parametersObservable: any;
    public routerChangeSubscriver: any;
    public checkId: any;
    public taskStatus: number = 0;
    public savingModel: any = {};
    public statusText: string = '';
    public isSaveButtonDisabled: boolean = false;
    public taskLockedBy: any;
    public reloadTaskStatus: Subject<any> = new Subject();
    public subtitles: Array<any>;
    public passFailOption = PassFailOption;
    public taskId: number = 0;
    public isErrorMoreInfo: Boolean = false;
    public text: string = '';
    public errorMoreInfoText: string = '';
    public error: boolean = false;
    @ViewChild('glComponent', {static: false}) glComponent: ElementRef;

    constructor(public cdr: ChangeDetectorRef,
                public workflowService: WorkflowService,
                public detailService: ComponentQCService,
                public splashProvider: SplashProvider,
                public route: ActivatedRoute,
                public router: Router,
                public location: Location,
                public injector: Injector,
                public translate: TranslateService,
                public appSettings: MediaAppSettings,
                public detailProvider,
                public localStorage: LocalStorageService,
                @Inject(NotificationService) public notificationRef: NotificationService) {
    }

    ngAfterViewInit() {
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }
        if (this.parametersObservable == null) {
            this.parametersObservable = this.route.params.subscribe(params => {
                if (params['id']) {
                    this.checkId = params['id'];
                }
            });
        }
        if (this.routerChangeSubscriver != null) {
            this.routerChangeSubscriver.unsubscribe();
        }
    }

    ngOnDestroy() {
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }
        if (this.routerChangeSubscriver != null) {
            this.routerChangeSubscriver.unsubscribe();
        }
    }

    commonUpdateDetail() {
        this.taskStatus = this.savingModel.Task.TSK_STATUS;
        this.setStatuses();
    }

    setStatuses() {
        this.statusText = this.savingModel.Task.TSK_STATUS_text;
        let data = this.localStorage.retrieve('permissions');
        this.isSaveButtonDisabled = (this.taskStatus !== JobStatuses.INPROG) || (this.savingModel.Task.LOCKED_BY && (this.savingModel.Task.LOCKED_BY !== data.FullName));
        this.taskLockedBy = this.savingModel.Task.LOCKED_BY;
        this.reloadTaskStatus.next({
            taskStatus: this.savingModel.Task.TSK_STATUS,
            taskId: this.savingModel.Task.ID,
            statusText: this.savingModel.Task.TSK_STATUS_text,
            lockedBy: this.savingModel.Task.LOCKED_BY
        });
    }

    beforeChangeTaskStatus(status): Observable<Subscription> {
        return new Observable((observer: any) => {
            let errArray = [];

            !this.isValidAcceptance() && errArray.push(this.translate.instant('component_qc.nessessary_fill_in_acceptance'));
            !this.isValidCommonCustomStatuses() && errArray.push(this.translate.instant('component_qc.nessessary_fill_in_mandatory_cu_stat'));

            if (status == 'COMPLETED' && errArray.length > 0) {
                for (let item of errArray) {
                    this.notificationRef.notifyShow(2, item);
                }
                observer.next(false);
                observer.complete();
                return;
            }

            if (!this.isSaveButtonDisabled) {
                this.save().subscribe((result: any) => {
                    if (result === true || (result && (!result.Error || result.Error == ''))) {
                        observer.next(true);
                    } else {
                        observer.next(false);
                    }
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(true);
                observer.complete();
                // });
            }
        });
    }

    isValidAcceptance() {
        let validFlag = true;
        let techRep = this.savingModel.Task.TechReport || null;
        let mandatoryQc = techRep.Settings && (techRep.Settings.Assess && techRep.Settings.Assess.PassFailOption == this.passFailOption.Mandatory) || false;

        this.savingModel.ComponentsMedia.forEach(el => {
            if (mandatoryQc
                && !(this.glComponent as any).getReadOnlyModeForMediaItem(el.MediaItem)
            ) {
                if (el.MediaItem.ACCEPTANCE_LTTR_ID == 0) {
                    validFlag = false;
                }
            }
        });

        return validFlag;
    }

    isValidCommonCustomStatuses() {
        let validFlag = true;
        let techRep = this.savingModel.Task.TechReport || null;
        let cmss = techRep && techRep.CustomMediaStatusSettings || null;
        let mandatoryCmss = (Array.isArray(cmss))
            ? cmss.filter(el => el.Mandatory)
            : [];

        if (mandatoryCmss.length === 0) {
            return true;
        }

        this.savingModel.ComponentsMedia.forEach(el => {

            if (Array.isArray(el.MediaItem.CustomStatuses) && el.MediaItem.CustomStatuses.length > 0) {
                let isEveryValid = mandatoryCmss.every(el1 => {
                    let val = el.MediaItem.CustomStatuses.find(el2 => el2.TypeId == el1.MediaStatusId)
                    return val && !!val.Values.length;
                });

                if (!isEveryValid) {
                    validFlag = false;
                }

            } else {
                validFlag = false;
            }

        });

        return validFlag;
    }

    save() {
        return new Observable((observer: any) => {
            this.savingModel.ComponentsMedia.forEach(el => {
                if (el.MediaItem.ACCEPTANCE_LTTR_ID == 0) {
                    el.IsAccepted = null;
                } else if (el.MediaItem.ACCEPTANCE_LTTR_ID == -1) {
                    el.IsAccepted = false;
                } else if (el.MediaItem.ACCEPTANCE_LTTR_ID == 1) {
                    el.IsAccepted = true;
                }
                el.Notes = this.subtitles.filter(elem => {
                    return elem.mediaId == el.MediaItem.ID;
                })[0].notes;
            });
            this.workflowService.saveComponentQC(this.savingModel).subscribe((res: any) => {
                let message = this.translate.instant('component_qc.success_save');
                this.notificationRef.notifyShow(1, message);
                observer.next(true);
            }, (err) => {
                let message = this.translate.instant('component_qc.error_save');
                this.notificationRef.notifyShow(2, message);
                observer.next(false);
                observer.complete();
            }, () => {
                observer.complete();
            });
        });
    }

    history() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.workflow_assessment_history,
            WorkflowAssessmentHistoryModalComponent, {
                title: 'simple_assessment.history_modal_title',
                size: 'xl',
                class: 'imfx-modal stretch-modal',
                position: 'center',
                ignoreBackdropClick: false,
                backdrop: true
            });

        modal.load().then((comp: ComponentRef<WorkflowAssessmentHistoryModalComponent>) => {
            const WAHMcomp: WorkflowAssessmentHistoryModalComponent = comp.instance;
            WAHMcomp.showModal(this.taskId);
        });
    }

    _isError(err) {
        this.isErrorMoreInfo = false;
        if (err.status == 500) {
            // server error
            this.text = this.translate.instant('simple_assessment.server_not_work');
        } else if (err.status == 400 || err.status == 404) {
            // element not found
            this.text = this.translate.instant('details_item.media_item_not_found');
        } else if (err.status == 0) {
            // network error
            this.text = this.translate.instant('details_item.check_network');
        }
        if (err.error && err.error.Message && err.error.Message !== '') {
            this.isErrorMoreInfo = true;
            this.errorMoreInfoText = err.error.Message;
        }
        this.splashProvider.onHideSpinner.emit();
        this.error = true;
        this.cdr.markForCheck();
        return true;
    }
}
