import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild, ViewEncapsulation, ComponentRef
} from "@angular/core";
import { BaseSearchModel } from "../../../../../../../../../models/search/common/base.search";
import { SlickGridResp } from "../../../../../../../../../modules/search/slick-grid/types";
import { SearchModel } from "../../../../../../../../../models/search/common/search";
import { AdvancedSearchGroupRef } from "../../../../../../../../../modules/search/advanced/types";
import { SearchAdvancedComponent } from "../../../../../../../../../modules/search/advanced/search.advanced";
import { NotificationService } from "../../../../../../../../../modules/notification/services/notification.service";
import { SearchAdvancedConfig } from "../../../../../../../../../modules/search/advanced/search.advanced.config";
import { SearchAdvancedProvider } from "../../../../../../../../../modules/search/advanced/providers/search.advanced.provider";
import { SlickGridService } from "../../../../../../../../../modules/search/slick-grid/services/slick.grid.service";
import { MappingSlickGridProvider } from "../../../../../../../../mapping/providers/mapping.slick.grid.provider";
import { forkJoin, Observable } from "rxjs";
import { SettingsGroupsService } from "../../../../../../../../../services/system.config/settings.groups.service";
import { MappingAdvSetupProvider } from "./providers/mapping.adv.provider";
import { SupplierPortalSlickGridProvider } from "../../../../../../../../supplier-portal/providers/supplier.portal.slick.grid.provider";
import {
    IMFXControlsSelect2Component,
    Select2EventType
} from "../../../../../../../../../modules/controls/select2/imfx.select2";
import {IMFXModalComponent} from "../../../../../../../../../modules/imfx-modal/imfx-modal";
import {lazyModules} from "../../../../../../../../../app.routes";
import {SearchViewsColumnsComponent} from "./comps/views.columns/views.columns";
import {IMFXModalEvent} from "../../../../../../../../../modules/imfx-modal/types";
import { ViewsService } from "../../../../../../../../../modules/search/views/services/views.service";
import {
    SaveViewValidateResult,
    UserViewsOriginalType,
    ViewSaveResp,
    ViewType
} from "../../../../../../../../../modules/search/views/types";
import {IMFXModalProvider} from "../../../../../../../../../modules/imfx-modal/proivders/provider";
import {IMFXModalAlertComponent} from "../../../../../../../../../modules/imfx-modal/comps/alert/alert";
import {ReturnRequestStateType} from "../../../../../../../../base/types";
import {ViewDetailModalComp} from "../../../../../../../../../modules/search/views/comp/view.detail.modal/view.detail.modal.comp";
import { SettingsGroupType } from '../../../../../../types';
import { ColumnsOrderComponent } from '../../../../../../../../../modules/search/columns-order/columns.order';
import { IMFXModalPromptComponent } from '../../../../../../../../../modules/imfx-modal/comps/prompt/prompt';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'settings-groups-advanced-supplier-portal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SettingsGroupsService,
        SearchAdvancedProvider,
        MappingAdvSetupProvider,
        SlickGridService,
        SupplierPortalSlickGridProvider,
        {provide: 'MappingAdvSetupMediaProvider', useClass: MappingAdvSetupProvider},
        {provide: 'MappingAdvSetupVersionProvider', useClass: MappingAdvSetupProvider},
        MappingSlickGridProvider,
        IMFXModalProvider
    ]
})

