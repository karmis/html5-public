import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Inject,
    Injector,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
    Type
} from '@angular/core';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from 'app/modules/search/slick-grid/slick-grid.config';
import {SlickGridProvider} from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from 'app/modules/search/slick-grid/services/slick.grid.service';
import {SlickGridComponent} from 'app/modules/search/slick-grid/slick-grid';
import {IMFXModalProvider} from 'app/modules/imfx-modal/proivders/provider';
import {IMFXModalComponent} from 'app/modules/imfx-modal/imfx-modal';
import {DoActionDelegate} from 'app/modules/search/slick-grid/formatters/doaction/doaction.formatter';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {HttpResponse} from "@angular/common/http";
import {ViewsProvider} from "app/modules/search/views/providers/views.provider";
import {lazyModules} from 'app/app.routes';
import {CommonTablesGridChangeModalComponent} from "./modals/edit.modal/common.tables.grid.change.modal.component";

@Component({
    selector: 'common-tables-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridService,
        IMFXModalProvider,
        // {provide: ViewsProvider, useClass: CommonTablesGridViewsProvider},
        // {provide: SlickGridProvider, useClass: CommonTablesSlickGridProvider},
    ]
})

export class CommonTablesGridComponent{
    private tablesGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: '#externalWrapperCommonTables',
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
    private hideInactive = false;
    private selectedData = null;
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject<any>();
    @ViewChild('overlayGroup', {static: true}) private overlayGroup: any;
    @ViewChild('tablesGridWrapper', {static: false}) private tablesGridWrapper: any;
    @ViewChild('tablesGrid', {static: true}) private tablesGrid: SlickGridComponent;
    @ViewChild('datasetFilter', {static: false}) datasetFilter: ElementRef;

    @Input() allowDeleteOnClient: boolean = true; // for change predefined server param
    @Input() timeFormatLocalDatePipe: string = 'HH:mm';
    @Input() dateTimeFullFormatLocalDatePipe: string = 'DD/MM/YYYY HH:mm';
    @Input() firstInit: boolean = false;
    @Input() translateKey: string = 'common_tables_grid';
    @Input() customEditModal: {
        type: Type<any>,
        path: any,
        size?: string,
        // additionalData?; any
    } = null;
    @Output() changeModalOk$: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteItem$: EventEmitter<any> = new EventEmitter<any>();
    @Output() changeItem$: EventEmitter<any> = new EventEmitter<any>();

    private breakRequest$: EventEmitter<any> = new EventEmitter<any>();
    private hasActiveField = false;
    private hasTextOrXML = false;

    // public tableId;
    private emptyColumns = false;

