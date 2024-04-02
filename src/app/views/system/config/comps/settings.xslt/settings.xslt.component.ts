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
import {SettingsXSLTSlickGridProvider} from "./providers/slick.grid.provider";
import {SettingsXSLTViewsProvider} from "./providers/views.provider";
import {TranslateService} from "@ngx-translate/core";
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../../../../modules/search/slick-grid/services/slick.grid.service";
import {ViewsProvider} from "../../../../../modules/search/views/providers/views.provider";
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";
import {
    DoActionDelegate,
    DoActionFormatter
} from "../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter";
import {
    SlickGridConfig, SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../../../modules/search/slick-grid/slick-grid.config";
import {SlickGridComponent} from "../../../../../modules/search/slick-grid/slick-grid";
import {IMFXModalComponent} from "../../../../../modules/imfx-modal/imfx-modal";
import {XMLService} from "../../../../../services/xml/xml.service";
import {EditXsltModalComponent} from "./modals/edit-modal.modal/edit";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {lazyModules} from "../../../../../app.routes";
import {CheckBoxFormatter} from "../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter";
import {LookupFormatter} from "../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter";
import {LookupService} from "../../../../../services/lookup/lookup.service";

@Component({
    selector: 'system-config-xslt',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridProvider,
        SlickGridService,
        XMLService,
        ViewsProvider,
        SettingsXSLTViewsProvider,
        IMFXModalProvider,
        {provide: ViewsProvider, useClass: SettingsXSLTViewsProvider},
        {provide: SlickGridProvider, useClass: SettingsXSLTSlickGridProvider}
    ]
})

export class SettingsXSLTComponent implements OnInit, DoActionDelegate {

