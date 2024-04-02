import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Views
import { WorkflowViewsProvider } from './providers/views.provider';
// Form
import { SearchFormConfig } from '../../modules/search/form/search.form.config';
import { SearchFormProvider } from '../../modules/search/form/providers/search.form.provider';
// Search Settings
import { SearchSettingsConfig } from '../../modules/search/settings/search.settings.config';
// Search Modal
// Modal
// Search Columns
// Search Settings
import { SearchRecentConfig } from '../../modules/search/recent/search.recent.config';
import { SearchRecentProvider } from '../../modules/search/recent/providers/search.recent.provider';

import { SearchAdvancedConfig } from '../../modules/search/advanced/search.advanced.config';
import { SearchAdvancedProvider } from '../../modules/search/advanced/providers/search.advanced.provider';
// constants
import { WorkflowAppSettings } from './constants/constants';
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
// grid
import { ExportProvider } from '../../modules/export/providers/export.provider';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../modules/search/slick-grid/slick-grid.config';
import { SlickGridService } from '../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridProvider } from '../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridComponent } from '../../modules/search/slick-grid/slick-grid';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { WorkflowSlickGridProvider } from './providers/workflow.slick.grid.provider';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { SlickGridPanelProvider } from '../../modules/search/slick-grid/comps/panels/providers/panels.slick.grid.provider';
import { WorkflowSlickGridPanelProvider } from './providers/workflow.slick.grid.panel.provider';
import { WorkflowWizardPriorityComponent } from './comps/wizards/priority/wizard';
import { LookupSearchLocationService } from '../../services/lookupsearch/location.service';
import { ViewsConfig } from '../../modules/search/views/views.config';
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SearchViewsComponent } from '../../modules/search/views/views';
import { IMFXModalEvent } from '../../modules/imfx-modal/types';
import { FormsModule } from '@angular/forms';
import { SecurityService } from '../../services/security/security.service';
import { WorkflowSearchFormProvider } from './providers/search.form.provider';
import { WorkflowSearchRecentProvider } from './providers/wf.search.recent.provider';
import { WorkflowUsersComponent } from './comps/users/users';
import { appRouter } from '../../constants/appRouter';
import { IMFXModalComponent } from '../../modules/imfx-modal/imfx-modal';
import { TaskWizardAbortComponentProvider } from '../../modules/controls/task.wizards/abort/providers/wizard.provider';
import { TaskWizardAbortComponentService } from '../../modules/controls/task.wizards/abort/services/wizard.service';
import { TaskWizardAbortComponent } from '../../modules/controls/task.wizards/abort/wizard';
import { ɵResourceLoaderImpl } from '@angular/platform-browser-dynamic';
import { WorkflowProvider } from '../../providers/workflow/workflow.provider';
import { JobStatuses } from './constants/job.statuses';
import { TasksWizardPriorityComponent } from '../tasks/comps/wizards/priority/wizard';
import {lazyModules} from "../../app.routes";

@Component({
    selector: 'workflow',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        WorkflowProvider,
        {provide: SlickGridProvider, useClass: WorkflowSlickGridProvider},
        {provide: ViewsProvider, useClass: WorkflowViewsProvider},
        {provide: SlickGridPanelProvider, useClass: WorkflowSlickGridPanelProvider},
        SearchFormProvider,
        {provide: SearchFormProvider, useClass: WorkflowSearchFormProvider},
        SlickGridService,
        WorkflowAppSettings,
        SearchRecentProvider,
        {provide: SearchRecentProvider, useClass: WorkflowSearchRecentProvider},
        SearchAdvancedProvider,
        LookupSearchLocationService,
        SearchSettingsProvider,
        FormsModule,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        TaskWizardAbortComponentProvider,
        TaskWizardAbortComponentService,
    ]
})