    constructor(private cdr: ChangeDetectorRef,
                private viewsProvider: ViewsProvider,
                private slickGridProvider: SlickGridProvider,
                private modalProvider: IMFXModalProvider,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    // ngOnInit() {
    ngAfterViewInit() {
        const self = this;
        // setTimeout(()=>{
        //     if (self.destroyed$.isStopped) {
        //         return;
        //     }
            this.overlayGroup.show(self.tablesGridWrapper.nativeElement);
            if(this.firstInit) {
                this.bindDataToGrid(false);
            }
        // });
        this.tablesGrid.onGridReady.pipe(
            takeUntil(self.destroyed$)
        ).subscribe(()=>{
            self.tablesGrid.provider.onRowMouseDblClick.pipe(
                takeUntil(self.destroyed$)
            ).subscribe((data)=> {
                //todo ChannelsGridComponent uncom
                //delete data.row.id;
                this.doAction(data);
            });
            self.tablesGrid.provider.onSelectRow.pipe(
                takeUntil(self.destroyed$)
            ).subscribe((data)=> {
                if(data && data.length > 0 && this.gridReady) {
                    const row = self.tablesGrid.provider.getSelectedRow();
                    if(row) {
                        self.selectedData = {
                            field: 'ID',
                            value: row['ID']
                        }
                    }

                }
            });
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.overlayGroup.hide(this.tablesGridWrapper.nativeElement);
        //this.editModal.modalEvents.unsubscribe();
    }

    private bindDataToGrid(isReload) {
        const self = this;
        if(!isReload) {
            this.tablesGrid.provider.setGlobalColumns(this.data.tableColumns);
            this.tablesGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }
        this.tablesGrid.provider.buildPageByData({Data: this.data.tableRows});

        this.tablesGrid.whenGridRendered((e, grid)=>{
            self.tablesGrid.provider.autoSizeColumns();
            self.tablesGrid.provider.slick.setSortColumns([]);
            self.gridReady = true;
            self.cdr.detectChanges();
            if(this.selectedData != null) {
                self.tablesGrid.provider.setSelectedBy(self.selectedData.field, self.selectedData.value, true);
            } else {
                self.tablesGrid.provider.slick.scrollRowToTop(0);
                self.tablesGrid.provider.setSelectedRow();
            }
        });

        setTimeout(()=>{
            if (self.destroyed$.isStopped) {
                return;
            }
            //todo ChannelsGridComponent, ChannelsGroupsGridComponent uncom
            self.tablesGrid.provider.autoSizeColumns();
            self.overlayGroup.hide(this.tablesGridWrapper.nativeElement);
            self.cdr.detectChanges();
            if(isReload) {
                self.cdr.detectChanges()
                self.updateDataset($(this.datasetFilter.nativeElement).val().trim(), 100);
            }
        }, 1);
    }

    public getTableAsync(obs: Observable<HttpResponse<any>>, isReload: boolean = false) {
        this.gridReady = false;
        this.emptyColumns = false;
        if(!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.overlayGroup.show(this.tablesGridWrapper.nativeElement);
        const self = this;
        this.tablesGrid.provider.dataView.beginUpdate();
        this.tablesGrid.provider.dataView.setFilter(this.filterByValue);
        this.tablesGrid.provider.dataView.setFilterArgs({
            filter: '',
            hasActiveField: this.hasActiveField,
            hideInactive: this.hideInactive,
            Lookups: []
        });
        // this.tableId = tableId;
        self.data.tableColumns = [];
        obs.pipe(
            takeUntil(self.breakRequest$),
            takeUntil(self.destroyed$)
        ).subscribe((res: any) => {
            if(res && res.View && res.View.Columns && res.View.Columns.length > 0) {
                let disabledFieldMask = null;
                for (let c = 0; c < res.View.Columns.length; c++) {
                    const col = res.View.Columns[c];
                    if(col.Rules && col.Rules.length > 0) {
                        for (let i = 0; i < col.Rules.length; i++) {
                            const regExp = /\(([^)]+)\)/;
                            const matches = regExp.exec(col.Rules[i]);
                            if(matches && matches.length > 0) {
                                col[col.Rules[i].split('(')[0]] = matches[1].split(',');
                            }
                            else {
                                col[col.Rules[i]] = true;
                            }

                            if(col.Rules[i] === 'SystemRow') {
                                disabledFieldMask = col.Field;
                                //Disable system readonly mode for all fields except SystemValue field
                                //res.View.disabledFieldMask = col.Field;
                            }
                        }
                    }
                }

                //for split properties which united via comma
                for (var field in res.Lookups) {
                    if (res.Lookups.hasOwnProperty(field)) {
                        if (field.indexOf(',') > -1) {
                            var fields = field.split(',');
                            for (var i = 0; i < fields.length; i++) {
                                res.Lookups[fields[i]] = res.Lookups[field];
                            }
                            delete res.Lookups[field];
                        } else {
                            res.Lookups[field] = res.Lookups[field];
                        }
                    }
                }

                //for deny deleteFormatter on client
                res.AllowDelete = self.allowDeleteOnClient;

                self.tableData = res;
                self.hasActiveField = res.View.Columns.filter(x => x.Field == 'ACTIVE').length > 0;
                self.hasTextOrXML = res.View.Columns.filter(x => x.DataType == 'TextBoxMultiline' || x.DataType == 'XmlEditor').length > 0;
                self.processStandardConfigTables(res, self, isReload, disabledFieldMask);
                self.cdr.detectChanges();
            } else {
                this.overlayGroup.hide(this.tablesGridWrapper.nativeElement);
                this.emptyColumns = true;
                this.cdr.detectChanges();
            }
        });
    }

    processStandardConfigTables(res, self, isReload, disabledFieldMask) {
        console.log('processStandardConfigTables');
        if(!isReload) {
            self.data.tableColumns = self.viewsProvider.getCustomColumns(self.slickGridProvider, res, disabledFieldMask);
        }

        self.data.tableRows = res.Data;
        self.bindDataToGrid(isReload);
    }

    doAction(data) {
        this.showModal(data);
    }

    updateDataset(filter, timeout = 500) {
        clearTimeout(this.inputTimeout);
        if(timeout === 0)
            this.overlayGroup.show(this.tablesGridWrapper.nativeElement);
        this.inputTimeout = setTimeout(() => {
            setTimeout(()=>{
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.tablesGrid.provider.slick.scrollRowToTop(-100);
            });

            if(timeout !== 0)
                this.overlayGroup.show(this.tablesGridWrapper.nativeElement);
            filter = filter.trim();
            this.tablesGrid.provider.dataView.beginUpdate();
            this.tablesGrid.provider.dataView.setFilter(this.filterByValue);
            this.tablesGrid.provider.dataView.setFilterArgs({
                filter: filter,
                hasActiveField: this.hasActiveField,
                hideInactive: this.hideInactive,
                Lookups: this.tableData.Lookups
            });
            this.tablesGrid.provider.dataView.endUpdate();
            const renderedRange = this.tablesGrid.provider.slick.getRenderedRange();

            this.tablesGrid.provider.dataView.setRefreshHints({
                ignoreDiffsBefore: renderedRange.top,
                ignoreDiffsAfter: renderedRange.bottom + 1,
                isFilterNarrowing: true,
                isFilterExpanding: true,
            });
            this.tablesGrid.provider.dataView.refresh();
            this.tablesGrid.provider.slick.invalidateAllRows();
            this.tablesGrid.provider.slick.render();
            this.overlayGroup.hide(this.tablesGridWrapper.nativeElement);
            // if(filter.length == 0) {
            //     if(this.hasActiveField && this.hideInactive) {
            //         this.data.tableRows = this.tableData.Data.filter(x => {
            //             return x['ACTIVE'];
            //         });
            //     }
            //     else {
            //         this.data.tableRows = this.tableData.Data;
            //     }
            // }
            // else {
            //     this.data.tableRows = this.filterByValue(this.tableData.Data, filter);
            // }

            //this.refresh();
        }, timeout);
    }

    clearDatasetFilter() {
        $(this.datasetFilter.nativeElement).val('');
        this.updateDataset('', 0);
    }

    toggleInactive() {
        this.hideInactive = !this.hideInactive;
        this.updateDataset($(this.datasetFilter.nativeElement).val(), 0);
    }

    filterByValue(o, filterArgs) {
        //todo ChannelsGridComponent uncom
        // if(filterArgs.hasActiveField && filterArgs.hideInactive && !o['ACTIVE']) {
        if(filterArgs.hasActiveField && filterArgs.hideInactive && (o['ACTIVE'] === false || o['ACTIVE'] === 0 || o['ACTIVE'] === '0')) {
            return false;
        }
        const result = Object.keys(o).some(k => {
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
                const arr = filterArgs.Lookups[k].filter(z => {
                    return z.ID == o[k];
                })
                if(!arr[0]) {
                    return false;
                }
                return arr[0].Name.toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            }
            else if(o.hasOwnProperty(k)) {
                return o[k].toString().toLowerCase().includes(filterArgs.filter.toLowerCase());
            }
            else {
                return false;
            }
        });
        return result;
    }

    showModal(data: any = null) {
        const path = this.customEditModal && this.customEditModal.path || lazyModules.settings_common_tables_grid_change_modal;
        const modalType = this.customEditModal && this.customEditModal.type || CommonTablesGridChangeModalComponent;
        const size: any = (this.customEditModal && this.customEditModal.size)
            ? this.customEditModal.size
            : this.hasTextOrXML
                ? 'lg'
                : 'md';
        // const additionalData = this.customEditModal && this.customEditModal.additionalData || {}

        let isNew = false;
        if(!data) {
            isNew = true;
        }
        this.editModal = this.modalProvider.showByPath(
            path,
            modalType,
            {
                size,
                title: this.translateKey +  (isNew ? '.modal.addtitle' : '.modal.edittitle'),
                position: 'center',
                footerRef: 'modalFooterTemplate',
                usePushState: false
            }, {
                context: this,
                data: this.tableData,
                isNew: isNew,
                itemData: data,
                lookups: Object.assign({}, this.tableData.Lookups),
                translateKey: this.translateKey
            }); //...additionalData
        this.editModal.load().then((cr: ComponentRef<any>) => {
            this.editModal.modalEvents.subscribe((res: any) => {
                if(res && res.name === 'ok') {
                    // this.getConfigTable(this.tableId, true);
                    // this.changeModalOk$.emit();
                }
                if(res && res.name === 'saveData') {
                    this.changeItem$.emit(res.$event);
                }

            });
        });
    }

    breakRequest() {
        this.breakRequest$.emit();
    }

    deleteItem(itemToDelete, observer) {
        this.deleteItem$.emit({itemToDelete, observer});
    }

    // doSelect(tableId) {
    //     this.breakRequest$.emit(tableId);
    //     this.getConfigTable(tableId);
    // }


}










