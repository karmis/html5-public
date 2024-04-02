import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// Views
import {ViewsConfig} from '../../../../../modules/search/views/views.config';
import {SearchViewsComponent} from "../../../views/views";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {WFHistorySlickGridProvider} from "./providers/wf.history.tab.slickgrid.provider";
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {SlickGridColumn, SlickGridResp, SlickGridRowData} from "../../../slick-grid/types";
import {WFHistorySlickGridService} from "./services/wf.history.service";
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SecurityService} from "../../../../../services/security/security.service";
import {WorkflowHistoryViewsProvider} from "./providers/views.provider";
import {NotificationService} from "../../../../notification/services/notification.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'imfx-wf-history-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: SlickGridService, useClass: WFHistorySlickGridService},
        SlickGridProvider,
        WFHistorySlickGridProvider,
        {provide: SlickGridProvider, useClass: WFHistorySlickGridProvider},
        WorkflowHistoryViewsProvider
    ]
})
@Injectable()
export class IMFXWFHistoryTabComponent {
    config: any;
    compIsLoaded = false;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('wfHistorySlickGrid', {static: true}) slickGridComp: SlickGridComponent;

    private isGridExpanded: boolean = false;
    private columns: Array<SlickGridColumn>;

    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: WFHistorySlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                searchType: 'workflow',
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                search: {
                    enabled: false
                },
                pager: {
                    enabled: false
                },
                info: {
                    enabled: true
                },
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
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
                availableContextMenu: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 35,
                forceFitColumns: false
            }
        })
    });
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                protected securityService: SecurityService,
                private notificationService: NotificationService,
                private translate: TranslateService) {
    }

    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.compIsLoaded = true;

            (<WFHistorySlickGridProvider>this.slickGridComp.provider).setDefaultColumns(this.fillColumns(), this.columns.map(function(el){return el.field;}), true);
            setTimeout(()=>{
                (<WFHistorySlickGridProvider>this.slickGridComp.provider).getRowsById(this.config.file.ID, this.config.isCarrierDetail).pipe(
                    takeUntil(this.destroyed$)
                ).subscribe(
                    (resp: any) => {
                        (<WFHistorySlickGridProvider>this.slickGridComp.provider).buildPageByResponseData(resp);
                    },
                    (err) => {
                        let error = err.error ? err.error.Error : this.translate.instant("common.error_message");
                        this.notificationService.notifyShow(2, error, false);
                    }
                )
            });
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public loadComponentData() {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        if (!this.compIsLoaded) {
            (<WFHistorySlickGridProvider>this.slickGridComp.provider).setDefaultColumns(this.fillColumns(), this.columns.map(function(el){return el.field;}), true);
            (<WFHistorySlickGridProvider>this.slickGridComp.provider).getRowsById(this.config.file.ID).pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (resp: any) => {
                    (<WFHistorySlickGridProvider>this.slickGridComp.provider).buildPageByResponseData(resp);
                    this.compIsLoaded = true;
                },
                (err) => {
                    let error = err.error ? err.error.Error : this.translate.instant("common.error_message");
                    this.notificationService.notifyShow(2, error, false);
                }
            )
        }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    hasPermission(path) {
        return this.securityService.hasPermissionByPath(path);
    }

    expandAll() {
        (this.slickGridComp.provider as WFHistorySlickGridProvider).setAllExpanded(true);
        (this.slickGridComp.provider as WFHistorySlickGridProvider).isGridExpanded = true;
        (this.slickGridComp.provider as WFHistorySlickGridProvider).expandedRows = [];
        this.isGridExpanded = true;
    }

    collapseAll() {
        (this.slickGridComp.provider as WFHistorySlickGridProvider).setAllExpanded(false);
        (this.slickGridComp.provider as WFHistorySlickGridProvider).isGridExpanded = false;
        (this.slickGridComp.provider as WFHistorySlickGridProvider).expandedRows = [];
        this.isGridExpanded = false;
    }
    private fillColumns() {
        this.columns = [];
        this.columns = this.injector.get(WorkflowHistoryViewsProvider).getCustomColumns();
        return this.columns;
    }
}
