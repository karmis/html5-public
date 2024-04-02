import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Inject,
    Injector,
    Input,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SlickGridProvider} from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from 'app/modules/search/slick-grid/services/slick.grid.service';
import {ViewsProvider} from 'app/modules/search/views/providers/views.provider';
import {IMFXModalProvider} from 'app/modules/imfx-modal/proivders/provider';
import {ProductionConfigTabViewsProvider} from './providers/views.provider';
import {ProductionConfigTabSlickGridProvider} from './providers/slick.grid.provider';
import {DoActionFormatter} from 'app/modules/search/slick-grid/formatters/doaction/doaction.formatter';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from 'app/modules/search/slick-grid/slick-grid.config';
import {IMFXModalComponent} from 'app/modules/imfx-modal/imfx-modal';
import {Subject} from 'rxjs';
import {SlickGridComponent} from 'app/modules/search/slick-grid/slick-grid';
import {takeUntil} from 'rxjs/operators';
import {DeleteFormatter} from 'app/modules/search/slick-grid/formatters/delete/delete.formatter';
import {CheckBoxFormatter} from 'app/modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
import {LookupFormatter} from 'app/modules/search/slick-grid/formatters/lookup/lookup.formatter';
import {lazyModules} from 'app/app.routes';
import {
    ProductionConfigTabGridEditModalComponent
} from "./components/edit.modal/production.config.tab.grid.edit.modal.component";

@Component({
    selector: 'production-config-edit-modal-tab-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridService,
        {provide: ViewsProvider, useClass: ProductionConfigTabViewsProvider},
        {provide: SlickGridProvider, useClass: ProductionConfigTabSlickGridProvider},
    ]
})

export class ProductionConfigTabGridComponent {

    private gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                selectFirstRow: false,
                clientSorting: true,
                bottomPanel: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                rowHeight: 40,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    @Input('field') field: string = null;

    private rows: any[] = []; //change via setRows

    @Input('itemArrayData') itemArrayData = null; //for enable detectChanges
    @Input('itemData') set setData(itemData) {
        if(this.field) {
            this.setRows(itemData[this.field]);
        }
    };

    protected columns: any[] = [];
    @Input('columnsDict') set setColumn(columnsDict) {
        if(this.field) {
            this.columns = columnsDict[this.field];
        }
    };

    @Input('lookups') lookups: any = null;
    @Input('readOnly') readOnly = false;
    @Output('updateGridRows') updateGridRows: EventEmitter<any> = new EventEmitter<any>();
    @Output('isDataValid') isDataValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    // private onSelect$: EventEmitter<any> = new EventEmitter<any>();
    private data: {
        tableRows?: any[],
        tableColumns?: any[]
    } = {};
    private editModal: IMFXModalComponent;
    // private hideInactive = false;
    // private hasActiveField = false;
    private hasTextOrXML = false;
    private selectedData = null;
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject<any>();
    @ViewChild('prodConfigTabGrid', {static: true}) private prodConfigTabGrid: SlickGridComponent;

