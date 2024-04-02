import { ChangeDetectorRef, ComponentRef, Injector, ViewChild } from '@angular/core';
import { TasksControlButtonsComponent } from '../search/tasks-control-buttons/tcb';
import { Subject } from 'rxjs/Subject';
import { PassFailOption } from '../../views/detail/tasks/assessment/constants/constants';
import { JobStatuses } from '../../views/workflow/constants/job.statuses';
import { GoldenProvider } from '../search/detail/providers/gl.provider';
import { DetailConfig } from '../search/detail/detail.config';
import { SegmentingProvider } from '../../views/detail/tasks/segmenting/providers/segmenting.provider';
import { DetailService } from '../search/detail/services/detail.service';
import { MediaAppSettings } from '../../views/media/constants/constants';
import { LocalStorageService } from 'ngx-webstorage';
import { GLAssessmentComponent } from '../../views/detail/tasks/assessment/gl.component';
import { NotificationService } from '../notification/services/notification.service';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import { mergeMap } from 'rxjs/operators';
import { IMFXModalProvider } from '../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { lazyModules } from '../../app.routes';
import {
    WorkflowAssessmentHistoryModalComponent
} from '../../views/detail/tasks/assessment/comps/history.modal/workflow.assessment.history.component';
import { SegmentingService } from '../../views/detail/tasks/segmenting/services/segmenting.service';
import { AssessmentService } from '../../views/detail/tasks/assessment/services/assessment.service';
import { TranslateService } from '@ngx-translate/core';
import { SplashProvider } from '../../providers/design/splash.provider';

export interface ConfigComponent {
    typeDetailsLocal: null | 'simple_assessment' | 'segmenting';
    titleForStorage: null | 'assessment' | 'segmenting';
}