export class WorkflowComponent extends CoreSearchComponent {
    isGridExpanded: boolean = false;
    isOpenedSchedule: boolean = false;
    refreshOn: boolean = false;
    refreshStarted: boolean = false;
    visited: boolean = false
    modal;
    @ViewChild('ddUser', {static: false}) ddUser: WorkflowUsersComponent;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    /**
     * Form
     * @type {SearchFormConfig}
     */
    searchFormConfig = {
        componentContext: this,
        options: {
            currentMode: 'Titles',
            appSettings: null as AppSettingsInterface,
            options: {
                provider: null as SearchFormProvider,
            },
            searchButtonAlwaysEnabled: true,
            doSearchOnStartup: false
        }
    } as SearchFormConfig;
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    searchAdvancedConfig = {
        componentContext: this,
        options: {
            provider: null as SearchAdvancedProvider,
            restIdForParametersInAdv: 'Job',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    } as SearchAdvancedConfig;
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) viewsComp: SearchViewsComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig({
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions({
            module: {
                refreshOnNavigateEnd: true,
                viewModeSwitcher: false,
                viewMode: 'table',
                searchType: 'workflow',
                exportPath: 'Job',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                pager: {
                    enabled: true
                },
                isDraggable: {
                    enabled: true,
                },
                isExpandable: {
                    enabled: true,
                    startState: 'collapsed'
                },
                popupsSelectors: {
                    settings: {
                        popupEl: '.workflowSettingsPopup',
                        popupMultiEl: '.workflowMultiSettingsPopup'
                    }
                },
                displayNoRowsToShowLabel: true
                // topPanel: {
                //     enabled: true,
                //     typeComponent: WorkflowSlickGridPanelTopComp
                // }
            } as SlickGridConfigModuleSetups,
            plugin: {
                multiSelect: true
            } as SlickGridConfigPluginSetups
        } as SlickGridConfigOptions)
    } as SlickGridConfig);
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    protected searchSettingsConfig = {
        componentContext: this,
    } as SearchSettingsConfig;
    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    protected searchRecentConfig = {
        componentContext: this,
        options: {
            provider: null as SearchRecentProvider,
            viewType: 'adv.recent.searches.workflow',
            itemsLimit: 10
        }
    } as SearchRecentConfig;
    protected searchViewsConfig = {
        componentContext: this,
        options: {
            type: 'Job',
        }
    } as ViewsConfig;
    protected disabledGroupOperationButtons: boolean = true;
    protected disabledRestartButton: boolean = true;
    isReady: boolean = false;
    protected _refreshOnStored: boolean = false;
    constructor(protected viewsProvider: ViewsProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected appSettings: WorkflowAppSettings,
                protected router: Router,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                public exportProvider: ExportProvider,
                protected injector: Injector,
                private cdr: ChangeDetectorRef,
                private modalProvider: IMFXModalProvider
    ) {
        super(injector);

        // views provider
        this.searchViewsConfig.options.provider = viewsProvider;

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

    setOpenedSchedule(isOpen: boolean) {
        this.isOpenedSchedule = isOpen;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    expandAll() {
        (this.slickGridComp.provider as WorkflowSlickGridProvider).setAllExpanded(true);
        (this.slickGridComp.provider as WorkflowSlickGridProvider).isGridExpanded = true;
        (this.slickGridComp.provider as WorkflowSlickGridProvider).expandedRows = [];
    }

    collapseAll() {
        (this.slickGridComp.provider as WorkflowSlickGridProvider).setAllExpanded(false);
        (this.slickGridComp.provider as WorkflowSlickGridProvider).isGridExpanded = false;
        (this.slickGridComp.provider as WorkflowSlickGridProvider).expandedRows = [];
    }

    resetExpandCollapseButton() {
        (this.slickGridComp.provider as WorkflowSlickGridProvider).isGridExpanded = false;
    }

    issetColumns() {
        const sgp: WorkflowSlickGridProvider = this.slickGridComp && this.slickGridComp.config && (this.slickGridComp.provider as WorkflowSlickGridProvider) || null;
        return !!sgp && sgp.issetColumns();
    }

    issetData(): boolean {
        const sgp: WorkflowSlickGridProvider = this.slickGridComp && this.slickGridComp.config && (this.slickGridComp.provider as WorkflowSlickGridProvider) || null;
        return !!sgp && sgp.issetData();
    }

    ngAfterViewInit() {
        const sgp: SlickGridProvider = this.slickGridComp.provider;
        sgp.onDataUpdated.subscribe((data) => {
            this.checkButtonEnables();
        });
        sgp.onRowDelete.subscribe((data) => {
            this.checkButtonEnables();
        });
        sgp.onSelectRow.subscribe((data) => {
            this.checkButtonEnables();
        });
        this.isReady = true;
    }

    switchSchedule() {
        this.isOpenedSchedule = !this.isOpenedSchedule;
    }

    checkButtonEnables() {
        setTimeout(() => {
            this.checkRestartBtnEnable();
            this.checkGroupOperationButtonsEnable();
        });
    }

    checkRestartBtnEnable(): void {
        const sgp: WorkflowSlickGridProvider = this.slickGridComp.provider as WorkflowSlickGridProvider;
        if (!sgp) {
            return;
        }
        let sr = sgp.getSelectedRow();
        const sbr = sgp.getSelectedSubRow();
        if (!sr && sbr.hasOwnProperty('id')) {
            sr = (sgp.getDataView().getItemById([sbr.id]) as any).Tasks[sbr.index];
        }
        this.disabledRestartButton = (!(sr && sr['TSK_STATUS'] && sr['TSK_STATUS'] == 19));
    }

    checkGroupOperationButtonsEnable() {
        const sgp = this.slickGridComp.provider;
        if (!sgp) {
            return;
        }
        // let ids = sgp.getSelectedRowsIds();
        this.disabledGroupOperationButtons = (sgp as WorkflowSlickGridProvider).getSelectedSubRow().id === undefined;
        this.cdr.markForCheck();
    }

    isEnabledChangePriority() {
        if (this.slickGridComp && this.slickGridComp.isGridReady) {
            const sgp = this.slickGridComp.provider;
            const selectedJobRow = sgp.getSelectedRows();
            const selectedTaskRow = (sgp as WorkflowSlickGridProvider).getSelectedSubRow();
            let selectedTaskRowData = null;
            if (selectedTaskRow.hasOwnProperty('id')) {
                selectedTaskRowData = (sgp.getDataView().getItemById([selectedTaskRow.id]) as any).Tasks[selectedTaskRow.index];
            }

            if ( selectedJobRow.length === 1
                && selectedJobRow[0]
                && selectedJobRow[0]['CMB_STAT'] !== JobStatuses.COMPLETED) {
                return true;
            } else if (selectedTaskRow.id != undefined && selectedTaskRowData && selectedTaskRowData['TSK_STATUS'] !== JobStatuses.COMPLETED) {
                return true;
            } else {
                return false;
            }
        }

        return false;

    }

    openPriorityWizard() {
        const sgp = this.slickGridComp.provider;
        let selectedTaskRowData = null;
        const selectedTaskRow = (sgp as WorkflowSlickGridProvider).getSelectedSubRow();
        const isTaskSelected = selectedTaskRow && selectedTaskRow.hasOwnProperty('id');

        if (isTaskSelected) {
            selectedTaskRowData = (sgp.getDataView().getItemById([selectedTaskRow.id]) as any).Tasks[selectedTaskRow.index];
            const modal: IMFXModalComponent = this.modalProvider.showByPath(
                lazyModules.tasks_priority,
                TasksWizardPriorityComponent, {
                    size: 'md',
                    title: 'workflow.topPanel.wizard.priority.title',
                    position: 'center',
                    footerRef: 'modalFooterTemplate'
                },
                {
                    Tasks: [selectedTaskRowData['ID']],
                    Priority: [selectedTaskRowData['PRIORITY']]
                });
            modal.load().then((compRef: ComponentRef<TasksWizardPriorityComponent>) => {
                const comp: TasksWizardPriorityComponent = compRef.instance;
                comp.onShow();
                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name == 'ok') {
                        this.slickGridComp.provider.refreshGrid();
                    }
                });
            });
        } else {
            const modal: IMFXModalComponent = this.modalProvider.showByPath(
                lazyModules.wf_priority,
                WorkflowWizardPriorityComponent, {
                    size: 'md',
                    title: 'workflow.topPanel.wizard.priority.title',
                    position: 'center',
                    footerRef: 'modalFooterTemplate'
                },
                {
                    Jobs: this.slickGridComp.provider.getFieldsOfSelectedRows('ID'),
                    Priority: this.slickGridComp.provider.getFieldsOfSelectedRows('J_PR_NUM')
                });
            modal.load().then((compRef: ComponentRef<WorkflowWizardPriorityComponent>) => {
                const comp: WorkflowWizardPriorityComponent = compRef.instance;
                comp.onShow();
                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name == 'ok') {
                        this.slickGridComp.provider.refreshGrid();
                    }
                });
            });
        }
    }

    openRestartWizard() {
        const selectedSubRow = (this.slickGridComp.provider as any).getSelectedSubRow();
        if (Object.keys(selectedSubRow).length > 0) {
            const gridData: any[] = this.slickGridComp.provider.getData();
            const job = gridData.filter((el) => {
                return el.id == selectedSubRow.id;
            })[0];
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
                    jobId: job.ID,
                    taskIds: [job.Tasks[selectedSubRow.index].ID]
                });
            modal.load().then(() => {
                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name == 'ok') {
                        this.slickGridComp.provider.refreshGrid();
                    }
                });
            });
        }
    }

    doRefresh() {
        setTimeout(() => {
            this.refreshOn = !this.refreshOn;
            this._refreshOnStored = this.refreshOn;
            this.slickGridComp.provider.doRefresh('workflow');
            this.cdr.detectChanges();
        }, 0);
    }

    getIsReady(): boolean {
        if (this.isReady &&
            (!this.slickGridComp.provider.refreshTimer && this._refreshOnStored)) {
            this.refreshOn = this._refreshOnStored;
            this.slickGridComp.provider.doRefresh('workflow');
        }
        return this.isReady;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
