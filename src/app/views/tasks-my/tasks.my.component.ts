import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
// Views
import {TasksMyViewsProvider} from "./providers/views.provider";
// Form
import {SearchFormConfig} from "../../modules/search/form/search.form.config";
import {SearchFormProvider} from "../../modules/search/form/providers/search.form.provider";
// Search Settings
import {SearchSettingsConfig} from "../../modules/search/settings/search.settings.config";
// Search Modal
// Modal
// import {ModalConfig} from "../../modules/modal/modal.config";
// Search Columns
// Info Modal
// Search Settings
import {SearchRecentConfig} from "../../modules/search/recent/search.recent.config";
import {SearchRecentProvider} from "../../modules/search/recent/providers/search.recent.provider";

import {SearchAdvancedConfig} from "../../modules/search/advanced/search.advanced.config";
import {SearchAdvancedProvider} from "../../modules/search/advanced/providers/search.advanced.provider";
// constants
import {WorkflowAppSettings} from "./constants/constants";
import {AppSettingsInterface} from "../../modules/common/app.settings/app.settings.interface";
// grid
import {ExportProvider} from "../../modules/export/providers/export.provider";
import {SearchSettingsProvider} from "../../modules/search/settings/providers/search.settings.provider";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../modules/search/slick-grid/slick-grid.config";
import {SlickGridService} from "../../modules/search/slick-grid/services/slick.grid.service";
import {SlickGridProvider} from "../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridComponent} from "../../modules/search/slick-grid/slick-grid";
import {CoreSearchComponent} from "../../core/core.search.comp";
import {ViewsProvider} from "../../modules/search/views/providers/views.provider";
import {MyTasksWizardPriorityComponentProvider} from "./comps/wizards/priority/providers/wizard.provider";
// import {ModalComponent} from "../../modules/modal/modal";
import {LookupSearchLocationService} from "../../services/lookupsearch/location.service";
import {ViewsConfig} from "../../modules/search/views/views.config";
import {MyTasksWizardPriorityComponent} from "./comps/wizards/priority/wizard";
import {TasksMySlickGridProvider} from "./providers/slick.grid.provider";
import {TasksMySearchAdvancedProvider} from "./providers/search.advanced.provider";
import {TasksMySearchFormProvider} from "./providers/search.form.provider";
import {IMFXModalProvider} from '../../modules/imfx-modal/proivders/provider';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {SearchViewsComponent} from "../../modules/search/views/views";
import {IMFXModalEvent} from '../../modules/imfx-modal/types';
import {SecurityService} from "../../services/security/security.service";
import {TaskWizardAbortComponentProvider} from '../../modules/controls/task.wizards/abort/providers/wizard.provider';
import {TaskWizardAbortComponentService} from '../../modules/controls/task.wizards/abort/services/wizard.service';
import {IMFXModalComponent} from '../../modules/imfx-modal/imfx-modal';
import {TaskWizardAbortComponent} from 'app/modules/controls/task.wizards/abort/wizard';
import {WorkflowProvider} from '../../providers/workflow/workflow.provider';
import {JobStatuses} from "../workflow/constants/job.statuses";
import {WorkflowUsersComponent} from "../workflow/comps/users/users";
import {lazyModules} from "../../app.routes";
import {TaskMySearchRecentProvider} from "./providers/tasks.my.search.recent.provider";

@Component({
    selector: 'tasks-my',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        WorkflowProvider,
        SearchFormProvider,
        SearchRecentProvider,
        {provide: SlickGridProvider, useClass: TasksMySlickGridProvider},
        {provide: ViewsProvider, useClass: TasksMyViewsProvider},
        {provide: SearchFormProvider, useClass: TasksMySearchFormProvider},
        {provide: SearchAdvancedProvider, useClass: TasksMySearchAdvancedProvider},
        {provide: SearchRecentProvider, useClass: TaskMySearchRecentProvider},
        SlickGridService,
        WorkflowAppSettings,
        SearchSettingsProvider,
        LookupSearchLocationService,
        MyTasksWizardPriorityComponentProvider,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        TaskWizardAbortComponentProvider,
        TaskWizardAbortComponentService,
    ]
})

