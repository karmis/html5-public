import {
    ApplicationRef,
    ChangeDetectionStrategy,
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
import { LookupFormatter } from "../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter";
import { IMFXModalProvider } from "../../../../../../../modules/imfx-modal/proivders/provider";
import {
    DoActionDelegate,
    DoActionFormatter
} from "../../../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {SystemSettingsService} from "../../services/settings.system-settings.service";
import {SystemSettingsViewsProvider} from "./providers/views.provider";
import {SystemSettingsSlickGridProvider} from "./providers/slick.grid.provider";
import {SystemSettingFormatter} from "../../../../../../../modules/search/slick-grid/formatters/system-setting/system-setting.formatter";

@Component({
    selector: 'system-settings-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridProvider,
        SlickGridService,
        SystemSettingsService,
        ViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: SystemSettingsViewsProvider},
        {provide: SlickGridProvider, useClass: SystemSettingsSlickGridProvider},
    ]
})

export class SystemSettingsGridComponent implements OnInit, DoActionDelegate {

    private systemSettingsGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#externalWrapperSystemSettingsTables",
                selectFirstRow: false,
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                fullWidthRows: true,
                forceFitColumns: false,
                multiAutoHeight: true
            }
        })
    });

    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";
    private data: any = {};
    private tableData;
    private lookups;
    private groups;
    private inputTimeout;
    private groupFilter = "";
    private selectedData = null;
    private lookupsMap = [];
    private numberRanges = null;
    private gridReady = false;
    private hasClear = false;
    private someDataChanged = false;
    private destroyed$: Subject<any> = new Subject();
    @ViewChild('overlayGroup', {static: true}) private overlayGroup: any;
    @ViewChild('systemSettingsGridWrapper', {static: true}) private systemSettingsGridWrapper: any;
    @ViewChild('systemSettingsGrid', {static: true}) private systemSettingsGrid: SlickGridComponent;
    @ViewChild('datasetFilter', {static: false}) datasetFilter: ElementRef;
    @ViewChild('importButton', {static: false}) importButton: ElementRef;

    constructor(private cdr: ChangeDetectorRef,
                private systemSettingsService: SystemSettingsService,
                private translate: TranslateService,
                protected notificationService: NotificationService,
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
        this.toggleOverlay(true);
        this.systemSettingsService.getGroups()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                this.lookups = res;
                this.groups = this.convertToMap(res);
                setTimeout(() => {
                    if (this.destroyed$.isStopped) {
                        return;
                    }
                    this.bindDataToGrid(false);
                    this.getSystemSettingsTable(false);
                });
            });
        this.systemSettingsGrid.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                self.systemSettingsGrid.provider.onRowMouseDblClick.subscribe((data) => {
                    delete data.row.id;
                    self.doAction({
                        data: data.row
                    });
                });
                self.systemSettingsGrid.provider.onSelectRow.subscribe((data) => {

                    if (data && data.length > 0 && this.gridReady) {
                        let row = self.systemSettingsGrid.provider.getSelectedRow();
                        if (row && (!self.selectedData || self.selectedData.Id != row.Id)) {
                            self.selectedData = null;
                            self.cdr.detectChanges();
                            let r = <any>Object.assign({}, row);
                            if (r.ValueType == "ComboSingle") {
                                /*if(self.selectedData.Options.indexOf("..") > -1) {
                                    var ranges = self.selectedData.Options.split("..");
                                    for(let i = ranges[0]; i <= ranges[1]; i++) {
                                        self.lookupsMap[i] = i;
                                    }
                                }*/
                                var options = r.Options.split(',');
                                self.lookupsMap = [];
                                self.hasClear = false;
                                for (let i = 0; i < options.length; i++) {
                                    if (options[i] == "[NULL]") {
                                        self.hasClear = true;
                                        self.lookupsMap.push({
                                            id: null,
                                            text: "",
                                        });
                                    }
                                    else
                                        self.lookupsMap.push({
                                            id: options[i],
                                            text: options[i],
                                        });
                                }
                            } else if (r.ValueType == "NumberBox" && r.Options && r.Options.indexOf("..") > -1) {
                                this.numberRanges = r.Options.split("..");
                                //(input)="numberRanges ? ($event.target.value < numberRanges[0] ? $event.target.value = numberRanges[0] : ($event.target.value > numberRanges[1] ? $event.target.value = numberRanges[1] : return)) : return"
                            }
                            self.selectedData = r;
                            self.cdr.detectChanges();
                        }
                    }
                    else {
                        self.selectedData = null;
                        self.cdr.detectChanges();
                    }
                });
            });
    }

    public getSystemSettingsTable(isReload: boolean = false) {
        this.gridReady = false;
        if (!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.toggleOverlay(true);
        let self = this;
        this.systemSettingsGrid.provider.dataView.beginUpdate();
        this.systemSettingsGrid.provider.dataView.setFilter(this.filterByValue);
        this.systemSettingsGrid.provider.dataView.setFilterArgs({
            filter: $(this.datasetFilter.nativeElement).val().trim(),
            groupFilter: this.groupFilter,
            Lookups: this.lookups
        });
        self.data.tableColumns = [];
        this.systemSettingsService.getTable()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                if (res) {
                    self.tableData = res;
                    self.processTable(res, self, isReload);
                    if (!isReload) {
                        self.validateGrid();
                    }
                    self.cdr.detectChanges();
                }
            });
    }

    toggleOverlay(show) {
        if (show)
            this.overlayGroup.show(this.systemSettingsGridWrapper.nativeElement);
        else
            this.overlayGroup.hide(this.systemSettingsGridWrapper.nativeElement);
    }

    processTable(res, self, isReload) {
        if (!isReload) {
            self.data.tableColumns.unshift({
                id: -2,
                name: " ",
                field: 'IsChanged',
                width: 18,
                minWidth: 18,
                resizable: false,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: -1,
                name: ' ',
                field: '',
                width: 35,
                resizable: false,
                sortable: false,
                formatter: DoActionFormatter,
                multiColumnSort: false,
                headerCssClass: "disable-reorder",
                isCustom: true,
                __deps: {
                    injector: this.injector,
                    data: {
                        titleHint: "system_settings.save_item",
                        optionalIconStyle: "save-icon",
                        actionDelegate: this
                    }
                }
            });
            self.data.tableColumns.unshift({
                id: 0,
                name: self.translate.instant("system_settings.fields.name"),
                field: 'Name',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 1,
                name: self.translate.instant("system_settings.fields.code"),
                field: 'Code',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 2,
                name: self.translate.instant("system_settings.fields.value"),
                field: "Value",
                resizable: true,
                sortable: true,
                formatter: SystemSettingFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            });
            self.data.tableColumns.unshift({
                id: 3,
                name: self.translate.instant("system_settings.fields.group"),
                field: "GroupId",
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector,
                    lookupMap: this.lookups
                }
            });
            self.data.tableColumns.unshift({
                id: 4,
                name: self.translate.instant("system_settings.fields.description"),
                field: 'Description',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: true,
            });
            /*self.data.tableColumns.unshift({
                id: 1,
                name: self.translate.instant("system_settings.fields.task_type"),
                field: "TaskType",
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector,
                    lookupMap: this.lookups
                }
            });
            self.data.tableColumns.unshift({
                id: 5,
                name: self.translate.instant("system_settings.fields.ignore_presets"),
                field: "IgnorePresets",
                resizable: true,
                sortable: true,
                formatter: CheckBoxFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            });
            self.data.tableColumns.unshift({
                id: 6,
                name: self.translate.instant("system_settings.fields.created_by"),
                field: 'CreatedBy',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 7,
                name: self.translate.instant("system_settings.fields.created"),
                field: 'Created',
                width: 60,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
                minWidth: 60,
                isFrozen: false,
                resizable: true,
                formatter: DatetimeFormatter,
                enableColumnReorder: true,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            });
            self.data.tableColumns.unshift({
                id: 8,
                name: self.translate.instant("system_settings.fields.modified_by"),
                field: 'ModifiedBy',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 9,
                name: self.translate.instant("system_settings.fields.modified"),
                field: 'Modified',
                width: 60,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
                isFrozen: false,
                minWidth: 60,
                resizable: true,
                formatter: DatetimeFormatter,
                enableColumnReorder: true,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                }
            });*/
        }

        self.data.tableRows = res;
        self.validateGrid(isReload)
    }

    convertToMap(lookupData) {
        var result = [];
        var keys = Object.keys(lookupData);
        for (var i = 0; i < keys.length; i++) {
            result.push({
                key: keys[i],
                value: lookupData[keys[i]]
            });
        }
        return result;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.toggleOverlay(false);
        clearTimeout(this.inputTimeout);

        this.systemSettingsGrid.provider.onRowMouseDblClick.unsubscribe();
        this.systemSettingsGrid.provider.onSelectRow.unsubscribe();
    }

    export(all: boolean = false) {
        var result = [];
        if(!all) {
            var dataView = this.systemSettingsGrid.provider.dataView;
            var length = dataView.getLength();
            for(var i = 0; i < length; i++)
                result.push(dataView.getItem(i).Id);
        }
        else {
            result = this.tableData.map((x)=>x.Id);
        }
        this.systemSettingsService.export(result).subscribe((res: any) =>{
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res));
            element.setAttribute('download', "system_settings.msf");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        });
    }

    import(data) {
        var input = data.target;
        var reader = new FileReader();
        reader.onload = () => {
            this.systemSettingsService.import(reader.result).subscribe((res: any) =>{
                this.notificationService.notifyShow(1, this.translate.instant("system_settings.imported"), true, 1000, true);
                this.getSystemSettingsTable(true);
            });
            input.value = null;
        };
        if(input.files.length == 1) {
            reader.readAsText(input.files[0]);
        }
    }

    doAction(data) {
        if (!data.data.IsChanged || data.data.IsChanged.length == 0)
            return;
        delete data.data.id;
        delete data.data.$id;
        delete data.data.IsChanged;
        this.systemSettingsService.saveSetting(data.data).subscribe((x) => {
                this.notificationService.notifyShow(1, "Setting " + data.data.Name + " Saved", true, 1000, true);
                this.getSystemSettingsTable(true);
            },
            (err) => {
                this.notificationService.notifyShow(2, err, false, 1000, true);
                this.getSystemSettingsTable(true);
            });
    }

    onChangeGroupFilter(val) {
        this.groupFilter = val;
        this.updateDataset($(this.datasetFilter.nativeElement).val(), 1, false);
    }
    updateDataset(filter, timeout = 500, clearSelected = false) {
        clearTimeout(this.inputTimeout);
        if (timeout == 0)
            this.toggleOverlay(true);
        this.inputTimeout = setTimeout(() => {
            if(clearSelected)
                this.selectedData = null;
            setTimeout(() => {
                this.systemSettingsGrid.provider.slick.scrollRowToTop(-100);
            });

            if (timeout != 0)
                this.toggleOverlay(true);
            filter = filter.trim();
            this.systemSettingsGrid.provider.dataView.beginUpdate();
            this.systemSettingsGrid.provider.dataView.setFilter(this.filterByValue);
            this.systemSettingsGrid.provider.dataView.setFilterArgs({
                filter: filter,
                groupFilter: this.groupFilter,
                Lookups: this.lookups
            });
            this.systemSettingsGrid.provider.dataView.endUpdate();
            var renderedRange = this.systemSettingsGrid.provider.slick.getRenderedRange();
            this.systemSettingsGrid.provider.dataView.setRefreshHints({
                ignoreDiffsBefore: renderedRange.top,
                ignoreDiffsAfter: renderedRange.bottom + 1,
                isFilterNarrowing: true,
                isFilterExpanding: true,
            });
            this.systemSettingsGrid.provider.dataView.refresh();
            this.systemSettingsGrid.provider.slick.invalidateAllRows();
            this.systemSettingsGrid.provider.slick.render();
            this.cdr.detectChanges();
            this.systemSettingsGrid.provider.resize();
            setTimeout(()=>{
                    if(this.selectedData != null) {
                        this.systemSettingsGrid.provider.setSelectedBy("Id", this.selectedData.Id, true);
                    }
                    else {
                        this.systemSettingsGrid.provider.slick.scrollRowToTop(0);
                        this.systemSettingsGrid.provider.setSelectedRow(1);
                        this.systemSettingsGrid.provider.setSelectedRow(0);
                    }
            });
            this.toggleOverlay(false);
        }, timeout);
    }

    onChangeDescription(val) {
        this.selectedData.Description = val.trim();
        var item = this.tableData.filter((x) => x.Id == this.selectedData.Id);

        if (item.length > 0) {
            item[0]["IsChanged"] = "*";
            this.updateDataset($(this.datasetFilter.nativeElement).val(), 0);
            item[0].Description = this.selectedData.Description;
        }
    }

    onChangeValue(val) {
        if(val === null)
            return;
        var item = this.tableData.filter((x) => x.Id == this.selectedData.Id);
        if (item.length > 0) {
            item[0]["IsChanged"] = "*";
            if(this.selectedData.ValueType=='CheckBox') {
                switch (this.selectedData.Value) {
                    case "1":
                    case true: {
                        this.selectedData.Value = "2";
                        break;
                    }
                    case "2":
                    case false: {
                        this.selectedData.Value = "0";
                        break;
                    }
                    case "0": {
                        this.selectedData.Value = "1";
                        break;
                    }
                }
                item[0].Value = this.selectedData.Value;
            }
            else if (typeof val === 'object') {
                if (val.params.data.length > 0)
                    item[0].Value = val.params.data[0].id;
                else
                    item[0].Value = null;
            }
            else {
                item[0].Value = val;
            }
            this.updateDataset($(this.datasetFilter.nativeElement).val(), 0);
        }
    }

    checkIfNumber($event){
        if($event.keyCode != 8) {
            var result = $event.key.match(/^\d+$/g);
            if(result == null) {
                $event.preventDefault();
                return false;
            }
        }
    }

    totalCounter = 0;
    totalCounterProcessed = 0;

    saveAll() {
        if (!this.selectedData)
            return;

        var forProcess = [];
        this.totalCounter = 0;
        this.totalCounterProcessed = 0;
        for (var i = 0; i < this.tableData.length; i++) {
            if (this.tableData[i].IsChanged != undefined && this.tableData[i].IsChanged.length > 0) {
                this.totalCounter++;
                forProcess.push(this.tableData[i]);
            }
            delete this.tableData[i].id;
            delete this.tableData[i].$id;
            delete this.tableData[i].IsChanged;
            delete this.tableData[i].__contexts;
        }
        for (var i = 0; i < forProcess.length; i++) {
            this.systemSettingsService.saveSetting(forProcess[i]).subscribe((x) => {
                    this.totalCounterProcessed++;
                    this.processSaveAll();
                },
                (err) => {
                    this.totalCounterProcessed++;
                    this.processSaveAll();
                    this.notificationService.notifyShow(2, err, false, 1000, true);
                });
        }
    }

    processSaveAll() {
        if (this.totalCounter == this.totalCounterProcessed) {
            this.getSystemSettingsTable(true);
            this.notificationService.notifyShow(1, this.translate.instant("system_settings.saved_all"), true, 1000, true);
        }
    }

    clearDatasetFilter() {
        $(this.datasetFilter.nativeElement).val("");
        this.updateDataset("", 0, true);
    }

    filterByValue(o, filterArgs) {
        var result = Object.keys(o).some(k => {
            if (o[k] === null) {
                return false;
            }
            if (o.hasOwnProperty(k)) {
                if (filterArgs.groupFilter.length > 0) {
                    return filterArgs.groupFilter == o["GroupId"] && o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase())
                } else if (o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase())) {
                    return true;
                }
                return false;
            } else {
                return false;
            }
        });
        return result;
    }

    validateGrid(isReload = true) {
        for (var i = 0; i < this.tableData.length; i++) {
            this.tableData[i].IsChanged = "";
            this.validate();
        }
        this.bindDataToGrid(isReload);
    }

    public validate() {
        return true;
    }

    private firstLoad = true;

    private bindDataToGrid(isReload) {
        let self = this;
        if (!isReload) {
            this.systemSettingsGrid.provider.setGlobalColumns(this.data.tableColumns);
            this.systemSettingsGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.systemSettingsGrid.provider.buildPageByData({Data: this.data.tableRows});

        this.systemSettingsGrid.whenGridRendered((e, grid) => {
            self.systemSettingsGrid.provider.autoSizeColumns();
            self.systemSettingsGrid.provider.slick.setSortColumns([]);
            self.gridReady = true;
            self.cdr.detectChanges();
            if (this.selectedData != null) {
                self.systemSettingsGrid.provider.setSelectedBy("Id", self.selectedData.Id, true);
            } else {
                self.systemSettingsGrid.provider.slick.scrollRowToTop(0);
                self.systemSettingsGrid.provider.setSelectedRow();
            }
        });

        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            if (this.firstLoad) {
                this.firstLoad = false;
            } else {
                self.toggleOverlay(false);
            }
            self.cdr.detectChanges();
        }, 1);
    }
}









