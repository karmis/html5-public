import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
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
import { UserManagerUsersSlickGridProvider } from './providers/slick.grid.provider';
import { UserManagerUsersViewsProvider } from './providers/views.provider';
import { ManagerUserModalComponent } from "../../modals/edit.modal/user.modal.component";
import { SlickGridRowData } from "../../../../../../../modules/search/slick-grid/types";
import { SettingsFormatter } from "../../../../../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {TranslateService} from "@ngx-translate/core";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {lazyModules} from "../../../../../../../app.routes";
import {SecurityService} from "../../../../../../../services/security/security.service";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";

@Component({
    selector: 'user-manager-users-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        UserManagerUsersSlickGridProvider,
        UserManagerService,
        UserManagerUsersViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: UserManagerUsersViewsProvider},
        {provide: SlickGridProvider, useClass: UserManagerUsersSlickGridProvider},
    ]
})

export class UserManagerUsersGridComponent implements OnInit, DoActionDelegate {

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
                externalWrapperEl: "#userManagerUsersSlickGridExternalWrapper",
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
                forceFitColumns: false
            }
        })
    });
    private data: any = {};
    private userModal: IMFXModalComponent;
    private tableData;
    private inputTimeout;
    private hideDisabled = false;
    private hidePassThru = false;
    private selectedData = null;
    public destroyed$: Subject<any> = new Subject();
    @ViewChild('overlay', {static: true}) private overlay: any;
    @ViewChild('userManagerGridWrapper', {static: true}) private userManagerGridWrapper: any;
    @ViewChild('slickGridComp', {static: true}) private slickGridComp: SlickGridComponent;

    constructor(private cdr: ChangeDetectorRef,
                private userManagerService: UserManagerService,
                private modalProvider: IMFXModalProvider,
                private viewsProvider: ViewsProvider,
                protected notificationService: NotificationService,
                private securityService: SecurityService,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

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
            self.getUsersTable();
            self.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                delete data.row.id;
                this.doAction(data);
            });
            self.slickGridComp.provider.onSelectRow.subscribe((data) => {
                if (data && data.length > 0) {
                    //let row = this.configTablesGrid.provider.slick.getRowById(data[0]);
                    let row = self.slickGridComp.provider.getSelectedRow();
                    self.selectedData = {
                        field: "ID",
                        value: row["ID"]
                    };
                }
            });
        });
    }

    public getUsersTable(isReload = false) {
        if (!isReload) {
            this.selectedData = null;
        }
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        this.cdr.detectChanges();
        let self = this;
        this.slickGridComp.provider.dataView.beginUpdate();
        this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
        this.slickGridComp.provider.dataView.setFilterArgs({
            filter: "",
            hideDisabled: this.hideDisabled,
            hidePassThru: this.hidePassThru
        });
        this.slickGridComp.provider.dataView.endUpdate();
        self.data.tableColumns = [];

        this.userManagerService.getUsers(true)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
            if (res) {
                res.map(item => {
                    item['DISABLED'] = (item.USR_TYPES & 0x40000000) != 0 ? 1 : 0;
                    return item;
                });
                self.tableData = res;
                self.prepareDataForGrid(res, self, isReload);
                self.cdr.detectChanges();
            }
        });
    }

    prepareDataForGrid(res, self, isReload) {
        // self.data.tableColumns.unshift({
        //     id: -1,
        //     name: ' ',
        //     field: '',
        //     width: 35,
        //     resizable: false,
        //     sortable: false,
        //     formatter: DeleteFormatter,
        //     multiColumnSort: false,
        //     isCustom: true,
        //     headerCssClass: "disable-reorder",
        //     __deps: {

        //
        //
        //         injector: this.injector,
        //         data: {
        //             withModal: true,
        //             modalData: {
        //                 text: 'global_settings.modal_remove_conformation_s',
        //                 textParams: {groupName: 'USER_ID'},
        //                 message: 'global_settings.remove_success_s'
        //             }
        //         }
        //     }
        // });
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
        // this.slickGridComp.onGridReady.unsubscribe();
    }

    doAction(data) {
        this.showModal(data.data ? data.data : data.row ? data.row : data);
    }

    updateDataset(filter, timeout = 500, isFilter = true) {
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
                filter: filter,
                hideDisabled: this.hideDisabled,
                hidePassThru: this.hidePassThru
            });
            this.slickGridComp.provider.dataView.endUpdate();
            var renderedRange = this.slickGridComp.provider.slick.getRenderedRange();

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
            if(isFilter) {
                this.selectedData = null;
                setTimeout(() => {
                    if(this.destroyed$.isStopped) {
                        return;
                    }
                    this.slickGridComp.provider.slick.scrollRowToTop(0);
                    this.slickGridComp.provider.setSelectedRow();
                });
            }
            else {
                if (this.selectedData != null) {
                    setTimeout(() => {
                        if(this.destroyed$.isStopped) {
                            return;
                        }
                        this.slickGridComp.provider.setSelectedBy(this.selectedData.field, this.selectedData.value, true);
                    });
                }
                else {
                    setTimeout(() => {
                        if(this.destroyed$.isStopped) {
                            return;
                        }
                        this.slickGridComp.provider.slick.scrollRowToTop(0);
                        this.slickGridComp.provider.setSelectedRow();
                    });
                }
            }
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

        if (filterArgs.hideDisabled && o["DISABLED"]) {
            return false;
        }

        if (filterArgs.hidePassThru && o["FLGS"]) {
            return false;
        }

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

    rebuildAllUser() {
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        this.userManagerService.rebuildUserView([])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
            this.notificationService.notifyShow(1, this.translate.instant("user_management.users.rebuilded_all"), true, 1000);
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        },(err)=>{
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        });
    }

    rebuildUser($event) {
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        let data = this.slickGridComp.provider.getSelectedRowData();
        this.userManagerService.rebuildUserView([data.ID])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
            this.notificationService.notifyShow(1, this.translate.instant("user_management.users.rebuilded"), true, 1000);
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        },(err)=>{
            this.overlay.hide(this.userManagerGridWrapper.nativeElement);
        });
    }

    canResetUserPassword() {
        if (!this.slickGridComp.isGridReady) {
            return false;
        }

        const data = this.slickGridComp.provider.getSelectedRowData();
        if (data && (data['FLGS'] & 0x01) == 0) {
            return true;
        }

        return false;
    }

    resetUserPassword($events) {
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        let data = this.slickGridComp.provider.getSelectedRowData();
        this.userManagerService.resetPassword(data.USER_ID)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
                this.notificationService.notifyShow(1, this.translate.instant("user_management.users.password_changed"), true, 1000);
                this.overlay.hide(this.userManagerGridWrapper.nativeElement);
            },(err)=>{
                this.notificationService.notifyShow(2, err,  true, 3000);
                this.overlay.hide(this.userManagerGridWrapper.nativeElement);
            });
    }

    resetUser2fa($events) {
        this.overlay.show(this.userManagerGridWrapper.nativeElement);
        let data = this.slickGridComp.provider.getSelectedRowData();
        this.userManagerService.reset2fa(data.USER_ID)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
                this.notificationService.notifyShow(1, this.translate.instant("user_management.users.2fa_changed"), true, 1000);
                this.overlay.hide(this.userManagerGridWrapper.nativeElement);
            },(err)=>{
                this.notificationService.notifyShow(2, err,  true, 3000);
                this.overlay.hide(this.userManagerGridWrapper.nativeElement);
            });
    }

    cloneUser($events) {
        let data = this.slickGridComp.provider.getSelectedRowData();
        if (data) {
            this.showModal(data, true);
        }
    }

    showModal(data: any = null, clone: boolean = false, isNew = false) {
        this.userModal = this.modalProvider.showByPath(lazyModules.manager_user_modal, ManagerUserModalComponent, {
            size: "xxl",
            title: clone||isNew?'user_management.users.modal.title_new':'user_management.users.modal.title_edit',
            position: 'center',
            footerRef: 'modalFooterTemplate',
            usePushState: false
        }, {context: this, rowData: data, clone: clone});
        this.userModal.load().then(() => {
            this.userModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    this.getUsersTable(true);
                }
            });
        });
    }

    private getSelectedRow(): SlickGridRowData {
        if (this.slickGridComp.provider.getSlick()) {
            return this.slickGridComp.provider.getSelectedRow();
        }
    }

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
                self.updateDataset($(this.datasetFilter.nativeElement).val().trim(), 100, false);
            }
        }, 1);
    }
    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
    deleteUser() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        let data = this.slickGridComp.provider.getSelectedRowData();
        modal.load().then(cr =>{
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                "user_management.users.delete_user_confirm",
                {userName: data.USER_ID}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.userManagerService.deleteUser(data.ID).subscribe((resp) => {
                        this.notificationService.notifyShow(1, "user_management.users.user_deleted");
                        this.getUsersTable(true);
                        modal.hide();
                    }, (err) => {
                        let error = err.error ? (err.error.Message || err.error.Error) : this.translate.instant('common.error_message')
                        this.notificationService.notifyShow(2, error);
                    }, () => {

                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }
    canBeDeleted() {
        if (this.slickGridComp.isGridReady) {
            let selectedRow = this.slickGridComp.provider.getSelectedRowData();
            if (selectedRow && selectedRow.USER_ID == 'TMDDBA') {
                return false;
            } else {
                return true;
            }
        }
    }
}










