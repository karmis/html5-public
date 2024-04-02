import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { WorkflowDecisionProvider } from "./providers/wf.decison.provider";
import { MediaAppSettings } from "../../../media/constants/constants";
import { AssessmentProvider } from "../assessment/providers/assessment.provider";
import { TcbProvider } from "../../../../modules/search/tasks-control-buttons/providers/tcb.provider";
import { WorkflowTcbProvider } from "./providers/workflow.tcb.provider";
import { SlickGridService } from "../../../../modules/search/slick-grid/services/slick.grid.service";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from "../../../../modules/search/slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { WorkflowDecisionOptionsSlickGridProvider } from "./providers/wf.decision.options.slick.grid.provider";
import { SearchSettingsConfig } from "../../../../modules/search/settings/search.settings.config";

import { CoreSearchComponent } from "../../../../core/core.search.comp";
import { SlickGridComponent } from "../../../../modules/search/slick-grid/slick-grid";
import { SecurityService } from "../../../../services/security/security.service";
import { ConsumerSettingsTransferProvider } from "../../../../modules/settings/consumer/consumer.settings.transfer.provider";
import { ActivatedRoute, Router } from "@angular/router";
import { ExportProvider } from "../../../../modules/export/providers/export.provider";
import { SearchFormProvider } from "../../../../modules/search/form/providers/search.form.provider";
import { SearchSettingsProvider } from "../../../../modules/search/settings/providers/search.settings.provider";
import { ViewsProvider } from "../../../../modules/search/views/providers/views.provider";
import { WorkflowDecisionMediaViewsProvider } from "./providers/wf.descision.media.views.provider";
import { SearchViewsComponent } from "../../../../modules/search/views/views";
import { ViewsConfig } from "../../../../modules/search/views/views.config";
import { AppSettingsInterface } from "../../../../modules/common/app.settings/app.settings.interface";
import { TransferdSimplifedType } from "../../../../modules/settings/consumer/types";
import { SearchFormConfig } from "../../../../modules/search/form/search.form.config";
import { IMFXModalComponent } from "../../../../modules/imfx-modal/imfx-modal";
import { DetailService } from "../../../../modules/search/detail/services/detail.service";
import { MediaDetailDetailsViewResponse } from "../../../../models/media/detail/detailsview/media.detail.detailsview.response";
import { Observable, Subject, Subscription } from "rxjs";
import { ManualDecisionType, WorkflowDecisionService } from "./services/wf.decision.service";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import { Select2Formatter } from "../../../../modules/search/slick-grid/formatters/select2/select2.formatter";
import {
    SlickGridColumn,
    SlickGridFormatterData,
    SlickGridSelect2FormatterEventData
} from "../../../../modules/search/slick-grid/types";
import { IMFXNotesTabComponent } from "../../../../modules/search/detail/components/notes.tab.component/imfx.notes.tab.component";
import {
    OnSavedTaskStatusType,
    TasksControlButtonsComponent
} from "../../../../modules/search/tasks-control-buttons/tcb";
import { LocalStorageService } from "ngx-webstorage";
import { take } from 'rxjs/operators';
import { WorkflowDecisionInputDataType } from "../../../workflow/comps/slickgrid/formatters/expand.row/expand.row.formatter";
import { JobStatuses } from "../../../workflow/constants/job.statuses";
import {WorkflowDecisionMediaSlickGridProvider} from "./providers/wf.decision.media.slick.grid.provider";
// import { WorkflowDecisionMediaSlickGridProvider } from "./providers/wf.decision.media.slick.grid.provider";

export type ManualDecisionTaskPartialType = {
    TaskNotes: string,
    MediaDecisions: any
}

