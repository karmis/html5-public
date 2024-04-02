import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Inject,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {UserManagerService} from "../../services/settings.user-manager.service";
import {SlickGridComponent} from "../../../../../../../modules/search/slick-grid/slick-grid";
import {SlickGridRowData} from "../../../../../../../modules/search/slick-grid/types";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../../../../../modules/search/slick-grid/slick-grid.config";
import {SlickGridProvider} from "../../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../../../../../../modules/search/slick-grid/services/slick.grid.service";
import {DoActionFormatter} from "../../../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter";
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {ViewsProvider} from "../../../../../../../modules/search/views/providers/views.provider";
import {UserNotificationsViewsProvider} from "./providers/views.provider";
import {UserNotificationsSlickGridProvider} from "./providers/slick.grid.provider";
import {DeleteFormatter} from "../../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter";
import {TreeStandardListTypes} from "../../../../../../../modules/controls/tree/types";
import {IMFXControlsTreeComponent} from "../../../../../../../modules/controls/tree/imfx.tree";
import {LookupFormatter} from "../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter";
import {LookupSearchUsersService} from "../../../../../../../services/lookupsearch/users.service";
import {SessionStorageService} from "ngx-webstorage";
import {NotificationsEditModalComponent} from "./modals/edit.modal/notifications.modal.component";
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {ArrayProvider} from '../../../../../../../providers/common/array.provider';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {lazyModules} from "../../../../../../../app.routes";
import {SystemConfigCommonComp} from "../../../system.config.common.comp";

@Component({
    selector: 'user-notifications',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/styles.scss'
    ],
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        UserNotificationsSlickGridProvider,
        UserManagerService,
        UserNotificationsViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: UserNotificationsViewsProvider},
        {provide: SlickGridProvider, useClass: UserNotificationsSlickGridProvider},
    ]
})
export class SettingsUserNotificationsComponent extends SystemConfigCommonComp {

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
                externalWrapperEl: "#userNotificationsSlickGridExternalWrapper",
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
    @ViewChild('notificationsTree', {static: false}) private tree: IMFXControlsTreeComponent;
    @ViewChild('slickGridComp', {static: false}) private slickGridComp: SlickGridComponent;
    @ViewChild('gridWrapper', {static: false}) private gridWrapper: any;
    @ViewChild('overlay', {static: false}) private overlay: any;
    private tableData;
    private editModal;
    private selectedSubscription = null;
    private data: any = {};
    private usersNames = [];
    private usersForenames = [];
    private usersSurnames = [];
    private userData = [];
    private initialNotifications = null;
    private notifications = null;
    private selectedNotification = null;
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject();
    private lookupData = {
        "1": "User Data - Instant Message",
        "2": "User Data - SMS",
        "3": "User Data - Email",
        "4": "Custom - Instant Message",
        "5": "Custom - SMS",
        "6": "Custom - Email"
    };

    constructor(private cdr: ChangeDetectorRef,
                private userManagerService: UserManagerService,
                private modalProvider: IMFXModalProvider,
                private viewsProvider: ViewsProvider,
                private notificationService: NotificationService,
                private arrayProvider: ArrayProvider,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(SessionStorageService) public sessionStorageService: SessionStorageService,
                @Inject(LookupSearchUsersService) public usersService: LookupSearchUsersService,
                @Inject(TranslateService) public translate: TranslateService,
                @Inject(Injector) public injector: Injector) {
        super();

        this.data = {
            tableRows: [],
            tableColumns: []
        };
        if (!this.sessionStorageService.retrieve("lookupsearch.users")) {
            this.usersService.getUsers()
                .pipe(takeUntil(this.destroyed$))
                .subscribe((res: any) => {
                    this.convertUsersToMap(res);
                });
        } else {
            this.convertUsersToMap(this.sessionStorageService.retrieve("lookupsearch.users"));
        }

    };

    convertUsersToMap(res) {
        res.forEach((element) => {
            this.usersNames[element.Id] = element.UserId;
            this.usersForenames[element.Id] = element.Forename;
            this.usersSurnames[element.Id] = element.Surname;
        });
        this.userData = res;
    }

