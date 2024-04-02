import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver, ComponentRef,
    ElementRef,
    Inject,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../../../../../modules/search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../../../../../modules/search/slick-grid/slick-grid';
import { ViewsProvider } from '../../../../../../../modules/search/views/providers/views.provider';
import { IMFXModalProvider } from "../../../../../../../modules/imfx-modal/proivders/provider";
import { IMFXModalComponent } from "../../../../../../../modules/imfx-modal/imfx-modal";
import {
    DoActionDelegate,
    DoActionFormatter
} from "../../../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter";
import { UserManagerService } from '../../services/settings.user-manager.service';
import { UserManagerGroupsSlickGridProvider } from './providers/slick.grid.provider';
import { UserManagerGroupsViewsProvider } from './providers/views.provider';
import { ManagerGroupModalComponent } from "../../modals/group.modal/group.modal.component";
import { SlickGridRowData } from '../../../../../../../modules/search/slick-grid/types';
import { IMFXModalAlertComponent } from '../../../../../../../modules/imfx-modal/comps/alert/alert';
import { NotificationService } from '../../../../../../../modules/notification/services/notification.service';
import { IMFXModalEvent } from '../../../../../../../modules/imfx-modal/types';
import { DeleteFormatter } from '../../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter';
import {TranslateService} from "@ngx-translate/core";
import {SettingsFormatter} from "../../../../../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'user-manager-groups-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        UserManagerGroupsSlickGridProvider,
        UserManagerService,
        UserManagerGroupsViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: UserManagerGroupsViewsProvider},
        {provide: SlickGridProvider, useClass: UserManagerGroupsSlickGridProvider},
    ]
})