    private xsltGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#externalWrapperXsltTables",
                selectFirstRow: false,
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });


    private data: any = {};
    private editModal: IMFXModalComponent;
    private tableData;
    private inputTimeout;
    private selectedData = null;
    private gridReady = false;
    private schemasLookup = [];
    private destroyed$: Subject<any> = new Subject();
    @ViewChild('overlayGroup', {static: true}) private overlayGroup: any;
    @ViewChild('xsltGridWrapper', {static: true}) private xsltGridWrapper: any;
    @ViewChild('xsltGrid', {static: false}) private xsltGrid: SlickGridComponent;
    @ViewChild('datasetFilter', {static: false}) datasetFilter: ElementRef;

    constructor(private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private modalProvider: IMFXModalProvider,
                private xmlService: XMLService,
                protected lookupService: LookupService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    ngOnInit() {
        this.toggleOverlay(true);
    }

    ngAfterViewInit() {
        let self = this;
        this.lookupService.getLookups("LookupXmlSchemas").subscribe((lookup) => {
            this.schemasLookup = lookup.map((x) => {
                return {id: x["ID"], text: x["Name"]};
            });
            this.bindDataToGrid(false);
            this.getXsltTable(false);
            this.xsltGrid.onGridReady
                .pipe(takeUntil(this.destroyed$))
                .subscribe(()=>{
                    self.xsltGrid.provider.onRowMouseDblClick.subscribe((data)=> {
                        delete data.row.id;
                        self.doAction({
                            data: data.row
                        });
                    });
                    self.xsltGrid.provider.onSelectRow.subscribe((data)=> {
                        if(data && data.length > 0 && this.gridReady) {
                            let row = self.xsltGrid.provider.getSelectedRow();
                            if(row) {
                                self.selectedData = {
                                    field: "ID",
                                    value: row["ID"]
                                }
                            }

                        }
                    });
                });
        });
    }

    public getXsltTable(isReload: boolean = false) {
        console.log("getXsltTable");
        this.gridReady = false;
        if(!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.toggleOverlay(true);
        let self = this;
        this.xsltGrid.provider.dataView.beginUpdate();
        this.xsltGrid.provider.dataView.setFilter(this.filterByValue);
        this.xsltGrid.provider.dataView.setFilterArgs({
            filter: $(this.datasetFilter.nativeElement).val().trim()
        });
        self.data.tableColumns = [];
        this.xmlService.getSettingsXslts()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
            if(res) {
                self.tableData = res;
                self.processTable(res, self, isReload);
                self.cdr.detectChanges();
            }
        });
    }

    toggleOverlay(show) {
        if(show)
            this.overlayGroup.show(this.xsltGridWrapper.nativeElement);
        else
            this.overlayGroup.hide(this.xsltGridWrapper.nativeElement);
    }

    processTable(res, self, isReload) {
        console.log("processTable");
        if (!isReload) {
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
                id: 0,
                name: self.translate.instant("system-config.xslt.fields.id"),
                field: 'ID',
                width: 80,
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });

            self.data.tableColumns.unshift({
                id: 1,
                name: self.translate.instant("system-config.xslt.fields.name"),
                field: 'NAME',
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });

            self.data.tableColumns.unshift({
                id: 2,
                name: self.translate.instant("system-config.xslt.fields.descr"),
                field: 'DESCRIPTION',
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 3,
                name: self.translate.instant("system-config.xslt.fields.naming_format"),
                field: 'FILE_NAMING',
                resizable: true,
                sortable: true,
                headerCssClass: "disable-reorder",
                multiColumnSort: false,
            });
            self.data.tableColumns.unshift({
                id: 4,
                name: self.translate.instant("system-config.xslt.fields.schema"),
                field: 'SCHEMA_ID',
                resizable: true,
                sortable: true,
                formatter: LookupFormatter,
                multiColumnSort: false,
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector,
                    lookupMap: this.convertToMap(this.schemasLookup, "id")
                }
            });
            self.data.tableColumns.unshift({
                id: 5,
                name: self.translate.instant("system-config.xslt.fields.exports"),
                field: 'SAVE_EXPORTS_IN_DB',
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
        }

        self.data.tableRows = res;
        self.bindDataToGrid(isReload);
    }

    convertToMap(lookupData, field) {
        var result = {};
        for(var i =0; i < lookupData.length; i++)
        {
            result[lookupData[i][field]] = lookupData[i].text;
        }
        return result;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.toggleOverlay(false);
        clearTimeout(this.inputTimeout);
        // this.xsltGrid.onGridReady.unsubscribe();
        this.xsltGrid.provider.onRowMouseDblClick.unsubscribe();
        this.xsltGrid.provider.onSelectRow.unsubscribe();
    }

    doAction(data) {
        this.showModal(data);
    }

    updateDataset(filter, timeout = 500) {
        clearTimeout(this.inputTimeout);
        if(timeout == 0)
            this.toggleOverlay(true);
        this.inputTimeout = setTimeout(() => {
            this.xsltGrid.provider.slick.scrollRowToTop(0);
            if(timeout != 0)
                this.toggleOverlay(true);
            filter = filter.trim();
            this.xsltGrid.provider.dataView.beginUpdate();
            this.xsltGrid.provider.dataView.setFilter(this.filterByValue);
            this.xsltGrid.provider.dataView.setFilterArgs({
                filter: filter
            });
            this.xsltGrid.provider.dataView.endUpdate();
            var renderedRange = this.xsltGrid.provider.slick.getRenderedRange();
            this.xsltGrid.provider.dataView.setRefreshHints({
                ignoreDiffsBefore: renderedRange.top,
                ignoreDiffsAfter: renderedRange.bottom + 1,
                isFilterNarrowing: true,
                isFilterExpanding: true,
            });
            this.xsltGrid.provider.dataView.refresh();
            this.xsltGrid.provider.slick.invalidateAllRows();
            this.xsltGrid.provider.slick.render();
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
            if(o.hasOwnProperty(k)) {
                return o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            }
            else {
                return false;
            }
        });
        return result;
    }

    showModal(data: any = null) {
        var isNew = false;
        if(!data) {
            isNew = true;
        }
        this.editModal = this.modalProvider.showByPath(lazyModules.edit_xslt_modal, EditXsltModalComponent, {
            size: 'lg',
            title: isNew ? 'system-config.xslt.modal.addtitle' : 'system-config.xslt.modal.edittitle',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, data: this.tableData, isNew: isNew, itemData: data, schemasLookup: this.schemasLookup});
        this.editModal.load().then(() => {
            this.editModal.modalEvents.subscribe((res: any) => {
                if(res && res.name == "ok") {
                    this.getXsltTable(true);
                }
            })
        });
    }

    private firstLoad = true;
    private bindDataToGrid(isReload) {
        console.log("bindDataToGrid");
        let self = this;
        if(!isReload)
        {
            this.xsltGrid.provider.setGlobalColumns(this.data.tableColumns);
            this.xsltGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.xsltGrid.provider.buildPageByData({Data: this.data.tableRows});

        this.xsltGrid.whenGridRendered((e, grid)=>{
            self.xsltGrid.provider.autoSizeColumns();
            self.xsltGrid.provider.slick.setSortColumns([]);
            self.gridReady = true;
            self.cdr.detectChanges();
            if(this.selectedData != null) {
                self.xsltGrid.provider.setSelectedBy(self.selectedData.field, self.selectedData.value, true);
            }
            else {
                self.xsltGrid.provider.slick.scrollRowToTop(0);
                self.xsltGrid.provider.setSelectedRow();
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
