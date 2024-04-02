import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SearchViewsComponent} from '../../../../modules/search/views/views';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../../modules/search/slick-grid/slick-grid.config';
import {SlickGridProvider} from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../../../modules/search/slick-grid/services/slick.grid.service';
import {SecurityService} from '../../../../services/security/security.service';
import {SlickGridComponent} from '../../../../modules/search/slick-grid/slick-grid';
import {ViewsConfig} from '../../../../modules/search/views/views.config';
import {ViewsProvider} from '../../../../modules/search/views/providers/views.provider';
import {SearchSettingsConfig} from '../../../../modules/search/settings/search.settings.config';
import {IMFXModalComponent} from '../../../../modules/imfx-modal/imfx-modal';
import {WorkflowListViewsProvider} from './providers/wf.list.views.provider';
import {WorkflowSlickGridProvider} from '../../providers/workflow.slick.grid.provider';
//import { WorkflowProvider } from '../../../../providers/workflow/workflow.provider';
import {TaskWizardAbortComponent} from "../../../../modules/controls/task.wizards/abort/wizard";
import {IMFXModalEvent} from "../../../../modules/imfx-modal/types";
import {IMFXModalProvider} from "../../../../modules/imfx-modal/proivders/provider";
import {MisrService} from '../../../misr/services/service';
import {WorkflowListSlickGridProvider} from './providers/wf.list.slick.grid.provider';
import {Subject} from 'rxjs';
import {takeUntil} from "rxjs/operators";
import {lazyModules} from "../../../../app.routes";

