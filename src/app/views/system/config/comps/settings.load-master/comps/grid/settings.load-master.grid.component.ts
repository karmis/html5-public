import {
    AfterViewInit,
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
import {LoadMasterSlickGridProvider} from "./providers/slick.grid.provider";
import { CheckBoxFormatter } from "../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter";
import { LookupFormatter } from "../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter";
import { DeleteFormatter } from "../../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter";
import { IMFXModalProvider } from "../../../../../../../modules/imfx-modal/proivders/provider";
import { IMFXModalComponent } from "../../../../../../../modules/imfx-modal/imfx-modal";
import {
    DoActionDelegate,
    DoActionFormatter
} from "../../../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter";
import {LoadMasterService} from "../../services/settings.load-master.service";
import {LoadMasterViewsProvider} from "./providers/views.provider";
import {LoadMasterChangeModalComponent} from "../../modals/edit.modal/load-master.change.modal.component";
import {LookupService} from "../../../../../../../services/lookup/lookup.service";
import {PresetsFormatter} from "../../../../../../../modules/search/slick-grid/formatters/presets/presets.formatter";
import {QueuesFormatter} from "../../../../../../../modules/search/slick-grid/formatters/queues/queues.formatter";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {ValidationFormatter} from "../../../../../../../modules/search/slick-grid/formatters/validation/validation.formatter";
import {DatetimeFormatter} from "../../../../../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {OverlayComponent} from "../../../../../../../modules/overlay/overlay";
import {lazyModules} from "../../../../../../../app.routes";
import * as _ from 'lodash'

@Component({
    selector: 'load-master-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridProvider,
        SlickGridService,
        LoadMasterService,
        ViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: LoadMasterViewsProvider},
        {provide: SlickGridProvider, useClass: LoadMasterSlickGridProvider},
    ]
})

export class LoadMasterGridComponent implements OnInit, DoActionDelegate, AfterViewInit {

    private loadMasterGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#externalWrapperLoadMasterTables",
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
    private editModal: IMFXModalComponent;
    private tableData;
    private lookups;
    private presetsLookup;
    private inputTimeout;
    private selectedData = null;
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject();
    @ViewChild('overlayGroup', {static: true}) private overlayGroup: OverlayComponent;
    @ViewChild('loadMasterGridWrapper', {static: true}) private loadMasterGridWrapper: any;
    @ViewChild('loadMasterGrid', {static: true}) private loadMasterGrid: SlickGridComponent;
    @ViewChild('datasetFilter', {static: false}) datasetFilter: ElementRef;

    data = {
        tableRows: [],
        tableColumns: []
    };

    constructor(private cdr: ChangeDetectorRef,
                private loadMasterService: LoadMasterService,
                private translate: TranslateService,
                private modalProvider: IMFXModalProvider,
                protected lokupService: LookupService,
                protected notificationService: NotificationService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

    };

    ngOnInit() {
        this.toggleOverlay(true);
    }