    ngAfterViewInit() {
        let self = this;
        this.overlay.show(self.gridWrapper.nativeElement);
        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                self.getSubscriptionsTable();
                self.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                    delete data.row.id;
                    this.doAction(data);
                });
                self.slickGridComp.provider.onSelectRow.subscribe((data) => {
                    if (data && data.length > 0 && self.gridReady) {
                        //let row = this.configTablesGrid.provider.slick.getRowById(data[0]);
                        let row = self.slickGridComp.provider.getSelectedRow();
                        self.selectedSubscription = {
                            field: "ID",
                            value: row["ID"]
                        };
                    }
                });
            });
    }

    public getSubscriptionsTable(isReload = false) {
        this.gridReady = false;
        if (!isReload) {
            this.selectedNotification = null;
        }
        this.overlay.show(this.gridWrapper.nativeElement);
        this.cdr.detectChanges();
        let self = this;
        this.slickGridComp.provider.dataView.beginUpdate();
        //this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
        // this.slickGridComp.provider.dataView.setFilterArgs({
        //     filter: $(this.datasetFilter.nativeElement).val().trim(),
        //     hideDisabled: this.hideDisabled,
        //     hidePassThru: this.hidePassThru
        // });
        this.slickGridComp.provider.dataView.endUpdate();
        this.data.tableColumns = [];

        this.userManagerService.getNotificationsDefaults()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                if (res) {
                    self.initialNotifications = $.extend(true, [], res);
                    let normData: TreeStandardListTypes = this.tree.turnArrayOfObjectToStandart(
                        res,
                        {
                            key: 'ID',
                            title: 'NOTIF_NAME',
                            children: 'Children'
                        }
                    );
                    this.notifications = normData;
                    self.tree.setSource(normData);
                    self.tableData = [];

                    self.prepareDataForGrid(res, self, isReload);
                    self.cdr.detectChanges();
                }
            });
    }

    prepareDataForGrid(res, self, isReload) {
        if (!isReload) {
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
                            text: 'user_management.notifications.modal.fields.delete_subscription',
                            //textParams: {groupName: res.View.Columns.length > 0 ? res.View.Columns[0].Field : 'ID'},
                            textParams: {
                                // subscriptionName: 'SUBS_TYPE_str',
                                subscriptionName: 'SUBS_GROUP_str',
                                'userName': 'USER_ID_full_name'
                            },
                            message: 'global_settings.remove_success_s',
                        },
                        //tableId: tableId,
                        rows: res.Data
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
                    injector: self.injector,
                    data: {
                        titleHint: "common_hints.edit",
                        actionDelegate: this
                    }
                }
            });
            self.data.tableColumns.unshift({
                id: '3',
                name: this.translate.instant('user_management.notifications.table.type'),
                field: 'SUBS_TYPE',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                headerCssClass: "users-notifications-header",
                isCustom: true,
                width: 100,
                __deps: {
                    injector: self.injector,
                    lookupMap: self.lookupData
                }
            });
            self.data.tableColumns.unshift({
                id: '0',
                name: this.translate.instant('user_management.notifications.table.username'),
                field: 'USER_ID',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                headerCssClass: "users-notifications-header",
                isCustom: true,
                width: 100,
                __deps: {
                    injector: self.injector,
                    lookupMap: self.usersNames
                }
            });
            self.data.tableColumns.unshift({
                id: '1',
                name: this.translate.instant('user_management.notifications.table.forename'),
                field: 'USER_ID',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                headerCssClass: "users-notifications-header",
                isCustom: true,
                width: 100,
                __deps: {
                    injector: self.injector,
                    lookupMap: self.usersForenames
                }
            });
            self.data.tableColumns.unshift({
                id: '2',
                name: this.translate.instant('user_management.notifications.table.surname'),
                field: 'USER_ID',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                headerCssClass: "users-notifications-header",
                isCustom: true,
                width: 100,
                __deps: {
                    injector: self.injector,
                    lookupMap: self.usersSurnames
                }
            });

            self.data.tableColumns = self.data.tableColumns.concat(self.viewsProvider.getCustomColumns());
        }

        this.data.tableRows = res;
        this.bindDataToGrid(isReload);
    }


    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.overlay.hide(this.gridWrapper.nativeElement);
        this.slickGridComp.onGridReady.unsubscribe();
    }

    doAction(data) {
        this.editSubscription(data);
    }

    addSubscription() {
        this.showModal({
            ID: 0,
            NOTIFICATION_ID: this.selectedNotification.data.dirtyObj.ID,
            USER_ID: null,
            SUBS_TYPE: null,
            SUBS_INFO: null
        }, true, true);
    }

    editSubscription(data) {
        this.showModal(data.data ? data.data : data.row ? data.row : data);
    }

    removeSunscription() {
        //this.showModal(this.selectedNotification, false, false);
    }

    addNotification() {
        this.showModal(this.selectedNotification, false, true);
    }

    editNotification() {
        this.showModal(this.selectedNotification, false, false);
    }

    removeNotification() {
        let self = this;
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                "user_management.notifications.modal.confirm",
                {groupName: this.selectedNotification.title}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                modal.showOverlay(true, true);
                if (e.name === 'ok') {
                    self.selectedNotification.data.dirtyObj.ID = parseInt(self.selectedNotification.data.dirtyObj.ID) * -1;
                    self.userManagerService.editNotification({
                        ID: self.selectedNotification.data.dirtyObj.ID,
                        NOTIF_CODE: self.selectedNotification.data.dirtyObj.NOTIF_CODE,
                        NOTIF_NAME: self.selectedNotification.data.dirtyObj.NOTIF_NAME,
                        ParentId: self.selectedNotification.data.dirtyObj.ParentId
                    }).subscribe((res: any) => {
                        self.getSubscriptionsTable(true);
                        self.selectedNotification = null;
                        modal.hide();
                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
            //this.userManagerService.editSubscription(this.selectedNotification);
        });
    }

    showModal(data: any = null, notificationEdit: boolean = true, isNew: boolean = false) {
        this.editModal = this.modalProvider.showByPath(lazyModules.user_notification_modal, NotificationsEditModalComponent, {
            size: "md",
            title: 'user_management.notifications.modal.title',
            position: 'center',
            footerRef: 'modalFooterTemplate',
            usePushState: false
        }, {
            context: this,
            data: data,
            usersNames: this.usersNames,
            usersSurnames: this.usersSurnames,
            usersForenames: this.usersForenames,
            notificationEdit: notificationEdit,
            isNew: isNew
        });
        this.editModal.load().then((cr: ComponentRef<NotificationsEditModalComponent>) => {
            const self = this;
            this.editModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    if (res.$event.IsNotification) {
                        self.userManagerService.editSubscription(res.$event.Data).subscribe((res2) => {
                            self.getSubscriptionsTable(true);
                            self.selectedNotification = null;
                            self.notificationService.notifyShow(1, res.$event.IsNew ? "Added" : "Updated", true, 1000);
                            self.editModal.hide();
                        });
                    } else {
                        self.userManagerService.editNotification(res.$event.Data).subscribe((res2) => {
                            self.getSubscriptionsTable(true);
                            self.selectedNotification = null;
                            self.notificationService.notifyShow(1, res.$event.IsNew ? "Added" : "Updated", true, 1000);
                            self.editModal.hide();
                        });
                    }
                }
            });
        })

    }

    onEnterPress($event) {
        if($event && $event.event && $event.event.key == "Enter") {
            this.onSelect($event);
        }
    }

    onSelect($event) {
        if ($event.data.targetType != "expander") {
            this.selectedNotification = $event.data.node;
            var res = $.extend(true, [], this.selectedNotification.data.dirtyObj.Subscribers);
            // res.map(item =>{
            //     item['DISABLED'] = (item.USR_TYPES & 0x40000000) != 0 ? 1 : 0;
            //     return item;
            // });
            this.tableData = res;
            this.prepareDataForGrid(res, this, true);
            this.cdr.detectChanges();
        }
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

        $.each(this.data.tableRows, (k, row) => {
            // this.data.tableRows[k].SUBS_TYPE_str = this.lookupData[this.data.tableRows[k].SUBS_TYPE];
            if (this.selectedNotification && this.selectedNotification.title) {
                this.data.tableRows[k].SUBS_GROUP_str = this.selectedNotification.title;
            }

            this.data.tableRows[k].USER_ID_full_name = this.usersNames[this.data.tableRows[k].USER_ID];
        });
        this.slickGridComp.provider.buildPageByData({Data: this.data.tableRows});

        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                self.slickGridComp.provider.autoSizeColumns();
                self.slickGridComp.provider.slick.setSortColumns([]);
                self.gridReady = true;
                self.cdr.detectChanges();
                if (self.selectedSubscription != null) {
                    setTimeout(() => {
                        if (this.destroyed$.isStopped) {
                            return;
                        }
                        self.slickGridComp.provider.setSelectedBy(self.selectedSubscription.field, self.selectedSubscription.value, true);
                    });
                } else {
                    setTimeout(() => {
                        if (this.destroyed$.isStopped) {
                            return;
                        }
                        self.slickGridComp.provider.slick.scrollRowToTop(0);
                        self.slickGridComp.provider.setSelectedRow();
                    });
                }
            });

        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            self.overlay.hide(this.gridWrapper.nativeElement);
            self.cdr.detectChanges();
        }, 1);
    }
}