export abstract class SimpleGoldenComponent {
    @ViewChild('glComponent', {static: false}) glComponent: GLAssessmentComponent;
    @ViewChild('tasksControlButtons', {static: false}) tasksControlButtons: TasksControlButtonsComponent;
    public onSave: Subject<any> = new Subject();
    public onErrorSave: Subject<any> = new Subject();
    public reloadTaskStatus: Subject<any> = new Subject();
    public checkId: any;
    public isSaveButtonDisabled: boolean = true;
    public parametersObservable: any;
    public routerChangeSubscriver: any;
    public text: string = '';
    public error: boolean = false;
    public isErrorMoreInfo: Boolean = false;
    public errorMoreInfoText: string = '';
    public taskStatus: number = 0;
    public taskId: number = 0;
    public statusText: string = '';
    public dataChanged: boolean = false;
    public taskLockedBy: string = null;
    public passFailOption = PassFailOption;
    public isDisabledEditSom = true;
    public defaultGoldenConfig = {
        componentContext: this,
        appSettings: <any>null,
        providerType: <GoldenProvider>null,
        options: {
            file: {},
            groups: [],
            friendlyNames: {},
            typeDetailsLocal: null,
            typeDetails: <string>null,
            tabs: [],
            params: <any>null,
            series: <any>null,
            titleForStorage: null
        }
    };
    public config = <DetailConfig>{
        componentContext: <any>null,
        options: {
            _accordions: [],
            tabsData: [],
            file: {},
            userFriendlyNames: {},
            mediaParams: {
                addPlayer: false,
                addMedia: false,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            },
            typeDetailsLocal: null,
            providerDetailData: <any>null,
            provider: <SegmentingProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            typeDetails: 'media-details',
            detailsviewType: 'MediaDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            showGolden: false,
            defaultThumb: './assets/img/default-thumb.png',
            clipBtns: true,
            disabledClipBtns: false
        },
        moduleContext: this,
        providerType: GoldenProvider
    };
    public goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);
    private configComponent: ConfigComponent = {
        typeDetailsLocal: null,
        titleForStorage: null,
    }
    public taskActionInProgress = false;
    public videoInfo;  // use in provider
    protected constructor(configComponent,
                          public provider,
                          public detailService: DetailService,
                          public appSettings: MediaAppSettings,
                          public localStorage: LocalStorageService,
                          public notificationRef: NotificationService,
                          public router: Router,
                          public route: ActivatedRoute,
                          public injector: Injector,
                          public service: SegmentingService | AssessmentService,
                          public translate: TranslateService,
                          public splashProvider: SplashProvider,
                          public cd: ChangeDetectorRef,
                          ) {
        this.configComponent = configComponent;
        this.defaultGoldenConfig.options.typeDetailsLocal = configComponent.typeDetailsLocal;
        this.defaultGoldenConfig.options.titleForStorage = configComponent.titleForStorage;
        this.goldenConfig = $.extend(true, {}, this.defaultGoldenConfig);
        this.config.options.typeDetailsLocal = configComponent.typeDetailsLocal;
        // detail provider
        this.config.options.provider = this.provider;
        this.config.options.provider.moduleContext = this;
        this.config.options.service = this.detailService;
        this.config.options.appSettings = this.appSettings;
        (<any>this.config.options.provider).setTaskStatus.subscribe(res => {
            this.taskStatus = res.taskStatus;
            this.taskId = res.taskId;
            this.statusText = res.statusText;
            let data = this.localStorage.retrieve('permissions');
            this.isSaveButtonDisabled = (this.taskStatus !== JobStatuses.INPROG) || (res.lockedBy && (res.lockedBy !== data.FullName));
            this.taskLockedBy = res.lockedBy;
            this.reloadTaskStatus.next(res);
        });

    }

    ngOnDestroy() {
        this.notificationRef.notifyHide();
        if (this.parametersObservable != null) {
            this.parametersObservable.unsubscribe();
        }
        if (this.routerChangeSubscriver != null) {
            this.routerChangeSubscriver.unsubscribe();
        }
    }

    ngAfterViewInit(pathUrl) {
        let self = this;
        if (!self.checkId) {
            if (this.parametersObservable != null) {
                this.parametersObservable.unsubscribe();
            }
            this.config.options.provider.config = this.config;
            if (this.parametersObservable == null) {
                this.parametersObservable = this.route.params.subscribe(params => {
                    if (params['id']) {
                        self.checkId = params['id'];
                    }
                });
            }
            if (this.routerChangeSubscriver != null) {
                this.routerChangeSubscriver.unsubscribe();
            }

            this.routerChangeSubscriver = this.router.events.subscribe(event => {
                if (event instanceof RoutesRecognized && event.url.indexOf('/' + pathUrl + '/') > -1) {
                    let first = event.state.root.firstChild.firstChild;
                    let id = first && event.state.root.firstChild.firstChild.params['id'];
                    if (id != self.checkId) {
                        self.checkId = id;
                        new Promise((resolve, reject) => {
                            resolve();
                        }).then(
                            () => {
                                self.commonDetailInit(false);
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                    }
                }
            });
        }

        this.commonDetailInit(null);

        this.tasksControlButtons.onSavedStatus.subscribe(res => {
            (<any>this.config.options.provider).taskFile.TSK_STATUS = res.status;
            (<any>this.config.options.provider).taskFile.LOCKED_BY = res.lockedBy;
            let data = this.localStorage.retrieve('permissions');
            this.isSaveButtonDisabled = (res.status !== JobStatuses.INPROG) || (res.lockedBy !== data.FullName);
            (<any>this.glComponent).setReadOnlyMode();
        });
    }

    commonDetailInit(firstInit) {
        this.config.options.provider.commonDetailInit(firstInit);
    }

    isHasActions() {
        return this.provider &&
            this.provider.taskFile &&
            this.provider.taskFile.TechReport &&
            this.provider.taskFile.TechReport.Settings &&
            this.provider.taskFile.TechReport.Settings.General &&
            this.provider.taskFile.TechReport.Settings.General.TaskActionSettings.ActionSettings &&
            this.provider.taskFile.TechReport.Settings.General.TaskActionSettings.ActionSettings.length > 0 ||
            false;
    }

    public setControlButtonsReadOnly() {
        this.tasksControlButtons.setReadOnly();
    }

    /**
     * Calling on Back button clicking. Go back to Media page
     */
    clickBack() {
        this.config.options.provider.clickBack();
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    save() {
        (<any>this.glComponent).ValidateAndUpdateTabs().pipe(
            mergeMap(data => this.config.options.provider.updateAndSaveMediaItems(data))
        ).subscribe(data => {
        });
    }

    history() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.workflow_assessment_history,
            WorkflowAssessmentHistoryModalComponent, {
                title: this.configComponent.typeDetailsLocal + '.history_modal_title',
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

    updateAndSaveMediaItems(data) {
        data.isCompleted = false;
        this.config.options.provider.updateAndSaveMediaItems(data).subscribe(result => {
        });
    }

    setDataChanged(res) {
        this.dataChanged = res;
    }

    isValidAcceptance() {
        let validFlag = true;
        let techRep = this.provider.taskFile.TechReport || null;
        let mandatoryQc = techRep.Settings && (techRep.Settings.Assess && techRep.Settings.Assess.PassFailOption == this.passFailOption.Mandatory) || false;

        this.provider.mediaItems.forEach(el => {
            if (mandatoryQc
                && !(this.glComponent as any).getReadOnlyModeForMediaItem(el)
            ) {
                if (el.ACCEPTANCE_LTTR_ID == 0) {
                    validFlag = false;
                }
            }
        });
        return validFlag;
    }

    doTaskAction(actionId) {
        if(this.taskActionInProgress)
            return;
        this.taskActionInProgress = true;
        (<any>this.glComponent).ValidateAndUpdateTabs().pipe(
            mergeMap(data => this.config.options.provider.updateAndSaveMediaItems(data))
        ).subscribe((data) => {
                if(data) {
                    this.service.doTaskAction(this.taskId, actionId).subscribe((res) => {
                            this.notificationRef.notifyShow(1, this.translate.instant("simple_assessment.action_success"));
                            this.taskActionInProgress = false;
                        },
                        (err) => {
                            const errMessage = err.error.Error || err.error.Message || err.error.message || this.translate.instant("common.error_unknown");
                            this.notificationRef.notifyShow(2, errMessage);
                            this.taskActionInProgress = false;
                        });
                }
                else
                    this.taskActionInProgress = false;
            },
            (err) => {
                this.taskActionInProgress = false;
            });
    }



    isValidCommonCustomStatuses(mediaItems: any[] = []) {
        let validFlag = true;
        let techRep = this.provider.taskFile.TechReport || null;
        let cmss = techRep && techRep.CustomMediaStatusSettings || null;
        let mandatoryCmss = (Array.isArray(cmss))
            ? cmss.filter(el => el.Mandatory)
            : [];

        if (mandatoryCmss.length === 0) {
            return true;
        }

        mediaItems.forEach(el => {
            if (Array.isArray(el.CustomStatuses) && el.CustomStatuses.length > 0) {
                let isEveryValid = mandatoryCmss.every(el1 => {
                    let val = el.CustomStatuses.find(el2 => el2.TypeId == el1.MediaStatusId)
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

    _isError(err) {
        this.isErrorMoreInfo = false;
        if (err.status == 500) {
            // server error
            this.text = this.translate.instant('segmenting.server_not_work');
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
        this.cd.markForCheck();
        return true;
    }

    toggleMoreInfoPopup($event) {
        let popup = $event.currentTarget.children[0];
        popup.classList.add('visible');

        let cb = function f(e) {
            popup.classList.remove('visible');
            document.removeEventListener('click', f);
        }
        $event.stopPropagation();
        document.addEventListener('click', cb);
    }

    public setErrors(observer, data) {
        let errArray = [];
        !this.isValidAcceptance() && errArray.push(this.translate.instant('component_qc.nessessary_fill_in_acceptance'));
        !this.isValidCommonCustomStatuses([data.mediaItem]) && errArray.push(this.translate.instant('component_qc.nessessary_fill_in_mandatory_cu_stat'));

        if (status == 'COMPLETED' && errArray.length > 0) {
            for (let item of errArray) {
                this.notificationRef.notifyShow(2, item);
            }
            observer.next(false);
            observer.complete();
            return;
        }

        if (status !== 'COMPLETED') {
            data.valid = true;
            data.isCompleted = false;
        } else {
            data.isCompleted = true;
        }
        this.config.options.provider.updateAndSaveMediaItems(data).subscribe((result: any) => {
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
    }
}