export class UserManagerGroupsGridComponent implements OnInit, DoActionDelegate {
    @ViewChild('datasetFilter', {static: false}) datasetFilter: ElementRef;
    private slickGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#userManagerGroupsSlickGridExternalWrapper",
                selectFirstRow: false,
                clientSorting: true,
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.userSettingsPopup'
                    }
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                fullWidthRows: true,
                forceFitColumns: false,
                multiAutoHeight: true
            }
        })
    });
    private data: any = {};
    private editModal: IMFXModalComponent;
    private tableData;
    private inputTimeout;
    private hideDisabled = false;
    private hidePassThru = false;
    private selectedData = null;
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject();
    @ViewChild('overlay', {static: true}) private overlay: any;
    @ViewChild('userManagerGroupsGridWrapper', {static: true}) private userManagerGridWrapper: any;
    @ViewChild('slickGridComp', {static: true}) private slickGridComp: SlickGridComponent;

    constructor(private cdr: ChangeDetectorRef,
                private userManagerService: UserManagerService,
                private modalProvider: IMFXModalProvider,
                private viewsProvider: ViewsProvider,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                protected notificationService: NotificationService) {
        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    ngOnInit() {
        let self = this;
        this.overlay.show(self.userManagerGridWrapper.nativeElement);
        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
            self.getGroupsTable();
            // self.slickGridComp.provider.onRowMouseDblClick.subscribe((data)=> {
            //     delete data.row.id;
            //     this.doAction(data);
            // });
            // self.slickGridComp.provider.onSelectRow.subscribe((data)=> {
            //     if(data && data.length > 0 && self.gridReady) {
            //         //let row = this.configTablesGrid.provider.slick.getRowById(data[0]);
            //         let row = self.slickGridComp.provider.getSelectedRow();
            //         self.selectedData = {
            //             field: "ID",
            //             value: row["ID"]
            //         }
            //     }
            // });
        });
    }

    rebuildGroup($event) {
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        let data = this.slickGridComp.provider.getSelectedRowData();
        this.userManagerService.rebuildGroupView([data.ID])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
            this.notificationService.notifyShow(1, this.translate.instant("user_management.users.rebuilded"), true, 1000);
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        },(err)=>{
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        });
    }

    public getGroupsTable(isReload = false) {
        this.gridReady = false;
        if (!isReload) {
            this.selectedData = null;
        }
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        this.cdr.detectChanges();
        let self = this;
        this.slickGridComp.provider.dataView.beginUpdate();
        this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
        this.slickGridComp.provider.dataView.setFilterArgs({
            filter: ""
        });
        this.slickGridComp.provider.dataView.endUpdate();
        // this.tableId = tableId;
        self.data.tableColumns = [];

        this.userManagerService.getGroups()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
            if (res) {
                self.tableData = res;
                self.prepareDataForGrid(res, self, isReload);
                self.cdr.detectChanges();
            }
        });
    }

    prepareDataForGrid(res, self, isReload) {
        if (!isReload) {
            self.data.tableColumns.unshift({
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
            });
            self.data.tableColumns.unshift({
                id: -1,
                name: ' ',
                field: '',
                width: 35,
                resizable: false,
                sortable: false,
                formatter: DeleteFormatter,
                multiColumnSort: false,
                isCustom: true,
                headerCssClass: "disable-reorder",
                __deps: {
                    injector: self.injector,
                    data: {
                        withModal: true,
                        modalData: {
                            text: 'user_management.groups.delete_ask',
                            title: 'user_management.groups.delete',
                            //textParams: {groupName: res.View.Columns.length > 0 ? res.View.Columns[0].Field : 'ID'},
                            textParams: {
                                groupName: 'NAME',
                            },
                            message: 'user_management.groups.delete_success',
                        },
                        //tableId: tableId,
                    }
                }
            });
            self.data.tableColumns.unshift({
                id: -2,
                name: ' ',
                field: '',
                width: 35,
                resizable: false,
                sortable: false,
                formatter: DoActionFormatter,
                multiColumnSort: false,
                isCustom: true,
                __deps: {
                    injector: this.injector,
                    data: {
                        titleHint: "common_hints.edit",
                        actionDelegate: this
                    }
                }
            });

            self.data.tableColumns = self.data.tableColumns.concat(self.viewsProvider.getCustomColumns());
        }

        self.data.tableRows = res;
        self.bindDataToGrid(isReload);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        clearTimeout(this.inputTimeout);
        this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        this.slickGridComp.onGridReady.unsubscribe();
        //this.editModal.modalEvents.unsubscribe();
        this.slickGridComp.provider.onRowMouseDblClick.unsubscribe();
        this.slickGridComp.provider.onSelectRow.unsubscribe();
    }

    doAction(data) {
        this.showModal(data.data.ID);
    }

    updateDataset(filter, timeout = 500) {
        clearTimeout(this.inputTimeout);
        if (timeout == 0)
            this.overlay.show(this.userManagerGridWrapper.nativeElement);
        this.inputTimeout = setTimeout(() => {
            this.slickGridComp.provider.slick.scrollRowToTop(0);
            if (timeout != 0)
                this.overlay.show(this.userManagerGridWrapper.nativeElement);
            filter = filter.trim();
            this.slickGridComp.provider.dataView.beginUpdate();
            this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
            this.slickGridComp.provider.dataView.setFilterArgs({
                filter: filter
            });
            this.slickGridComp.provider.dataView.endUpdate();
            let renderedRange = this.slickGridComp.provider.slick.getRenderedRange();
            this.slickGridComp.provider.dataView.setRefreshHints({
                ignoreDiffsBefore: renderedRange.top,
                ignoreDiffsAfter: renderedRange.bottom + 1,
                isFilterNarrowing: true,
                isFilterExpanding: true,
            });
            this.slickGridComp.provider.dataView.refresh();
            this.slickGridComp.provider.slick.invalidateAllRows();
            this.slickGridComp.provider.slick.render();
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);

        }, timeout);
    }

    clearDatasetFilter() {
        $(this.datasetFilter.nativeElement).val("");
        this.updateDataset("", 0);
    }

    toggleDisabled() {
        this.hideDisabled = !this.hideDisabled;
        this.updateDataset($(this.datasetFilter.nativeElement).val(), 0);
    }

    togglePassThru() {
        this.hidePassThru = !this.hidePassThru;
        this.updateDataset($(this.datasetFilter.nativeElement).val(), 0);
    }

    filterByValue(o, filterArgs) {
        var result = Object.keys(o).some(k => {
            if (o[k] == null) {
                return false;
            }
            if (o.hasOwnProperty(k)) {
                return o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            }
            else {
                return false;
            }
        });
        return result;
    }

    showModal(rowId: any = null) {
        let isNew = false;
        if (!rowId) {
            isNew = true;
        }
        this.editModal = this.modalProvider.showByPath(lazyModules.manager_group_modal, ManagerGroupModalComponent, {
            size: 'xl',
            title: isNew ? 'config_tables.modal.addtitle' : 'config_tables.modal.edittitle',
            position: 'center',
            footerRef: 'modalFooterTemplate',
            dialogStyles: {
                'max-width': '90%',
                'max-height': '85%'
            },
            usePushState: false
        }, {context: this, data: this.tableData, isNew: isNew, rowId: rowId});

        this.editModal.load().then((cr: ComponentRef<ManagerGroupModalComponent>) => {
            const groupModal: ManagerGroupModalComponent = cr.instance;
            groupModal.onSaveGroup.subscribe(() => {
                this.getGroupsTable(true);
            });
        });
    }

    private refresh() {
        this.slickGridComp.provider.dataView.setItems(this.data.tableRows);
        this.slickGridComp.provider.dataView.endUpdate();
        this.slickGridComp.provider.slick.invalidateAllRows();
        this.slickGridComp.provider.slick.render();
        this.overlay.hide(this.userManagerGridWrapper.nativeElement);
    }


    // through self. do not touch
    private bindDataToGrid(isReload) {
        let self = this;
        if (!isReload) {
            this.slickGridComp.provider.setGlobalColumns(this.data.tableColumns);
            this.slickGridComp.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.slickGridComp.provider.buildPageByData({Data: this.data.tableRows});

        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
            self.slickGridComp.provider.autoSizeColumns();
            self.slickGridComp.provider.slick.setSortColumns([]);
            self.gridReady = true;
            self.cdr.detectChanges();
            if (self.selectedData != null) {
                setTimeout(() => {
                    if(this.destroyed$.isStopped) {
                        return;
                    }
                    self.slickGridComp.provider.setSelectedBy(self.selectedData.field, self.selectedData.value, true);
                });
            }
            else {
                setTimeout(() => {
                    if(this.destroyed$.isStopped) {
                        return;
                    }
                    self.slickGridComp.provider.slick.scrollRowToTop(0);
                    self.slickGridComp.provider.setSelectedRow();
                });
            }
        });

        setTimeout(() => {
            if(this.destroyed$.isStopped) {
                return;
            }
            self.overlay.hide(this.userManagerGridWrapper.nativeElement);
            self.cdr.detectChanges();
            if(isReload) {
                self.cdr.detectChanges()
                self.updateDataset($(this.datasetFilter.nativeElement).val().trim(), 100);
            }
        }, 1);
    }

    private getSelectedRow(): SlickGridRowData {
        if (this.slickGridComp.provider.getSlick()) {
            return this.slickGridComp.provider.getSelectedRow();
        }
    }
}