export class SettingsGroupsAdvancedSupplierPortalComponent {
    get supplierDelHistColumnsSetup() {
        return this._supplierDelHistColumnsSetup;
    }
    get supplierAllOrdersColumnsSetup() {
        return this._supplierAllOrdersColumnsSetup;
    }
    @Input('versionCompleteSettings') versionCompleteSettings;
    @Input('viewsAllOrders') private viewsAllOrders;
    @Input('viewsDelHistory') private viewsDelHistory;
    @Input('advancedAllOrdersSearchCriteria') private advancedAllOrdersSearchCriteria;
    @Input('advancedDelHistorySearchCriteria') private advancedDelHistorySearchCriteria;
    @Input('versionNameOrder') private versionNameOrder;
    @Input('supplierAllOrdersColumnsSetup') private _supplierAllOrdersColumnsSetup;
    @Input('supplierDelHistColumnsSetup') private _supplierDelHistColumnsSetup;
    @Input('settingsGroup') private settingsGroup: SettingsGroupType;
    @Input('wfRiseSettings') private wfRiseSettings;
    @ViewChild('allOrdersComponent', {static: false}) private searchAdvancedComponentAllOrders: SearchAdvancedComponent;
    @ViewChild('delHistoryComponent', {static: false}) private searchAdvancedComponentDelHistory: SearchAdvancedComponent;
    versionNameOrderList = [];
    settingView = {
        allOrders: {
            Id: null,
            Name: null,
            Key: 'MediaPortalCurrentOrders',
            CurrentView: <ViewType>{},
            ActualViewColumns: {},
            ListViews: [],
            UserViews: [],
            ColumnsData: {},
            NoSelectedView: false,
        },
        delHistory: {
            Id: null,
            Name: null,
            Key: 'MediaPortalDeliveryHistory',
            CurrentView: <ViewType>{},
            ActualViewColumns: {},
            ListViews: [],
            UserViews: [],
            ColumnsData: {},
            NoSelectedView: false,
        }
    }
    activeTab: AdvanceType = 'allOrders';
    isDisabledBtn = true;
    isDataLoaded: boolean = true; // then async calls have ended.
    private dataAllOrders: SlickGridResp;
    private dataDelHistory: SlickGridResp;
    private wf_key: string = null;
    private readonly emptyData: SlickGridResp = {
        Rows: 0,
        Data: []
    };

    // views
    public modalProvider: IMFXModalProvider;
    listViews = [];
    @ViewChild('allOrdersViewControl', {static: false}) public allOrdersViewControl: IMFXControlsSelect2Component;
    @ViewChild('delHistoryViewControl', {static: false}) public delHistoryViewControl: IMFXControlsSelect2Component;