@Component({
    selector: 'workflow-list-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [
        MisrService,
        SlickGridService,
        //WorkflowProvider,
        {provide: SlickGridProvider, useClass: WorkflowListSlickGridProvider},
        {provide: ViewsProvider, useClass: WorkflowListViewsProvider},
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WorkflowListComponent {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    public modalRef: IMFXModalComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                search: {
                    enabled: false
                },
                refreshOnNavigateEnd: false,
                viewModeSwitcher: false,
                viewMode: 'table',
                searchType: 'workflow',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                pager: {
                    enabled: true
                },
                isDraggable: {
                    enabled: false,
                },
                overlay: {
                    zIndex: 250
                },
                isExpandable: {
                    enabled: true,
                    startState: 'collapsed'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.workflowSettingsPopup',
                        'popupMultiEl': '.workflowMultiSettingsPopup'
                    }
                },
            } as SlickGridConfigModuleSetups,
            plugin: {
                multiSelect: true
            } as SlickGridConfigPluginSetups,
        })
    });
    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            available: {
                export: {
                    enabled: false
                },
                isMenuShow: {
                    viewsModify: true,
                    viewsSave: true,
                    viewsSaveAs: true,
                    viewsSaveAsGlobal: true,
                    viewsSaveAsDefault: true,
                    viewsDelete: true,
                    viewsReset: true,
                    viewsColumnsSetup: true,
                    viewsColumnsAutosize: true,
                    exportOptions: false
                }
            }
        }
    };
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'Job',
        }
    };
    protected disabledGroupOperationButtons: boolean = true;
    protected disabledRestartButton: boolean = true;
    protected previousIds: any[] = null;
    protected currentIds: any[] = null;
    protected currentType = null;
    private destroyed$: Subject<any> = new Subject();

    constructor(protected securityService: SecurityService,
                protected misrService: MisrService,
                protected injector: Injector,
                protected viewsProvider: ViewsProvider,
                private cdr: ChangeDetectorRef,
                private modalProvider: IMFXModalProvider) {
        this.modalRef = this.injector.get('modalRef');
        this.searchViewsConfig.options.provider = viewsProvider;
    }

    ngAfterViewInit() {
        let sgp: SlickGridProvider = this.slickGridComp.provider;
        sgp.onDataUpdated.subscribe((data) => {
            this.checkButtonEnables();
        });
        sgp.onRowDelete.subscribe((data) => {
            this.checkButtonEnables();
        });
        sgp.onSelectRow.subscribe((data) => {
            this.checkButtonEnables();
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    checkButtonEnables() {
        setTimeout(() => {
            this.checkRestartBtnEnable();
            this.checkGroupOperationButtonsEnable();
        });
    }

    checkRestartBtnEnable(): void {
        let sgp: WorkflowSlickGridProvider = this.slickGridComp.provider as WorkflowSlickGridProvider;
        if (!sgp)
            return;
        let sr = sgp.getSelectedRow();
        let sbr = sgp.getSelectedSubRow();
        if (!sr && sbr.hasOwnProperty('id')) {
            sr = (<any>sgp.getDataView().getItemById([sbr.id])).Tasks[sbr.index];
        }

        this.disabledRestartButton = (!(sr && sr['TSK_STATUS'] && sr['TSK_STATUS'] == 19));
    }

    checkGroupOperationButtonsEnable() {
        const sgp = this.slickGridComp.provider;
        if (!sgp)
            return;
        // let ids = sgp.getSelectedRowsIds();
        this.disabledGroupOperationButtons = (<WorkflowSlickGridProvider>sgp).getSelectedSubRow().id === undefined;
        this.cdr.markForCheck()
    }

    expandAll() {
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).setAllExpanded(true);
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).isGridExpanded = true;
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).expandedRows = [];
    }

    collapseAll() {
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).setAllExpanded(false);
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).isGridExpanded = false;
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).expandedRows = [];
    }

    resetExpandCollapseButton() {
        (<WorkflowSlickGridProvider>this.slickGridComp.provider).isGridExpanded = false;
    }

    issetColumns() {
        const sgp: WorkflowSlickGridProvider = this.slickGridComp && this.slickGridComp.config && (this.slickGridComp.provider as WorkflowSlickGridProvider) || null;
        return !!sgp && sgp.issetColumns();
    }

    issetData(): boolean {
        const sgp: WorkflowSlickGridProvider = this.slickGridComp && this.slickGridComp.config && (this.slickGridComp.provider as WorkflowSlickGridProvider) || null;
        return !!sgp && sgp.issetData();
    }

    loadData(ids?: any[], type: 'media' | 'version' | 'tape' = 'media', reload: boolean = true) {
        if (!ids) {
            if (!this.previousIds) {
                return;
            } else {
                this.currentIds = this.previousIds;
            }
        } else {
            this.previousIds = ids;
            this.currentIds = ids;
        }
        this.currentType = type;

        if (reload){
            this.getWorkFlowsByMedias(this.currentIds, type);
        }
    }

    loadDataByTask(id, type: 'tasks' = 'tasks') {
        if (!id) {
            if (!this.previousIds) {
                return;
            } else {
                this.currentIds = this.previousIds;
            }
        } else {
            this.previousIds = id;
            this.currentIds = id;
            this.currentType = type;
        }
        this.getWorkFlowsByTask(this.currentIds, type);
    }

    getWorkFlowsByTask(id, type: 'tasks' = 'tasks'): void {
        if (type == 'tasks') {
            this.misrService.getWorkflowsByTask(id)
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((resp: any[]) => {
                    this.setData(resp);
                }, () => this.slickGridComp.provider.hideOverlay(),
                () => this.slickGridComp.provider.hideOverlay());
        }
    }

    getWorkFlowsByMedias(ids: any[], type: 'media' | 'version' | 'tape' = 'media'): void {
        if (type == 'media') {
            this.misrService.getWorkflowsByMedias(ids)
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((resp: any[]) => {
                    this.setData(resp);
                }, () => this.slickGridComp.provider.hideOverlay(),
                () => this.slickGridComp.provider.hideOverlay());
        } else if (type == 'version') {
            this.misrService.getWorkflowsByVersions(ids)
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((resp: any[]) => {
                    this.setData(resp);
                }, () => this.slickGridComp.provider.hideOverlay(),
                () => this.slickGridComp.provider.hideOverlay());
        } else if (type == 'tape') {
            this.misrService.getWorkflowsByTape(ids)
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((resp: any[]) => {
                    this.setData(resp);
                }, () => this.slickGridComp.provider.hideOverlay(),
                () => this.slickGridComp.provider.hideOverlay());
        }
    }

    onRefresh(): void {
        this.slickGridComp.provider.showOverlay();
        if (this.currentType == 'tasks') {
            this.getWorkFlowsByTask(this.currentIds)
        } else {
            this.getWorkFlowsByMedias(this.currentIds, this.currentType);
        }
    }

    setData(data: any[]) {
        this.slickGridComp.provider.buildPageByData({Data: data});
        this.slickGridComp.provider.resize();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    openRestartWizard() {
        let selectedSubRow = (<any>this.slickGridComp.provider).getSelectedSubRow();
        if (Object.keys(selectedSubRow).length > 0) {
            let gridData: Array<any> = this.slickGridComp.provider.getData();
            let job = gridData.filter(el => {
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
}