    ngAfterViewInit() {
        const self = this;
        this.lokupService.getLookups("AutomatedTasksTypes")
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
                this.lookups = this.convertToMap(res);
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.bindDataToGrid(false);
                this.getLoadMasterTable(false);
            });
        this.loadMasterGrid.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(()=>{
                self.loadMasterGrid.provider.onRowMouseDblClick.subscribe((data)=> {
                    const clone = _.cloneDeep(data);
                    delete clone.row.id;
                    self.doAction({
                        data: clone.row
                    });
                });
                self.loadMasterGrid.provider.onSelectRow.subscribe((data)=> {
                    if(data && data.length > 0 && this.gridReady) {
                        let row = self.loadMasterGrid.provider.getSelectedRow();
                        if(row) {
                            self.selectedData = {
                                field: "ID",
                                value: row["ID"]
                            }
                        }

                    }
                });
            });
    }

    public getLoadMasterTable(isReload: boolean = false) {
        console.log("getLoadMasterTable");
        this.gridReady = false;
        if(!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.toggleOverlay(true);
        let self = this;
        this.loadMasterGrid.provider.dataView.beginUpdate();
        this.loadMasterGrid.provider.dataView.setFilter(this.filterByValue);
        this.loadMasterGrid.provider.dataView.setFilterArgs({
            filter: $(this.datasetFilter.nativeElement).val().trim(),
            Lookups: this.lookups
        });
        self.data.tableColumns = [];
        this.loadMasterService.getTable()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
            if(res && res.Filters) {
                self.tableData = res.Filters;
                self.presetsLookup = res.Presets;
                self.processTable(res.Filters, self, isReload);
                if(!isReload) {
                    self.validateGrid();
                }
                self.cdr.detectChanges();
            }
        });
    }

    toggleOverlay(show) {
        if(show)
            this.overlayGroup.show(this.loadMasterGridWrapper.nativeElement);
        else
            this.overlayGroup.hide(this.loadMasterGridWrapper.nativeElement);
    }

    processTable(res, self, isReload) {
        console.log("processTable");
        if (!isReload) {
            self.data.tableColumns.unshift({
                id: -3,
                name: ' ',
                field: 'ValidationMessage',
                width: 35,
                resizable: false,
                sortable: false,
                formatter: ValidationFormatter,
                multiColumnSort: false,
                isCustom: true,
                headerCssClass: "disable-reorder",
                __deps: {
                    injector: this.injector,
                    data: {
                        component: this
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
                headerCssClass: "disable-reorder",
                isCustom: true,
                __deps: {
                    injector: this.injector,
                    data: {
                        titleHint: "consumer_settings.edit",
                        actionDelegate: this
                    }
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
                    injector: this.injector,
                    data: {
                        withModal: true,
                        modalData: {
                            text: 'global_settings.modal_remove_conformation_s',
                            textParams: {groupName: 'Id'},
                            message: 'global_settings.remove_success_s'
                        },
                        rows: self.tableData,
                        component: this
                    }
                }
            });

            self.data.tableColumns.unshift({
                id: 0,
                name: self.translate.instant("load_master.fields.id"),
                field: 'Id',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });

            self.data.tableColumns.unshift({
                id: 1,
                name: self.translate.instant("load_master.fields.task_type"),
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
                id: 3,
                name: self.translate.instant("load_master.fields.queues"),
                field: "Queues",
                resizable: true,
                sortable: true,
                formatter: QueuesFormatter,
                //cssClass: 'wrap-prew-rap',
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            });

            self.data.tableColumns.unshift({
                id: 4,
                name: self.translate.instant("load_master.fields.presets_selected"),
                field: "Presets",
                resizable: true,
                sortable: true,
                formatter: PresetsFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector
                }
            });

            self.data.tableColumns.unshift({
                id: 5,
                name: self.translate.instant("load_master.fields.ignore_presets"),
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
                name: self.translate.instant("load_master.fields.created_by"),
                field: 'CreatedBy',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 7,
                name: self.translate.instant("load_master.fields.created"),
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
                name: self.translate.instant("load_master.fields.modified_by"),
                field: 'ModifiedBy',
                width: 60,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 9,
                name: self.translate.instant("load_master.fields.modified"),
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
            });
        }

        self.data.tableRows = res;
        self.validateGrid(isReload)
    }

    convertToMap(lookupData) {
        var result = {};
        for(var i =0; i < lookupData.length; i++)
        {
            result[lookupData[i].ID] = lookupData[i].Name;
        }
        return result;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.toggleOverlay(false);
        clearTimeout(this.inputTimeout);
        // this.loadMasterGrid.onGridReady.unsubscribe();
        this.loadMasterGrid.provider.onRowMouseDblClick.unsubscribe();
        this.loadMasterGrid.provider.onSelectRow.unsubscribe();
    }

    doAction(data) {
        this.showModal(data);
    }

    updateDataset(filter, timeout = 500) {
        clearTimeout(this.inputTimeout);
        if(timeout == 0)
            this.toggleOverlay(true);
        this.inputTimeout = setTimeout(() => {
            setTimeout(()=>{
                this.loadMasterGrid.provider.slick.scrollRowToTop(-100);
            });

            if(timeout != 0)
                this.toggleOverlay(true);
            filter = filter.trim();
            this.loadMasterGrid.provider.dataView.beginUpdate();
            this.loadMasterGrid.provider.dataView.setFilter(this.filterByValue);
            this.loadMasterGrid.provider.dataView.setFilterArgs({
                filter: filter,
                Lookups: this.lookups
            });
            this.loadMasterGrid.provider.dataView.endUpdate();
            var renderedRange = this.loadMasterGrid.provider.slick.getRenderedRange();
            this.loadMasterGrid.provider.dataView.setRefreshHints({
                ignoreDiffsBefore: renderedRange.top,
                ignoreDiffsAfter: renderedRange.bottom + 1,
                isFilterNarrowing: true,
                isFilterExpanding: true,
            });
            this.loadMasterGrid.provider.dataView.refresh();
            this.loadMasterGrid.provider.slick.invalidateAllRows();
            this.loadMasterGrid.provider.slick.render();
            this.toggleOverlay(false);
        }, timeout);
    }

    clearDatasetFilter() {
        $(this.datasetFilter.nativeElement).val("");
        this.updateDataset("", 0);
    }

    filterByValue(o, filterArgs) {
        var result = Object.keys(o).some(k => {
            if(o[k] == null) {
                return false;
            }
            delete o.__contexts;
            delete o.$id;
            delete o.EntityKey;
            if(filterArgs.Lookups.hasOwnProperty(k)) {
                if(o[k] < 1) {
                    return false;
                }
                var arr = filterArgs.Lookups[k].filter(z => {
                    return z.ID == o[k];
                })
                if(!arr[0]) {
                    return false;
                }
                return arr[0].Name.toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            }
            else if(o.hasOwnProperty(k)) {
                if(k == "Queues") {
                    for(var i = 0; i < o[k].length; i++) {
                        if(o[k][i].Name && o[k][i].Name.length > 0) {
                            if(o[k][i].Name.toLowerCase().includes(filterArgs.filter.toLowerCase())) {
                                return true;
                            }
                        }
                    }
                }
                else if(o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase())) {
                    return true;
                }
                return false;
            }
            else {
                return false;
            }
        });
        return result;
    }

    validateGrid(isReload = true) {
        var all = this.tableData;
        var presetsLookup = this.presetsLookup.map((val) => {
            return {
                id: val.PresetId,
                text: val.PresetName
            }
        });
        for(var i = 0; i < this.tableData.length; i++) {
            this.tableData[i].ValidationMessage = null;
            this.validate(all, presetsLookup, this.tableData[i], true);
        }
        this.bindDataToGrid(isReload);
    }

    public validate(all, presetsLookup, current, isTable = false) {
        if(!current.TaskType) {
            this.notificationService.notifyShow(2, "Task Type is required field!");
            return false;
        }

        var message = "";
        var valid = true;
        var sameTypeFilters = all.filter((x) => {
            return x.Id != current.Id && x.TaskType == current.TaskType;
        });

        if (sameTypeFilters.length > 0) {
            //same task + same ID = warning
            var tmp = sameTypeFilters.map((x) => {
                return x.Queues;
            });
            var flattenQueuesItems = [];
            if(tmp.length > 0) {
                flattenQueuesItems = tmp.reduce((a, b) => {
                    return a.concat(b);
                });
            }

            if(flattenQueuesItems.length > 0) {
                var currentQueuesItemsFlat = current.Queues.map((x) => {
                    return x.ID;
                });
                var intersectedId = flattenQueuesItems.map((p) => {
                    return p.ID;
                }).filter(id => -1 !== currentQueuesItemsFlat.indexOf(id));

                if (intersectedId.length > 0) {
                    var ids = intersectedId.join(", ");
                    if(isTable) {
                        message += "Warning. Duplicated queue IDs for " + this.lookups[current.TaskType] + ": " + ids;
                    }
                    else {
                        this.notificationService.notifyShow(2, "Warning. Duplicated queue IDs for " + this.lookups[current.TaskType] + ": " + ids);
                    }

                    valid = false;
                }
            }

            //same task + same preset = error

            tmp = sameTypeFilters.filter((i) => {
                return !i.IgnorePresets
            }).map((x) => {
                return x.Presets;
            });

            var y1 = [];
            if(tmp.length > 0) {
                y1 = tmp.reduce((a, b) => {
                    return a.concat(b);
                }).map((x) => {
                    return x.Id;
                });
            }

            tmp = sameTypeFilters.filter((i) => {
                return i.IgnorePresets
            }).map((x) => {
                return x.Presets;
            });

            var y2 = [];
            if(tmp.length > 0) {
                tmp = tmp.reduce((a, b) => {
                    return a.concat(b);
                }).map((x) => {
                    return x.Id;
                });

                y2 = presetsLookup.filter((x) => {
                    if(current.Id == 0)
                    return tmp.indexOf(x.id) === -1;
                }).map((x) => {
                    return x.id;
                });
            }
            var sameTypeFiltersPresets = y1.concat(y2).filter((v, i, a) => a.indexOf(v) === i);

            var currentFilterPresets;

            if (!current.IgnorePresets) {
                currentFilterPresets = current.Presets.map((x) => {
                    return x.Id;
                });
            }
            else {
                tmp = current.Presets.map((x) => {
                    return x.Id;
                });
                currentFilterPresets = presetsLookup.filter((x) => {
                    return tmp.indexOf(x.id) === -1;
                }).map((x) => {
                    return x.id;
                });
            }

            intersectedId = sameTypeFiltersPresets.filter(id => -1 !== currentFilterPresets.indexOf(id));

            if (intersectedId.length > 0) {
                var names = presetsLookup.filter(i => -1 !== intersectedId.indexOf(i.id)).map(j => j.text).join(", ");
                if(isTable) {
                    message += (message.length > 0 ? " | " : "") + "Error. Duplicated presets for " + this.lookups[current.TaskType] + ": " + names;
                }
                else {
                    this.notificationService.notifyShow(2, "Error. Duplicated presets for " + this.lookups[current.TaskType] + ": " + names);
                }

                valid = false;
            }
        }

        for(var i=0; i < current.Queues.length; i++) {
            for(var j=0; j < current.Queues.length; j++) {
                if(i != j && current.Queues[i].ID == current.Queues[j].ID) {
                    valid = false;

                    if(isTable) {
                        message += (message.length > 0 ? " | " : "") + "Warning. Duplicated queue IDs for current item";
                    }
                    else {
                        this.notificationService.notifyShow(2, "Warning. Duplicated queue IDs for current item");
                    }
                    break;
                }
            }
            if(!valid)
                break;
        }

        if(isTable && message.length > 0) {
            current.ValidationMessage = message;
        }

        return valid;
    }

    showModal(data: any = null) {
        var isNew = false;
        if(!data) {
            isNew = true;
        }
        this.editModal = this.modalProvider.showByPath(lazyModules.load_master_change_modal, LoadMasterChangeModalComponent, {
            size: 'lg',
            title: isNew ? 'load_master.modal.addtitle' : 'load_master.modal.edittitle',
            position: 'center',
            footerRef: 'modalFooterTemplate',
            usePushState: false
        }, {context: this, data: this.tableData, isNew: isNew, itemData: data, tasksLookup: this.lookups, presetsLookup: this.presetsLookup});

        this.editModal.load().then(() => {
            this.editModal.modalEvents.subscribe((res: any) => {
                if(res && res.name == "ok") {
                    this.getLoadMasterTable(true);
                }
            })
        })

    }

    private firstLoad = true;
    private bindDataToGrid(isReload) {
        console.log("bindDataToGrid");
        let self = this;
        if(!isReload)
        {
            this.loadMasterGrid.provider.setGlobalColumns(this.data.tableColumns);
            this.loadMasterGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.loadMasterGrid.provider.buildPageByData({Data: _.cloneDeep(this.data.tableRows)});

        this.loadMasterGrid.whenGridRendered((e, grid)=>{
            self.loadMasterGrid.provider.autoSizeColumns();
            self.loadMasterGrid.provider.slick.setSortColumns([]);
            self.gridReady = true;
            self.cdr.detectChanges();
            if(this.selectedData != null) {
                self.loadMasterGrid.provider.setSelectedBy(self.selectedData.field, self.selectedData.value, true);
            }
            else {
                self.loadMasterGrid.provider.slick.scrollRowToTop(0);
                self.loadMasterGrid.provider.setSelectedRow();
            }
        });

        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            if(this.firstLoad) {
                this.firstLoad = false;
            }
            else {
                self.toggleOverlay(false);
            }
            self.cdr.detectChanges();
        }, 1);
    }
}