    searchAdvancedConfigAllOrders = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'MediaPortal',
            enabledQueryByExample: false,
            enabledSavedSearches: false,
            enabledQueryBuilder: true,
            enabledAddMultipleGroups: true,
            advancedSearchMode: 'builder',
            allowSaveSearchParams: false,
            allowClearSearchParams: false
        }
    };
    searchAdvancedConfigDelHistory = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'MediaPortal',
            enabledQueryByExample: false,
            enabledSavedSearches: false,
            enabledAddMultipleGroups: true,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder',
            allowSaveSearchParams: false,
            allowClearSearchParams: false
        }
    };
    // allOrdersSap
    // delHistorySap
    constructor(private cdr: ChangeDetectorRef,
                private notificationRef: NotificationService,
                @Inject('MappingAdvSetupMediaProvider') private allOrdersSap: MappingAdvSetupProvider,
                @Inject('MappingAdvSetupVersionProvider') private delHistorySap: MappingAdvSetupProvider,
                private injector: Injector,
                private sgs: SlickGridService,
                private mappingProvider: MappingSlickGridProvider,
                private suppierPortalSGP: SupplierPortalSlickGridProvider,
                private viewService: ViewsService
    ) {
        this.wf_key = this.mappingProvider.wf_key;
        this.resetData('delHistory');
        this.resetData('allOrders');
        this.searchAdvancedConfigAllOrders.options.provider = allOrdersSap;
        this.searchAdvancedConfigDelHistory.options.provider = delHistorySap;
        this.modalProvider = this.injector.get(IMFXModalProvider);
    };

    ngOnInit() {

        if (this.viewsAllOrders) {
            this.settingView.allOrders.Id = this.viewsAllOrders.Id;
            this.settingView.allOrders.Name = this.viewsAllOrders.Name;
        }
        if (this.viewsDelHistory) {
            this.settingView.delHistory.Id = this.viewsDelHistory.Id;
            this.settingView.delHistory.Name = this.viewsDelHistory.Name;
        }
    }

    public getAdvancedSettings(type: AdvanceType) {
        switch (type) {
            case 'allOrders':
                const advancedAssociateSettings = this.allOrdersSap.getModelsPreparedToRequest();
                return (this.getIsValidAdvSchema(type)) ? advancedAssociateSettings : null;
                break
            case 'delHistory':
                const advdelHistorySap = this.delHistorySap.getModelsPreparedToRequest();
                return (this.getIsValidAdvSchema(type)) ? advdelHistorySap : null;
                break
            case 'versionNameOrder':
                return this.versionNameOrder
                break

        }
    }

    public getVersionCompleteSupplierPortalSettings() {
        return this.suppierPortalSGP.vcSettings;
    }

    ngAfterViewInit() {
        let versionCompleteSettings = this.versionCompleteSettings;
        if (!$.isEmptyObject(versionCompleteSettings)) {
            this.suppierPortalSGP.vcSettings = $.extend(true, {}, versionCompleteSettings);
            this.cdr.markForCheck();
        }

        const advAllOrders = this.searchAdvancedComponentAllOrders;
        const advDelHistory = this.searchAdvancedComponentDelHistory;
        this.tab('allOrders');
        if (advAllOrders.isDataLoaded && advDelHistory.isDataLoaded) {
            this.doInit();
        } else {
            forkJoin([advAllOrders.onReady, advDelHistory.onReady]).subscribe(() => {
                this.doInit();
            });
        }
        this.loadViews();
    }
    public loadViews() {
        forkJoin({
            allOrders: this.viewService.getViews(this.settingView.allOrders.Key),
            delHistory: this.viewService.getViews(this.settingView.delHistory.Key)
        }).subscribe((views) => { //ViewsOriginalType

            this.settingView.allOrders.UserViews = views.allOrders.UserViews.filter(el => {return (<any>el).IsSelected == true});
            this.settingView.delHistory.UserViews = views.delHistory.UserViews.filter(el => {return (<any>el).IsSelected == true});

            this.settingView.allOrders.ColumnsData = views.allOrders.ViewColumns;
            this.settingView.delHistory.ColumnsData = views.delHistory.ViewColumns;

            this.settingView.allOrders.ListViews = this.allOrdersViewControl.turnArrayOfObjectToStandart(<any>views.allOrders.UserViews, {
                key: 'Id',
                text: 'Value',
            })
            this.settingView.delHistory.ListViews =  this.delHistoryViewControl.turnArrayOfObjectToStandart(<any>views.delHistory.UserViews, {
                key: 'Id',
                text: 'Value',
            })

            this.allOrdersViewControl.setData(this.settingView.allOrders.ListViews, true);
            this.delHistoryViewControl.setData(this.settingView.delHistory.ListViews, true);

            forkJoin({
                allOrders:  this.viewService.loadViewById(this.settingView.allOrders.Key, this.settingView.allOrders.Id),
                delHistory:  this.viewService.loadViewById(this.settingView.delHistory.Key, this.settingView.delHistory.Id)
            }).subscribe(viewsById => {
                if (viewsById.allOrders) {
                    this.settingView.allOrders.CurrentView = viewsById.allOrders;
                    this.settingView.allOrders.ActualViewColumns = viewsById.allOrders.ColumnData;
                    this.allOrdersViewControl.setSelectedByIds([this.settingView.allOrders.Id]);
                }
                if (viewsById.delHistory) {
                    this.settingView.delHistory.CurrentView = viewsById.delHistory;
                    this.settingView.delHistory.ActualViewColumns = viewsById.delHistory.ColumnData;
                    this.delHistoryViewControl.setSelectedByIds([this.settingView.delHistory.Id]);
                }
            });


            this.cdr.detectChanges();
        }, (err) => {
            console.log(err);
        });
    }


    loadView(id) {
        this.viewService.loadViewById(this.settingView[this.activeTab].Key, id).subscribe((view: ViewType) => {
            this.settingView[this.activeTab].CurrentView = view;
            this.settingView[this.activeTab].ActualViewColumns = view.ColumnData;
        });
    }

    onSelectView(eventData: Select2EventType) {
        if (eventData.params && eventData.params.isSameAsPrevious) return;
        this.isDisabledBtn = false;
        this.settingView[this.activeTab].NoSelectedView = false;
        this.settingView[this.activeTab].Id = eventData.params.data[0].id
        this.settingView[this.activeTab].Name = eventData.params.data[0].text

        this.loadView(eventData.params.data[0].id);

    }

    get curSetView() {
        return this.settingView[this.activeTab];
    }

    setCurSetView(type, value = null) {
        if(type === 'clear') {
            this.settingView[this.activeTab] = {
                Id: null,
                Name: null,
                Key: this.curSetView.Key,
                CurrentView: <ViewType>{},
                ActualViewColumns: {},
                ListViews: [],
                UserViews: [],
                ColumnsData: {},
                NoSelectedView: false,
            }
        } else {
            this.settingView[this.activeTab][type] = value;
        }
    }

    getWfRiseSettings() {
        return this.mappingProvider.raiseWFsettings
    }

    ngOnDestroy() {
        // this.destroyed$.next();
        // this.destroyed$.complete();
    }

    doInit() {
        const allOrdersAdvSetups = this.advancedAllOrdersSearchCriteria;
        const delHistoryAdvSetups = this.advancedDelHistorySearchCriteria;
        if (!$.isEmptyObject(allOrdersAdvSetups)) {
            // advSetups = <LoggerData>JSON.parse(advSetups.DATA);
            let structs: Array<AdvancedSearchGroupRef> = this.allOrdersSap.turnCriteriasToStructures(allOrdersAdvSetups);
            this.allOrdersSap.buildStructure(structs);


            this.cdr.markForCheck();
        }
        if (!$.isEmptyObject(delHistoryAdvSetups)) {
            // advSetups = <LoggerData>JSON.parse(advSetups.DATA);
            let structs: Array<AdvancedSearchGroupRef> = this.delHistorySap.turnCriteriasToStructures(delHistoryAdvSetups);
            this.delHistorySap.buildStructure(structs);
            this.cdr.markForCheck();
        }

        let wfSetups = this.wfRiseSettings;
        if (!$.isEmptyObject(wfSetups)) {
            this.mappingProvider.raiseWFsettings = $.extend(true, {}, wfSetups);
            this.cdr.markForCheck();
        }

        this.versionNameOrderList = this.versionNameOrder;

        this.cdr.detectChanges();
    }

    refreshData(type: AdvanceType) {
        const advProvider = type === 'allOrders' ? this.allOrdersSap : this.delHistorySap;
        const searchType = 'MediaPortal';

        if(!this.getIsValidAdvSchema(type)) {
            return;
        }

        let searchModel = new SearchModel();
        let baseSearchModel = new BaseSearchModel();
        baseSearchModel.setValue('');
        searchModel.setBase(baseSearchModel);
        searchModel.setAdvanced(advProvider.getModels());

        this.resetData(type);
        this.isDataLoaded = false;
        let obs = this.sgs.search(searchType, searchModel, 1).subscribe((resp: SlickGridResp) => {
            if (type === 'allOrders') {
                this.dataAllOrders = {...resp};
            } else {
                this.dataDelHistory = {...resp};
            }
            // this.data = {...resp};
            this.isDataLoaded = true;
            this.cdr.detectChanges();
        }, () => {
        });
    }

    getIsValidAdvSchema(type: AdvanceType) {
        const advProvider = type === 'allOrders' ? this.allOrdersSap : this.delHistorySap;
        if (advProvider.isValidStructureFlag.builder === true || advProvider.isValidStructureFlag.builder === null) {
            return true;
        } else {
            return false;
        }
    }

    onOkChooseModalCallBack = () => {
        this.cdr.detectChanges();
    };

    chooseModalCallBacks = {
        'ok': this.onOkChooseModalCallBack
    };

    tab(tab: AdvanceType) {
        this.activeTab = tab;
        this.isDisabledBtn = this.settingView[tab].Id;
        this.cdr.detectChanges();
    }

    private resetData(type: AdvanceType) {
        if (type === 'allOrders') {
            this.dataAllOrders = {...this.emptyData};
        } else {
            this.dataDelHistory = {...this.emptyData};
        }
    }

    private clearParams(type: AdvanceType) {
        const compRef: SearchAdvancedComponent = type === 'allOrders' ? this.searchAdvancedComponentAllOrders : this.searchAdvancedComponentDelHistory;
        compRef.clearParams();
    }

    openSetupColumnsModal(isNewView: boolean = false) {
        let isOpened = true;
        const columns = this.settingView[this.activeTab].ColumnsData;
        const  actualColumns = this.settingView[this.activeTab].ActualViewColumns;
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.supplier_config_search_columns, SearchViewsColumnsComponent, {
            size: 'md',
            class: 'imfx-modal stretch-modal',
            title: 'columns_modal.header',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            isNewView,
            columns,
            actualColumns,
            createNewView: isNewView
        });
        modal.load().then(() => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok_and_save') {
                    isOpened = false;
                    this.settingView[this.activeTab].CurrentView.ColumnData = e.state.actualColumns;
                    this.settingView[this.activeTab].ActualViewColumns = e.state.actualColumns;
                    modal.hide();
                    this.requestViewName(true, true).subscribe((res: any) => {
                        if (res && res.view != null) {
                            this.saveView(res.view, false).subscribe((view: ViewType) => {

                            });
                        }
                    });
                } else if (e.name == 'ok') {
                    isOpened = false;
                    this.settingView[this.activeTab].CurrentView.ColumnData = e.state.actualColumns;
                    this.settingView[this.activeTab].ActualViewColumns = e.state.actualColumns;
                    this.saveView(this.settingView[this.activeTab].CurrentView, false).subscribe(el => {

                    });
                    modal.hide();
                } else if (e.name.indexOf('hide') > -1 && isOpened === true) {
                    isOpened = false;
                }
            });
        });
    }

    deleteCurrentView() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then((cr: ComponentRef<IMFXModalAlertComponent>) => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText('views.delete_confirm');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {
                    let view: ViewType = {
                        Id: this.curSetView.Id,
                        Type: this.curSetView.Key,
                        ColumnData: {},
                        IsPublic: true,
                        SearchColumns: [],
                        ViewName:this.curSetView.Name,
                        PlacementId:0,
                        ShowThumbs: false
                    }

                    this.viewService.deleteView(view).subscribe((resp: ReturnRequestStateType) => {
                        this.setCurSetView('clear');
                        this.loadViews();
                    });
                    modal.hide();
                }
            });
        });
    };

    saveView(view: ViewType = null, isDefault: boolean = false): Observable<ViewType> {
        return new Observable((observer: any) => {
            this.viewService.saveView(view, isDefault).subscribe(
                (resp: ViewSaveResp) => {
                    if (resp.ErrorCode == null) {
                        if (resp.ObjectId) {
                            view.Id = resp.ObjectId;
                        }
                        this.viewService.clearOriginalView(this.settingView[this.activeTab].Key);
                        this.settingView[this.activeTab].Id = view.Id;
                        this.settingView[this.activeTab].Name = view.ViewName;
                        this.loadViews();
                        observer.next(view);
                    }
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                }
            );
        });

    }

    requestViewName(isNew: boolean = false, isPublic: boolean = false): Observable<any | null> {
        let self = this;
        return new Observable((observer: any) => {
            let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.view_detail_modal, ViewDetailModalComp, {
                size: 'md',
                title: 'views.save_view',
                position: 'center',
                footer: 'close|ok'
            });
            modal.load().then((cr: ComponentRef<ViewDetailModalComp>) => {
                let modalContent: ViewDetailModalComp = cr.instance;
                modalContent.setLabel('views.enter_view');
                modalContent.setPlaceholder('views.new_name_view');
                modalContent.setShowFooter(false);
                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name === 'ok') {
                        let viewName = modalContent.getValue();
                        let validRes: SaveViewValidateResult = this.validateViewName(viewName);
                        if (!validRes.valid) {
                            modalContent.setError(validRes.saveError);
                            return;
                        }
                        this.settingView[this.activeTab].CurrentView.ViewName = viewName;
                        this.settingView[this.activeTab].CurrentView.Id = 0;
                        this.settingView[this.activeTab].CurrentView.IsPublic = true;
                        this.settingView[this.activeTab].CurrentView.Type = this.settingView[this.activeTab].Key;
                        modal.hide();
                        observer.next({view:  this.settingView[this.activeTab].CurrentView, isDefault: false});
                        observer.complete();
                    } else if (e.name === 'hide') {
                        observer.next(null);
                        observer.complete();
                        modal.hide();
                    }
                });
            })
        });
    }

    saveViewAs() {
        this.requestViewName(true, true).subscribe((res: any) => {
            if (res && res.view != null) {
                this.saveView(res.view, false).subscribe((view: ViewType) => {});
            }
        });
    }

    validateViewName(string): SaveViewValidateResult {
        let res = {saveError: '', valid: true};
        let currentView: ViewType = this.settingView[this.activeTab].CurrentView;
        let userViews: UserViewsOriginalType[] = this.settingView[this.activeTab].UserViews;
        if ($.isEmptyObject(currentView.ColumnData)) {
            res = {saveError: "views.view_columns_is_empty", valid: false};
        }
        if (!string || string.trim() == '') {
            res = {saveError: "views.view_name_is_empty", valid: false};
        } else {
            $.each(userViews, (k, v) => {
                if (v == string) {
                    res = {saveError: "views.view_name_exist", valid: false};
                }
            });
        }
        return res;
    }

    getData(type: AdvanceType) {
        switch (type) {
            case "allOrders": return {Id: this.settingView.allOrders.Id, Name: this.settingView.allOrders.Name}
            case "delHistory": return {Id: this.settingView.delHistory.Id, Name: this.settingView.delHistory.Name}
        }
    }

    setupColumns(searchType: string, prefix: 'supplier.orders'|'supplier.history') {
        let setups = null;
        if (prefix === 'supplier.orders') {
            setups = this._supplierAllOrdersColumnsSetup
        } else if (prefix === 'supplier.history') {
            setups = this._supplierDelHistColumnsSetup
        }
        const modal = this.modalProvider.showByPath(lazyModules.columns_order, ColumnsOrderComponent, {
            size: 'md',
            title: 'Select columns',
            position: 'center',
            footer: 'cancel|ok'
        }, {
            searchType: searchType,
            prefix: 'columns.order' + '.' + prefix + '.' + this.settingsGroup.ID,
            selected: setups||{}
        });

        modal.load().then((cr: ComponentRef<ColumnsOrderComponent>) => {
            const comp: ColumnsOrderComponent = cr.instance;
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    if (prefix === 'supplier.orders') {
                        this._supplierAllOrdersColumnsSetup = comp.config.selected;
                    } else if (prefix === 'supplier.history') {
                        this._supplierDelHistColumnsSetup = comp.config.selected;
                    }

                    modal.hide();
                }
            })
        });
    }

    addItems() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
            IMFXModalPromptComponent, {
                size: 'md',
                title: 'settings_group.advanced_supplier_portal.add_version_btn',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr =>{
            let modalContent: IMFXModalPromptComponent =cr.instance;
            modalContent.setLabel('settings_group.advanced_supplier_portal.add_version_btn');
            modalContent.setPlaceholder('settings_group.advanced_supplier_portal.add_version_btn');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    let name = modalContent.getValue();
                    this.versionNameOrderList.push(name);
                    this.cdr.detectChanges();
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    editRow(item, index) {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
            IMFXModalPromptComponent, {
                size: 'md',
                title: 'settings_group.advanced_supplier_portal.change_version_btn',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr =>{
            let modalContent: IMFXModalPromptComponent =cr.instance;
            modalContent.setLabel('settings_group.advanced_supplier_portal.change_version_btn');
            modalContent.setValue(item);
            modalContent.setPlaceholder('settings_group.advanced_supplier_portal.change_version_btn');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    let name = modalContent.getValue();
                    if (name.length) {
                        this.versionNameOrderList[index] = name;
                    } else {
                        this.deleteRow(index)
                    }
                    this.cdr.detectChanges();
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    deleteRow(index) {
        this.versionNameOrderList.splice(index, 1);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.versionNameOrderList, event.previousIndex, event.currentIndex);
    }
}

export type AdvanceType =  'allOrders' | 'delHistory' | 'versionNameOrder';
