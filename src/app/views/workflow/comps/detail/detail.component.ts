import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { WorkflowService } from '../../../../services/workflow/workflow.service';
import { ConfigService } from '../../../../services/config/config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import * as $ from 'jquery';
import { SplashProvider } from '../../../../providers/design/splash.provider';
import { TranslateService } from '@ngx-translate/core';
import { SlickGridComponent } from "../../../../modules/search/slick-grid/slick-grid";
import { SlickGridProvider } from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../../../modules/search/slick-grid/services/slick.grid.service";
import { SlickGridColumn, SlickGridResp } from "../../../../modules/search/slick-grid/types";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../../modules/search/slick-grid/slick-grid.config";
import { WorkflowSlickGridProvider } from "../../providers/workflow.slick.grid.provider";
import { Subscription } from 'rxjs/Subscription';
import { IMFXRouteReuseStrategy } from '../../../../strategies/route.reuse.strategy';
import { Observable, Subject } from "rxjs/Rx";
import { TasksControlButtonsComponent } from "../../../../modules/search/tasks-control-buttons/tcb";
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { WorkflowProvider } from '../../../../providers/workflow/workflow.provider';
import { IMFXModalComponent } from "../../../../modules/imfx-modal/imfx-modal";
import { IMFXModalAlertComponent } from "../../../../modules/imfx-modal/comps/alert/alert";
import { IMFXModalEvent } from "../../../../modules/imfx-modal/types";
import { IMFXModalProvider } from "../../../../modules/imfx-modal/proivders/provider";
import { JobService } from "../../services/jobs.service";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { appRouter } from "../../../../constants/appRouter";
import { TaskWizardAbortComponent } from "../../../../modules/controls/task.wizards/abort/wizard";
import { WorkflowChangeByModalComponent } from "../changeby/changeby";
import { WorkflowWizardPriorityComponent } from "../wizards/priority/wizard";
import { of } from "rxjs";
import { lazyModules } from "../../../../app.routes";
import { SettingsFormatter } from "../../../../modules/search/slick-grid/formatters/settings/settings.formatter";

@Component({
    moduleId: 'workflow-details',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        WorkflowProvider,
        WorkflowService,
        SlickGridProvider,
        SlickGridService,
        WorkflowSlickGridProvider,
        {provide: SlickGridProvider, useClass: WorkflowSlickGridProvider}
    ],
})
export class WorkflowDetailComponent {
    //@ViewChild('jointModule') private joint;
    @ViewChild('tasksControlButtons', {static: false}) tasksControlButtons: TasksControlButtonsComponent;
    @ViewChild('flowchartModule', {static: false}) private flowchartModule;
    @ViewChild('flowChartArea', {static: false}) private flowChartArea;
    @ViewChild('overlay', {static: true}) private overlay: any;
    @ViewChild('workflow', {static: true}) private workflow: any;
    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";
    private selectedTask;
    private error: boolean = false;
    private text: string = '';
    private typeDetails: string = 'workflow-details';
    private tableColumns: SlickGridColumn[] = [
        {
            isFrozen: true,
            id: -6,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: SettingsFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'settings',
            __deps: {
                injector: this.injector
            }
        },
        {
            id: '1',
            name: 'Timestamp',
            field: 'TIMESTAMP',
            width: 150,
            resizable: true,
            sortable: true,
            multiColumnSort: false
        },
        {
            id: '2',
            name: 'Action',
            field: 'ActionText',
            width: 70,
            resizable: true,
            sortable: true,
            multiColumnSort: false
        },
        {
            id: '3',
            name: 'Operator ID',
            field: 'OPERATOR_ID',
            width: 80,
            resizable: true,
            sortable: true,
            multiColumnSort: false
        },
        {
            id: '4',
            name: 'Notes',
            field: 'NOTES',
            minWidth: 300,
            cssClass: 'wrap-prew-rap',
            resizable: true,
            sortable: true,
            multiColumnSort: false
        },
    ];