    constructor(private cdr: ChangeDetectorRef,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                @Inject(IMFXModalProvider) public modalProvider: IMFXModalProvider
    ) {
        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    ngOnInit() {
        let self = this;

        this.prodConfigTabGrid.onGridReady.pipe(
            takeUntil(self.destroyed$)
        ).subscribe(()=>{

            self.prodConfigTabGrid.provider.onRowMouseDblClick.pipe(
                takeUntil(self.destroyed$)
            ).subscribe((data)=> {
                //delete data.row.id;
                this.doAction({
                    data: data.row,
                    rowNumber: data.row.id
                });
            });

            self.prodConfigTabGrid.provider.onSelectRow.pipe(
                takeUntil(self.destroyed$)
            ).subscribe((data)=> {
                if(data && data.length > 0 && this.gridReady) {
                    //let row = this.configTablesGrid.provider.slick.getRowById(data[0]);
                    let row = self.prodConfigTabGrid.provider.getSelectedRow();
                    if(row) {
                        self.selectedData = {
                            field: "ID",
                            value: row["ID"]
                        }
                    }

                }
            });

            self.prodConfigTabGrid.provider.onRowDelete.pipe(
                takeUntil(self.destroyed$)
            ).subscribe((data)=> {
                // @ts-ignore
                this.data.tableRows.splice(data.id, 1);


                let anyChangeFlag = false;
                //apply rules
                for (let item of this.columns) {
                    if (item.Rules && item.Rules.length) {
                        let rule;
                        //AutoInc
                        rule = item.Rules.find(el => el.includes('AutoInc'));
                        if (rule) {
                            this.applySorting(this.data.tableRows);
                            let orderNum = rule.substr(rule.indexOf('_') - 0 + 1) - 0;
                            this.data.tableRows.forEach(el => {el[item.Field] = orderNum; orderNum++;});
                            anyChangeFlag = true;
                        }
                    }
                }

                //apply fnEndEdit
                if (this.applyMapFnEndEdit()) {
                    anyChangeFlag = true;
                }

                if (anyChangeFlag) {
                    this.bindDataToGrid(true);
                    this.validate();
                }

            });
        });
    }

    ngAfterViewInit() {
        this.hasTextOrXML = this.columns.filter(x => x.DataType == "TextBoxMultiline" || x.DataType == "XmlEditor").length > 0;
        this.processStandardGrid(false);
        this.bindDataToGrid(false);
        this.validate();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.itemArrayData && changes.itemArrayData.firstChange == false) {
            this.setRows(changes.itemArrayData.currentValue);
            this.applySorting();
            this.data.tableRows = this.rows;
            this.bindDataToGrid(false);
            this.validate();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    setRows(value: any[]) {
        this.rows = (value && Array.isArray(value))
            ? $.extend(true, [], value)
            : [];
    }

    validate() {
        let isValid = true;

        for (let rowItem of this.rows) {
            for (let colItem of this.columns) {
                isValid = isValid && this.validateCol(colItem, rowItem);
            }
        }

        this.isDataValid.emit(isValid);
    }

    validateCol(column, item): boolean {
        const r = column.Rules;
        const f = column.Field;


        //check by rules
        if(r && r.length) {
            if (r.includes('Required')) {
                if(item[f] === null || item[f] === undefined || item[f] === '' || (Array.isArray(item[f]) && item[f].length)) {
                    return false;
                }
            }
            // if (r.includes('Unique')) {
            //
            // }

        }


        //check by checkFnEndEdit
        if(column.checkFnEndEdit
            && (typeof column.checkFnEndEdit == 'function')
            && !column.checkFnEndEdit.call(this, item, this.rows)) {
            return false;
        }

        return true;
    }

    applySorting(rows?) {
        const cols = this.columns;
        rows = (rows) ? rows : this.rows;

        const col = cols.find(el => {
            return el.Sortable && (el.Sortable == 'Decr' || el.Sortable == 'Inc');
        });

        if (col) {
            let x = 0;
            if (col.Sortable == 'Inc') {
                x = 1;
            } else if (col.Sortable == 'Decr') {
                x = -1;
            }
            rows.sort((el1, el2) => {
                return ((el1[col.Field] - 0) - (el2[col.Field] - 0)) * x;
            });
        }
    }

    //return true if at least 1 rule will be applied
    applyMapFnEndEdit():boolean {
        let arrFnCols = this.columns.filter(el => el.mapFnEndEdit && (typeof el.mapFnEndEdit == 'function'));

        let anyChangeFlag = false;
        for (let item of arrFnCols) {
            item.mapFnEndEdit.call(this, null, false, this.data.tableRows); // not immutable
            anyChangeFlag = true;
        }
         return anyChangeFlag;
    }

    doAction(data) {
        this.showModal(data);
    }

    showModal(data: any = null) {
        let isNew = false;
        if(!data) {
            isNew = true;
        }
        this.editModal = this.modalProvider.showByPath(lazyModules.production_config_tabs_change_modal, ProductionConfigTabGridEditModalComponent, {
            size: this.hasTextOrXML ? 'lg' : 'md',
            title: isNew ? 'common.add' : 'common.edit',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            context: this,
            data: { //todo new format input data
                Data: this.data.tableRows,
                EditOnly: !this.readOnly,
                Lookups: this.lookups,
                ValidationRules: null,
                View: {
                    Columns: this.columns
                }
            },
            isNew: isNew,
            itemData: data
        });
        this.editModal.load().then((cr: ComponentRef<ProductionConfigTabGridEditModalComponent>) => {
            this.editModal.modalEvents.subscribe((res: any) => {
                if(res && res.name == "ok") {
                    // const changedItem = cr.instance.getItemToSave();
                    const updatedData = cr.instance.getTableItemsToSave();
                    this.data.tableRows = updatedData;
                    this.bindDataToGrid(true);
                    (this.prodConfigTabGrid.provider as ProductionConfigTabSlickGridProvider).updateGridRows();
                    this.validate();
                }
            });
        });
    }

    private bindDataToGrid(isReload) {
        if(!isReload)
        {
            this.prodConfigTabGrid.provider.setGlobalColumns(this.data.tableColumns);
            this.prodConfigTabGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        }

        this.prodConfigTabGrid.provider.buildPageByData({Data: this.data.tableRows});
    }

    private processStandardGrid(isReload) {
        const readOnly = this.readOnly;
        const cols = this.columns;
        const lookups = this.lookups;
        const rows = this.rows;

        const convertToMap = (lookupData, field) => {
            let result = {};
            for(let i =0; i < lookupData.length; i++)
            {
                result[lookupData[i][field]] = lookupData[i].Name;
            }
            return result;
        }

        if (!readOnly && !isReload) {
            this.data.tableColumns.unshift({
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
                            text: 'production.modal_remove_conformation',
                            textParams: {groupName: 'Name'},
                            message: 'common.removed_successfully'
                        },
                        rows: rows,
                        component: this,
                        // disabledFieldMask: {
                        //     ColumnName: disabledFieldMask
                        // }
                    }
                }
            });
        }