export class TasksMyComponent extends CoreSearchComponent {
    public isGridExpanded: boolean = false;
    public isOpenedSchedule: boolean = false;
    public refreshStarted: boolean = false;
    @ViewChild('ddUser', {static: false}) ddUser: WorkflowUsersComponent;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            appSettings: <AppSettingsInterface>null,
            options: {
                provider: <SearchFormProvider>null,
            },
            searchButtonAlwaysEnabled: true,
            doSearchOnStartup: true
        }
    };
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: "task",
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                refreshOnNavigateEnd: true,
                viewModeSwitcher: false,
                viewMode: 'table',
                searchType: 'mytasks',
                exportPath: 'Task',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                pager: {
                    enabled: true
                },
                isDraggable: {
                    enabled: true,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.tasksSettingsPopup'
                    }
                },
                displayNoRowsToShowLabel: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };
    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    protected searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: "adv.recent.searches.my.tasks",
            itemsLimit: 10
        }
    };
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'TaskGrid',
        }
    };
    private disabledGroupOperationButtons: boolean = true;
    private disabledRestartButton: boolean = true;
    private modal;
    private isReady: boolean = false;

    constructor(public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: WorkflowAppSettings,
                protected router: Router,
                protected route: ActivatedRoute,
                protected securityService: SecurityService,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected wizardGroupPriorityModalProvider: MyTasksWizardPriorityComponentProvider,
                protected injector: Injector,
                private modalProvider: IMFXModalProvider,
                private wfProvider: WorkflowProvider) {
        super(injector);

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        this.exportProvider.componentContext = this;
    }

    public setOpenedSchedule(isOpen: boolean) {
        this.isOpenedSchedule = isOpen;
    }

    switchSchedule() {
        this.isOpenedSchedule = !this.isOpenedSchedule;
    }

    getIsReady(): boolean {
        return this.isReady;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        let sgp: SlickGridProvider = this.slickGridComp.provider;
        sgp.onDataUpdated.subscribe((data) => {
            this.checkButtonEnables();
        });
        sgp.onSelectRow.subscribe((data) => {
            this.checkButtonEnables();
        });
        setTimeout(() => {
            this.isReady = true;
        })
    }

    checkButtonEnables() {
        setTimeout(() => {
            this.checkRestartBtnEnable();
            this.checkGroupOperationButtonsEnable();
        });
    }

    checkRestartBtnEnable(): void {
        let sgp: SlickGridProvider = this.slickGridComp.provider;
        if (!sgp)
            return;
        let sr = sgp.getSelectedRow();
        this.disabledRestartButton = (!(sr && sr['TSK_STATUS'] && sr['TSK_STATUS'] == JobStatuses.FAILED));
    }

    checkGroupOperationButtonsEnable() {
        let sgp: SlickGridProvider = this.slickGridComp.provider;
        if (!sgp)
            return;
        let selectedRow = sgp.getSelectedRows();
        this.disabledGroupOperationButtons = (!(selectedRow.length > 0 && selectedRow[0]['TSK_STATUS'] !== JobStatuses.COMPLETED));
    }

    openPriorityWizard() {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.tasks_my_priority,
            MyTasksWizardPriorityComponent,
            {
                size: 'md',
                title: 'workflow.topPanel.wizard.priority.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            },
            {
                Tasks: this.slickGridComp.provider.getFieldsOfSelectedRows('ID'),
                Priority: this.slickGridComp.provider.getFieldsOfSelectedRows('PRIORITY')
            });

        modal.load().then((compRef: ComponentRef<MyTasksWizardPriorityComponent>) => {
            const comp = compRef.instance;
            comp.onShow();
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.slickGridComp.provider.refreshGrid();
                }
            });
        });
    }

    openRestartWizard() {
        const selectedRowsIds: Array<number> = this.slickGridComp.provider.getSelectedRowsIds();
        let taskIds = [];
        let jobId = null;
        let mode = 'single';
        if (selectedRowsIds.length > 1) {
            for (let i in selectedRowsIds) {
                taskIds.push(this.slickGridComp.provider.getDataView().getItemByIdx(selectedRowsIds[i]).ID);
            }
            mode = 'multiple';
        } else {
            const selectedRow: any = this.slickGridComp.provider.getSelectedRow();
            if (!selectedRow || !selectedRow.ID || !selectedRow.J_ID) {
                return;
            }
            jobId = selectedRow.J_ID;
            taskIds.push(selectedRow.ID);
        }
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.task_wizard_abort,
            TaskWizardAbortComponent, {
                size: 'lg',
                title: 'workflow.topPanel.wizard.abort.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            },
            {
                mode: mode,
                jobId: jobId,
                taskIds: taskIds
            });

        modal.load().then(() => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    this.doRefresh();
                }
            });
        });
    }

    public doRefresh() {
        setTimeout(() => {
            this.slickGridComp.provider.refreshGrid(true);
        }, 0);
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