    @ViewChild('slickGridSelectedTask', {static: false}) private slickGridComp: SlickGridComponent;
    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                },
                selectFirstRow: false,
                externalWrapperEl: "#externalWrapperSelectTask",
                popupsSelectors: {
                    'settings': {
                        'popupEl': '#copyPopup'
                    }
                },
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 30,
                fullWidthRows: true,
                forceFitColumns: false,
                multiAutoHeight: true
            }
        })
    });
    private details: any;
    private refreshTimer;
    private destroyed$: Subject<any> = new Subject();
    private routeSub: Subscription;
    private taskIndex = 0;
    private taskAllowed = false;
    private markResolvedAllowed = false;
    private refreshSubject = new Subject();


    private taskCallback: any = {
        btnComp: {
            callback: this.changeTaskCallback,
            context: this
        }
    };

    reloadTaskStatus: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private workflowService: WorkflowService,
                private splashProvider: SplashProvider,
                private modalProvider: IMFXModalProvider,
                private notificationRef: NotificationService,
                private jobService: JobService,
                private route: ActivatedRoute,
                private router: Router,
                public location: Location,
                private translate: TranslateService,
                private injector: Injector) {
        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
        let self = this;
        this.refreshSubject.pipe(switchMap((id) =>
            this.workflowService.getWorkflowDetailsBasic(id).pipe(catchError((err) => {
                console.error(err);
                return of(null);
            }))
        )).subscribe((res) => {
            if (res != null) {
                self.flowchartModule.RefreshBlocksData(res);
                if (self.details) {
                    self.details.Status = res.Status;
                    self.details.StatusText = res.StatusText;
                    self.details.Priority = res.Priority;
                    self.details.PriorityLevel = res.PriorityLevel;
                    self.details.CompleteBy = res.CompleteBy;
                    if (this.latestData) {
                        this.selectedTask.Status = this.latestData.status;
                        this.selectedTask.LockedBy = this.latestData.lockedBy;
                    }
                }
                if (!self.cdr['destroyed']) {
                    self.cdr.detectChanges();
                }
                self.selectTask(this.selectedTask);
                this.refreshTimer = setTimeout(() => {
                    this.updateData(true);
                }, 10000);
            }
        });
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    clickBack() {
        // const wfprvd = this.injector.get(WorkflowProvider);
        // wfprvd.goToDecision()
        this.location.back();
    }

    ngOnInit() {
        this.overlay.hideWhole();
        this.overlay.show(this.workflow.nativeElement);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        clearTimeout(this.refreshTimer);
        this.routeSub.unsubscribe();
    }

    ngAfterViewInit() {
        this.tasksControlButtons.onSavedStatus.subscribe(res => {
            this.updateData(true, res);
        });
        this.slickGridComp.provider.setGlobalColumns(this.tableColumns);
        this.slickGridComp.provider.setDefaultColumns(this.tableColumns, [], true);

        this.routeSub = this.route.parent.params.subscribe((data) => {
            this.workflowService.getWorkflowDetails(data['id']).subscribe((res: any) => {
                this.error = false;
                this.selectedTask = null;
                let tasks = [];
                let tasksLinks = [];
                this.details = res;
                this.markResolvedAllowed = res.Status == 19 && res.IsFailureResolved == false;
                for (let el of res.SourceMedia) {
                    if (el.THUMBID == -1) {
                        el.THUMBURL = './assets/img/default-thumb.png';
                    } else {
                        el.THUMBURL = ConfigService.getAppApiUrl() + '/getfile.aspx?id=' + el.THUMBID;
                    }
                }

                this.taskIndex = 0;


                this.details.Tasks.map(el => {
                    el.jobId = res.Id;
                    return el;
                });

                var initialTasks = this.details.Tasks.filter((x) => {
                    return this.details.TaskLinks.filter(el => el.TaskId == x.Id).length == 0;
                });

                for (var i = 0; i < initialTasks.length; i++) {
                    var task = initialTasks[i];
                    task.TSK_TYPE = task.TaskType;
                    task.ID = task.Id;
                    tasks.push({
                        label: task.TaskTypeText,
                        status: task.StatusText,
                        progress: task.Progress,
                        task: task,
                        taskIndex: this.taskIndex,
                        job: res
                    });
                    this.taskIndex++;

                    this.processChildsRecursive(tasks[tasks.length - 1], tasks, res, tasksLinks);
                }

                setTimeout(() => {
                    if (this.destroyed$.isStopped) {
                        return;
                    }
                    var wrapper = this.flowChartArea.nativeElement;
                    this.flowchartModule.updateSplitterSizes($(wrapper).width(), $(wrapper).height());
                    this.flowchartModule.Init(tasks, tasksLinks);
                    this.refreshTimer = setTimeout(() => {
                        this.updateData(true);
                    }, 10000);
                    this.overlay.hide(this.workflow.nativeElement);
                    this.splashProvider.onHideSpinner.emit();
                    this.cdr.detectChanges();
                });
            }, (error) => {
                if (error.status == 500) {
                    // ошибка сервера
                    this.text = this.translate.instant('details_item.server_not_work');
                } else if (error.status == 400) {
                    // элемент не найден
                    this.text = this.translate.instant('details_item.media_item_not_found');
                } else if (error.status == 0) {
                    // сети нет
                    this.text = this.translate.instant('details_item.check_network');
                }
                this._isError();
            });
        });
    }

    processChildsRecursive(task, tasks, res, tasksLinks) {
        var childLinks = this.details.TaskLinks.filter(el => el.ParentTaskId == task.task.Id);
        if (childLinks.length > 0) {
            childLinks.sort((a, b) => {
                return a.ParentOut - b.ParentOut;
            });

            for (var i = 0; i < childLinks.length; i++) {
                var link = childLinks[i];
                var nextTask = this.details.Tasks.filter((x) => x.Id == link.TaskId)[0];
                // let source = tasks.filter(el => el.task.Id == task.ParentTaskId)[0];
                // let target = tasks.filter(el => el.task.Id == task.TaskId)[0];

                if (tasks.filter((x) => x.task.Id == nextTask.Id).length == 0) {
                    nextTask.TSK_TYPE = nextTask.TaskType;
                    nextTask.ID = nextTask.Id;
                    tasks.push({
                        label: nextTask.TaskTypeText,
                        status: nextTask.StatusText,
                        progress: nextTask.Progress,
                        task: nextTask,
                        taskIndex: this.taskIndex,
                        job: res
                    });
                    this.taskIndex++;
                    tasksLinks.push({
                        source: task,
                        target: tasks[tasks.length - 1],
                        linkData: link
                    });
                    this.processChildsRecursive(tasks[tasks.length - 1], tasks, res, tasksLinks);
                } else {
                    tasksLinks.push({
                        source: task,
                        target: tasks.filter((x) => x.task.Id == nextTask.Id)[0],
                        linkData: link
                    });
                }
            }
        }
    }

    private latestData = null;

    updateData(auto = false, data?: any) {
        clearTimeout(this.refreshTimer);
        var id = this.route.snapshot.params['id'];
        this.latestData = data;
        this.refreshSubject.next(id);
    }

    _isError() {
        this.overlay.hide(this.workflow.nativeElement);
        this.error = true;
        this.cdr.markForCheck();
    }

    checkAllowedTask(item) {
        if (item.TSK_TYPE === 62) {
            return true;
        } else if (item.TSK_TYPE === 1) {
            let subtype = item.TECH_REPORT_SUBTYPE ? item.TECH_REPORT_SUBTYPE : item.TechReportSubtype;
            switch (subtype) {
                case "subtitleassess":
                    return true;
                case "simpleassess":
                    return true;
                default:
                    return false;
            }
        }
        return false;
    }

    isMarkResolvedEnabled() {
        if (this.details) {
            let isAllFailed = this.details.Status == 19;
            let isExistToResolve = this.details.IsFailureResolved != true;
            return isAllFailed && isExistToResolve;
        }

        return false;//isAllFailed && isExistToResolve;
    }

    changeTaskCallback(): Observable<Subscription> {
        return Observable.create((observer) => {
            observer.next(true);
            observer.complete();
        });
    }

    openPriorityWizard() {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.wf_priority,
            WorkflowWizardPriorityComponent, {
                size: 'md',
                title: 'workflow.topPanel.wizard.priority.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            },
            {
                Jobs: [this.details.Id],
                Priority: [this.details.PriorityLevel]
            });
        modal.load().then((compRef: ComponentRef<WorkflowWizardPriorityComponent>) => {
            const comp: WorkflowWizardPriorityComponent = compRef.instance;
            comp.onShow();
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.updateData(true);
                }
            });
        });
    }

    changeCompletedDate() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        const ids = [this.details.Id];
        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_changeby,
            WorkflowChangeByModalComponent, {
                size: 'sm',
                title: 'changeby.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                jobs: ids,
                jobDetails: this.details,
                fromDetail: true
            });
        modal.load().then((compRef: ComponentRef<WorkflowWizardPriorityComponent>) => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.updateData(true);
                }
            });
        });
    }

    openRestartWizard() {
        if (!this.selectedTask)
            return;
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.task_wizard_abort,
            TaskWizardAbortComponent, {
                size: 'lg',
                title: 'workflow.topPanel.wizard.abort.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            },
            {
                mode: 'single',
                taskIds: [this.selectedTask.ID],
                jobId: this.selectedTask.jobId,
            });
        modal.load().then(() => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.updateData(true);
                }
            });
        });
    }

    markResolved() {
        let self = this;
        let rowsData = [{'ID': this.details.Id, 'Title': this.details.Titles}];
        let rowsIds = [this.details.Id];
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr =>{
            let modalContent: IMFXModalAlertComponent = cr.instance;

            let textParam = ''
                , text = '';
            if (rowsData.length == 1) {
                text = 'workflow.mark_resolved.modal_confirmation_1';
                textParam = `${rowsData[0].Title} (ID - ${rowsData[0].ID} )`;
            } else if (rowsData.length > 1 && rowsData.length < 5) {
                text = 'workflow.mark_resolved.modal_confirmation_less_5';
                for (let item of rowsData) {
                    textParam += `&#13;${item.Title} (ID - ${item.ID} )`;
                }

            } else if (rowsData.length >= 5) {
                text = 'workflow.mark_resolved.modal_confirmation_more_5';
                textParam = rowsData.length + '';
            }

            modalContent.setText(
                text,
                {textParam: textParam}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    self.jobService.markResolved(rowsIds).subscribe(
                        () => {
                            self.notificationRef.notifyShow(1,
                                (rowsData.length == 1)
                                    ? 'workflow.mark_resolved.success_1'
                                    : 'workflow.mark_resolved.success_many');
                            modal.hide();
                        }, (err) => {
                            self.notificationRef.notifyShow(2, 'workflow.mark_resolved.error');
                            modal.hide();
                        }, () => {

                        });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    selectTask(task) {
        this.selectedTask = task;
        if (task) {
            this.reloadTaskStatus.next({
                taskStatus: task.Status,
                taskId: task.ID,
                statusText: task.StatusText,
                lockedBy: task.LockedBy
            });
            this.taskAllowed = this.checkAllowedTask(task);

            this.workflowService.getWorkflowTaskDetails(task.Id)
                .pipe(
                    takeUntil(this.destroyed$))
                .subscribe((res: any) => {
                    let tableRows = res.map((el) => {
                        return {
                            NOTES: el.NOTES,
                            OPERATOR_ID: el.OPERATOR_ID,
                            TIMESTAMP: new Date(el.TIMESTAMP).toLocaleString(),
                            ActionText: el.ActionText
                        };
                    });

                    this.slickGridComp.provider.buildPageByData({Data: tableRows});
                    this.cdr.detectChanges();
                });
        } else {
            this.cdr.detectChanges();
        }
    }

    dblClickTask(task) {
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).navigateToPageByTask(task);
    }

    private onResizeFlowChart() {
        if (this.flowChartArea) {
            var wrapper = this.flowChartArea.nativeElement;
            this.flowchartModule.updateSplitterSizes($(wrapper).width(), $(wrapper).height());
        }
    }
}