@Component({
    selector: 'wf-decision',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MediaAppSettings,
        WorkflowDecisionProvider,
        AssessmentProvider,
        TcbProvider,
        WorkflowDecisionService,
        {provide: TcbProvider, useClass: WorkflowTcbProvider},
        SlickGridProvider,
        // WorkflowDecisionMediaSlickGridProvider,
        {provide: SlickGridProvider, useClass: WorkflowDecisionMediaSlickGridProvider},
        // WorkflowDecisionOptionsSlickGridProvider,
        // WorkflowDecisionMediaSlickGridProvider,
        // {provide: SlickGridProvider, useClass: WorkflowDecisionOptionsSlickGridProvider},
        SlickGridService,
        SearchSettingsProvider,
        ViewsProvider,
        {provide: ViewsProvider, useClass: WorkflowDecisionMediaViewsProvider},
        SearchFormProvider,
        DetailService
    ]
})
export class WorkflowDecisionComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    @ViewChild('notesTab', {static: false}) notesTabRef: IMFXNotesTabComponent;
    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null
        }
    };
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('tasksControlButtons', {static: false}) public tasksControlButtons: TasksControlButtonsComponent;
    reloadTaskStatus: Subject<any> = new Subject();
    public data: WorkflowDecisionInputDataType;
    public modalRef: IMFXModalComponent;
    flagHide = true;
    commonUpdateDetailSubject: Subject<void> = new Subject<void>()
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                // searchType: 'title',
                searchType: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                isThumbnails: false,
                pager: {
                    enabled: false,
                }
            }
        })
    });
    protected optsSearchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: WorkflowDecisionOptionsSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                // searchType: 'title',
                searchType: 'Media',
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
            }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
        }
    };
    decisionsData: ManualDecisionType = {
        IsMandatory: false,
        Task: {},
        Job: {},
        Medias: [],
        Options: []
    };
    isMandatoryDecision: boolean = true;
    private taskStatus: number = 0;
    private taskId: number = 0;
    private statusText: string = '';
    private dataChanged: boolean = false;
    private taskLockedBy: string = null;
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    private searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };
    private friendlyNamesForJobDetail = 'FriendlyNames.TM_MJOB';
    private detailView: MediaDetailDetailsViewResponse;
    private objectForSave: ManualDecisionTaskPartialType = {
        TaskNotes: '',
        MediaDecisions: {}
    };
    readonly: boolean = false;
    private wfDecisionProvider: WorkflowDecisionProvider;
    private taskCallback: any = {
        btnComp: {
            callback: this.beforeChangeStatus,
            context: this
        }
    };

    constructor(public searchFormProvider: SearchFormProvider,
                protected appSettings: MediaAppSettings,
                protected securityService: SecurityService,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                private cdr: ChangeDetectorRef,
                protected injector: Injector,
                private translate: TranslateService,
                private notificationRef: NotificationService,
                public localStorage: LocalStorageService,
    ) {
        super(injector);
        this.wfDecisionProvider = this.injector.get(WorkflowDecisionProvider);
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();
        this.simpleTransferProvider.updated.subscribe((setups: TransferdSimplifedType) => {
            /*debugger*/
        });

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // export
        this.exportProvider.componentContext = (<CoreSearchComponent>this);

        let detailService: DetailService = this.injector.get(DetailService);
        detailService.getDetailsView(0, 'Job').subscribe((detailView: MediaDetailDetailsViewResponse) => {
            this.detailView = detailView;
            // this.cdr.detectChanges();
        });

        this.wfDecisionProvider = this.injector.get(WorkflowDecisionProvider);
        this.commonUpdateDetailSubject.subscribe(() => {
            this.commonUpdateDetail();
        })
    }

    refreshDecisionGrid(id: number, waitForGrid: boolean = false): Observable<any> {
        return new Observable((observer: any) => {
            this.wfDecisionProvider.getManualDecision(id).subscribe((resp) => {
                this.decisionsData = resp;
                this.isMandatoryDecision = resp.IsMandatory;
                this.taskId = resp.Task.ID;
                this.taskStatus = resp.Task.TSK_STATUS;
                this.statusText = resp.Task.TSK_STATUS_text;
                this.taskLockedBy = resp.Task.LOCKED_BY;
                this.objectForSave.TaskNotes = resp.Task.TSK_NOTES;
                this.readonly = resp.Task.SUBTYPE === 'Auto' ? true : this.isReadonly(this.taskStatus);
                this.modalRef.setTitle(resp.Task.SUBTYPE === 'Manual' ? 'workflow.decision.title_manual' : 'workflow.decision.title_auto');
                // check unset options
                $.each(resp.Medias, (k, m) => {
                    if (m.Decision !== 0) {
                        this.objectForSave.MediaDecisions[m.ID] = m.Decision||0;
                    }
                });

                if (this.data.provider && (<any>this.data.provider.componentContext).updateData) {
                    // WorkflowDetailComponent
                    (<any>this.data.provider.componentContext).updateData();
                }

                if (!this.data.provider || !waitForGrid) {
                    Promise.resolve()
                        .then(() => {
                            this.refreshDecisionGridOnGridReady(resp);
                            observer.next(resp);
                            observer.complete();
                        });
                } else {
                    this.data.provider.onGridEndSearch.pipe(
                        take(1)
                    ).subscribe(() => {
                        this.refreshDecisionGridOnGridReady(resp);
                        observer.next(resp);
                        observer.complete();
                    });
                }
            }, (err) => {
                observer.error(err);
            });
        });
    }

    refreshDecisionGridOnGridReady(resp) {
        this.decisionsData = resp;
        this.storedData = resp.Medias;
        this.setColumnsAndDataForMediaGrid(this.decisionsData);
        this.notesTabRef.setValue(resp.Task.TSK_NOTES);
        this.notesTabRef.refresh(resp.Task.TSK_NOTES, this.readonly);
        this.tasksControlButtons.setTaskStatus(this.taskStatus, this.taskLockedBy);
    }

    beforeChangeStatus(status): Observable<Subscription> {
        return new Observable((observer: any) => {
            this.saveDataObsr(status).subscribe((stat: boolean) => {
                if (false === stat) {
                    this.notificationRef.notifyShow(2, this.translate.instant('workflow.decision.not_all_items'), true, 2500, true);
                }
                observer.next(stat);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    private storedData = [];
    private formatterSelect2OnSelect$: Subscription;
    ngAfterViewInit() {
        this.formatterSelect2OnSelect$ = this.slickGridComp.provider.formatterSelect2OnSelect.subscribe((d: SlickGridSelect2FormatterEventData) => {
            this.storedData[d.data.rowNumber]['Decision'] = d.value.id;
        })

        this.tasksControlButtons.onSavedStatus.subscribe((res: OnSavedTaskStatusType) => {
            if (this.data.provider) {
                this.storedData = this.decisionsData.Medias;
                this.data.provider.clearData(true);
                this.data.provider.refreshGrid();
            }
            this.refreshDecisionGrid(this.data.task.ID).subscribe((resp: ManualDecisionType) => {
                this.cdr.detectChanges();
            });
        });

        let obs = this.refreshDecisionGrid(this.data.task.ID).subscribe(() => {
            if (obs.unsubscribe) {
                obs.unsubscribe();
            }
            if(!this.cdr['destroyed']){this.cdr.detectChanges();}
            console.log('refresh for init');
        });

        (this.slickGridComp.provider as WorkflowDecisionMediaSlickGridProvider).setModalRef(this.modalRef);
    }

    onNotesChanged($event) {
        this.objectForSave.TaskNotes = $event;
    }

    setColumnsAndDataForMediaGrid(resp: ManualDecisionType) {
        /*        // let columns = [];


        // columns.unshift({
        //     id: 2,
        //     name: 'Media ID',
        //     field: 'MIID1',
        //     minWidth: 150,
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });
        //
        // columns.unshift({
        //     id: 3,
        //     name: 'Media ID2',
        //     field: 'MIID1',
        //     minWidth: 150,
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });
        //
        // columns.unshift({
        //     id: 4,
        //     name: 'Title',
        //     field: 'TITLE',
        //     minWidth: 150,
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });
        //
        // columns.unshift({
        //     id: 5,
        //     name: 'Version',
        //     field: 'VERSION',
        //     minWidth: 150,
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });
        //
        // columns.unshift({
        //     id: 6,
        //     name: 'Version ID1',
        //     field: 'VERSIONID1',
        //     minWidth: 150,
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });
        //
        // columns.unshift({
        //     id: 7,
        //     name: 'Usage',
        //     field: 'USAGE_TYPE_text',
        //     minWidth: 150,
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });
        //
        // columns.unshift({
        //     id: 8,
        //     name: 'Filename',
        //     field: 'FILENAME',
        //     minWidth: 150,5
        //     resizable: false,
        //     sortable: true,
        //     multiColumnSort: false
        // });*/

        // this.slickGridComp.provider.initColumns(this.slickGridComp.provider.getColumns(), [], true);
        this.slickGridComp.provider.buildPageByData({Rows: resp.Medias.length, Data: this.storedData.length?this.storedData:resp.Medias});
        this.viewsComp.provider.resetView()
        this.slickGridComp.provider.formatterSelect2OnSelect.subscribe((resp: SlickGridSelect2FormatterEventData) => {
            this.objectForSave.MediaDecisions[resp.data.data.ID] = resp.value.id||0;
            this.cdr.detectChanges();
        });
    }

    saveData() {
        this.wfDecisionProvider.saveManualDecision(this.data.task.ID, this.objectForSave).subscribe((res: any) => {
            // this.data.provider && this.data.provider.refreshGrid();
            this.notificationRef.notifyShow(1, this.translate.instant("workflow.decision.saved_notifi"), true);
            this.modalRef.hide();
        });
    }

    saveDataObsr(status): Observable<boolean> {
        return new Observable((observer: any) => {
            if (this.taskStatus === JobStatuses.INPROG) {
                if ((status === 'COMPLETED' && this.isValid()) || (status !== 'COMPLETED')) {
                    this.wfDecisionProvider.saveManualDecision(this.data.task.ID, this.objectForSave).subscribe((res: any) => {
                        // this.data.provider.refreshGrid();
                        observer.next(true);
                    }, (err) => {
                        observer.error(err);
                    }, () => {
                        observer.complete();
                    });
                } else {
                    Promise.resolve()
                        .then(() => {
                            observer.complete();
                        });
                }
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

    isValid(): boolean {
        let answ = false;
        if (!this.readonly) {
            if (!this.isMandatoryDecision) {
                answ = true;
            } else if (this.slickGridComp) {
                answ = this.slickGridComp.provider.getData().length == Object.keys(this.objectForSave.MediaDecisions).length;
            } else {
                answ = false;
            }
        }

        if (this.taskStatus === JobStatuses.INPROG) {
            if (this.taskLockedBy) {
                let data = this.localStorage.retrieve('permissions');
                // if current user != user locked by -> enabled = false
                if (this.taskLockedBy !== data.FullName) {
                    this.tasksControlButtons.changeStatusForBtn('btnComp', {enabled: false});
                } else {
                    this.tasksControlButtons.changeStatusForBtn('btnComp', {enabled: answ});
                }
            } else {
                this.tasksControlButtons.changeStatusForBtn('btnComp', {enabled: answ});
            }
        }

        return answ;
    }

    isReadonly(st: number) {
        return (st !== JobStatuses.INPROG);
    }


    // changeMandatoryDecision($event) {
    //     this.setColumnsAndDataForMediaGrid(this.decisionsData);
    // }
    commonUpdateDetail() {
            this.wfDecisionProvider.getManualDecision(this.data.task.ID).subscribe((resp) => {
                this.decisionsData = resp;
                this.isMandatoryDecision = resp.IsMandatory;
                this.taskId = resp.Task.ID;
                this.taskStatus = resp.Task.TSK_STATUS;
                this.statusText = resp.Task.TSK_STATUS_text;
                this.taskLockedBy = resp.Task.LOCKED_BY;
                this.objectForSave.TaskNotes = resp.Task.TSK_NOTES;
                this.readonly = resp.Task.SUBTYPE === 'Auto' ? true : this.isReadonly(this.taskStatus);
                this.modalRef.setTitle(resp.Task.SUBTYPE === 'Manual' ? 'workflow.decision.title_manual' : 'workflow.decision.title_auto');
                // check unset options

                if (this.data.provider && (<any>this.data.provider.componentContext).updateData) {
                    // WorkflowDetailComponent
                    (<any>this.data.provider.componentContext).updateData();
                }
            }, (err) => {
                console.error(err)
            });
    }

    ngOnDestroy() {
        this.formatterSelect2OnSelect$.unsubscribe();
    }
}