        if(!readOnly && !isReload) {
            this.data.tableColumns.unshift({
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

            let id = 1;
            for (let i = 0; i < cols.length; i++) {
                let col = cols[i];
                let colDef;
                if ((<any>col).HideInTable) {
                    continue;
                }
                if ((<any>col).DataType == "CheckBox") {
                    colDef = {
                        id: id,
                        // width: 60,
                        name: (<any>col).Label,
                        field: (<any>col).Field,
                        resizable: true,
                        sortable: false,
                        formatter: CheckBoxFormatter,
                        multiColumnSort: false,
                        isCustom: true,
                        __deps: {
                            injector: this.injector
                        }
                    };

                    // if (!readOnly) {
                    //     colDef.__deps.data = {
                    //         enabled: true,
                    //         enabledList: []
                    //     };
                    // }
                }
                else if ((<any>col).DataType == "ComboSingle") {
                    colDef = {
                        id: id,
                        // width: 60,
                        name: (<any>col).Label,
                        field: (<any>col).Field,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false
                    };
                    // if (readOnly) {
                        $.extend(true, colDef, {
                            formatter: LookupFormatter,
                            __deps: {
                                injector: this.injector,
                                lookupMap: lookups[(<any>col).Field]
                                    ? convertToMap(lookups[(<any>col).Field], "ID")
                                    : {}
                            }
                        });
                        if((<any>col).ItemsSource) {
                            colDef.__deps["relativeLookup"] = {
                                Data: lookups[(<any>col).ItemsSource.split(".")[0]],
                                ItemsSource: (<any>col).ItemsSource
                            };
                        }
                    // } else {
                    //     $.extend(true, colDef, {
                    //         minWidth: 150,
                    //         formatter: Select2Formatter,
                    //         __deps: {
                    //             injector: this.injector,
                    //             data: {
                    //                 values: lookups[(<any>col).Field],
                    //                 rule: {key: "ID", text: "Name"}
                    //             }
                    //         }
                    //     });
                    // }
                }
                // else if ((<any>col).DataType == "ColorSelector") {
                //     colDef = {
                //         id: id,
                //         name: (<any>col).Label,
                //         field: (<any>col).Field,
                //         resizable: true,
                //         sortable: true,
                //         formatter: ColorFormatter,
                //         multiColumnSort: false,
                //         isCustom: true,
                //         width: 60,
                //         __deps: {
                //             injector: this.injector
                //         }
                //     };
                // }
                else if ((<any>col).DataType == "TimeInput") {
                    colDef = {
                        id: id,
                        name: (<any>col).Label,
                        field: (<any>col).Field,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false,
                    };
                    // if (!readOnly) {
                    //     $.extend(true, colDef, {
                    //         minWidth: 190,
                    //         isCustom: true,
                    //         formatter: TimecodeInputFormatter,
                    //         __deps: {
                    //             injector: this.injector,
                    //             data: []
                    //         }
                    //     });
                    // }
                }
                else {
                    colDef = {
                        id: id,
                        name: (<any>col).Label,
                        field: (<any>col).Field,
                        resizable: true,
                        sortable: false,
                        multiColumnSort: false
                    };

                    // if (!readOnly) {
                    //     $.extend(true, colDef, {
                    //         minWidth: 70,
                    //         formatter: TextFormatter,
                    //         __deps: {
                    //             injector: this.injector,
                    //             data: {
                    //                 validationEnabled: false
                    //             }
                    //         }
                    //     });
                    // }
                }

                // processing the rules
                // if(col.Rules && col.Rules.length > 0) {
                //     for (let i = 0; i < col.Rules.length; i++) {
                //         let regExp = /\(([^)]+)\)/;
                //         let matches = regExp.exec(col.Rules[i]);
                //         if(matches && matches.length > 0) {
                //             col[col.Rules[i].split("(")[0]] = matches[1].split(",");
                //         }
                //         else {
                //             col[col.Rules[i]] = true;
                //         }
                //     }
                // }

                this.data.tableColumns.unshift(colDef);
                id++;
            }
        }

        //apply sorting
        this.applySorting(rows);
        this.data.tableRows = rows;
    }
}










