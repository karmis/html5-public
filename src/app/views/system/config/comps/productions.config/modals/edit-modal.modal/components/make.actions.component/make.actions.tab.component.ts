import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injectable,
    Injector,
    Input,
    Output, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Subject} from 'rxjs';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "app/modules/search/slick-grid/slick-grid.config";
import {SlickGridProvider} from "app/modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "app/modules/search/slick-grid/services/slick.grid.service";
import {ViewsProvider} from "app/modules/search/views/providers/views.provider";
import {ProductionMakeActionsTabViewsProvider} from './providers/views.provider';
import {takeUntil} from "rxjs/operators";
import {SlickGridComponent} from "../../../../../../../../../modules/search/slick-grid/slick-grid";
import {DeleteFormatter} from "../../../../../../../../../modules/search/slick-grid/formatters/delete/delete.formatter";
import {CheckBoxFormatter} from "../../../../../../../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter";
import {LookupFormatter} from "../../../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter";
import {lazyModules} from "../../../../../../../../../app.routes";
import {ProductionConfigTabGridEditModalComponent} from "../tab.grid/components/edit.modal/production.config.tab.grid.edit.modal.component";
import {ProductionConfigTabSlickGridProvider} from "../tab.grid/providers/slick.grid.provider";
import {ArrayFormatter} from "../../../../../../../../../modules/search/slick-grid/formatters/array/array.formatter";
import {SlickGridRowData} from "../../../../../../../../../modules/search/slick-grid/types";
import {IMFXModalComponent} from "../../../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalProvider} from "../../../../../../../../../modules/imfx-modal/proivders/provider";
import {ProductionConfigMakeActionsEditModalComponent} from './components/edit.modal/production.config.make.actions.edit.modal.component';
import {ProductionMakeActionsTabSlickGridProvider} from './components/edit.modal/providers/slick.grid.provider';
import {PresetGroupType} from "../../../../../../../../../modules/order-presets-grouped/types";
import {BasketService} from "../../../../../../../../../services/basket/basket.service";

@Component({
    selector: 'production-make-actions',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: ViewsProvider, useClass: ProductionMakeActionsTabViewsProvider},
        {provide: SlickGridProvider, useClass: ProductionMakeActionsTabSlickGridProvider},
    ],
    entryComponents: []
})
@Injectable()
export class ProductionMakeActionsTabComponent {
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
                },
                reorderRows: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                // rowHeight: 40,
                multiAutoHeight: true,
                fullWidthRows: true,
                // forceFitColumns: false
            }
        })
    });

    protected rows: any[] = [];
    protected data: any = null;
    @Input('data') set setData(data) {
        if (!data['MadeWorkflowTiers']) {
            data['MadeWorkflowTiers'] = {0:[], 1:[]};
        } else if (!data['MadeWorkflowTiers'][this.activeGridType]) {
            data['MadeWorkflowTiers'][this.activeGridType] = [];
        }

        this.data = data;
        this.rows = $.extend(true, [], data['MadeWorkflowTiers'][this.activeGridType]);
    }

    protected _lookups = [];
    private lookups: any = null;
    @Input('lookups') set setLookups(lookups) {
        this.lookups = lookups;
        this.prepareLookups();
    }
    @Input('readOnly') readOnly = false;

    @Output('updateData') updateData: EventEmitter<any> = new EventEmitter<any>();
    @Output('isDataValid') isDataValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('slickGrid', {static: true}) private slickGridComp: SlickGridComponent;

    presetGroups: Array<PresetGroupType> = null;
    @Input('presetGroups') set setPresetGroups(presetGroups) {
        this.presetGroups = presetGroups;
    }

    activeGridType: 0 | 1 = 0;
    private editModal: IMFXModalComponent;
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected modalProvider: IMFXModalProvider,
        protected injector: Injector
    ) {
    }

    ngOnInit() {

        this.slickGridComp.onGridReady.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(()=>{

            this.slickGridComp.provider.onRowMouseDblClick.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((data)=> {
                //delete data.row.id;
                this.showModal(data);
            });

            this.slickGridComp.provider.onSelectRow.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((data)=> {
                if(data && data.length > 0 && this.gridReady) {
                    //let row = this.configTablesGrid.provider.slick.getRowById(data[0]);
                    let row = this.slickGridComp.provider.getSelectedRow();
                    // if(row) {
                    //     self.selectedData = {
                    //         field: "ID",
                    //         value: row["ID"]
                    //     }
                    // }

                }
            });

            this.slickGridComp.provider.onRowDelete.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((data)=> {
                // @ts-ignore
                this.rows.splice(data.id, 1);


                // //apply rules
                // for (let item of this.columns) {
                //     if (item.Rules && item.Rules.length) {
                //         let rule;
                //         //AutoInc
                //         rule = item.Rules.find(el => el.includes('AutoInc'));
                //         if (rule) {
                //             this.applySorting(this.data.tableRows);
                //             let orderNum = rule.substr(rule.indexOf('_') - 0 + 1) - 0;
                //
                //             this.data.tableRows.forEach(el => {el[item.Field] = orderNum; orderNum++;});
                //             this.bindDataToGrid(true);
                //             this.validate();
                //         }
                //     }
                // }

            });
        });
    }

    ngAfterViewInit() {
        this.bindDataToGrid();
        this.validate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data && changes.data.firstChange == false) {
            // console.log('ngOnChanges MakeWorkflowsTabComponent', changes);
            this.validate();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    private bindDataToGrid(reload = false) {
        if (!reload) {
            const cols = this.getGridCols();
            this.slickGridComp.provider.setGlobalColumns(cols);
            this.slickGridComp.provider.setDefaultColumns(cols, [], true);
        }
        this.slickGridComp.provider.buildPageByData({Data: this.rows});
        this.slickGridComp.provider.resize();
    }

    onSelectWorkflow(value, field) {
        let _value = value.params.data[0] && value.params.data[0].id || null;
        this.updateData.emit({
            value: _value,
            field: field
        });
    }

    prepareLookups() {
        this._lookups = [];

        if (!this.lookups) {
            return;
        }

        for (const key in this.lookups) {
            const lookupItem = this.lookups[key];
            if (lookupItem) {
                this._lookups[key] = lookupItem.map(el => ({id: el.ID, text: el.Name}));
            }
        }
        // for (const item of this.lookups) {
        //     const lookupItem = this.lookups[item.field];
        //     if (lookupItem) {
        //         this._lookups[item.field] = lookupItem.map(el => ({id: el.ID, text: el.Name}));
        //     }
        // }
    }

    switchActiveGrid(type) {
        this.activeGridType = type;
        this.rows = $.extend(true, [], this.data['MadeWorkflowTiers'][this.activeGridType]);
        this.bindDataToGrid(true);
    }

    validate() {
        let isValid = true;
        this.isDataValid.emit(isValid);
    }

    showModal(data: any = null) {
        var isNew = false;
        if(!data) {
            isNew = true;
        }
        this.editModal = this.modalProvider.showByPath(lazyModules.production_config_make_actions_edit_modal, ProductionConfigMakeActionsEditModalComponent, {
            size: 'md',
            title: isNew ? 'common.add' : 'common.edit',
            position: 'center',
            footerRef: 'modalFooterTemplate',
            usePushState: false
        }, {
            context: this,
            data: {
                Rows: this.rows,
                Lookups: this._lookups,
                PresetGroups: this.presetGroups
            },
            isNew: isNew,
            itemData: data
        });
        this.editModal.load().then((cr: ComponentRef<ProductionConfigMakeActionsEditModalComponent>) => {
            this.editModal.modalEvents.subscribe((res: any) => {
                if(res && res.name == "ok") {
                    const changedItem = cr.instance.getItemToSave();

                    if(isNew) {
                        this.rows.push(changedItem);
                    }
                    else {
                        this.rows.splice(data.row.id, 1, changedItem);
                        // this.data.tableRows.find(el => el.ID == changedItem.ID);
                    }
                    //
                    this.bindDataToGrid(true);
                    (this.slickGridComp.provider as ProductionConfigTabSlickGridProvider).updateGridRows();
                }
            });
        });
    }

    private getGridCols() {
        const columns = [];
        //order,action,isPreset,PresetChecks

        columns.unshift({
            // isFrozen: true,
            id: 1,
            name: '',
            field: '*',
            width: 15,
            minWidth: 15,
            behavior: "selectAndMove",
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            // formatter: OrderFormatter,
            cssClass: "cell-reorder skipSelection",
            headerCssClass: "disable-reorder hidden",
            // __isCustom: true,
            // __text_id: 'icons',
            // __deps: {
            //     injector: this.injector
            // }
        });

        columns.unshift({
            // isFrozen: true,
            id: 2,
            name: 'Action',
            field: 'ACTION_ID',
            width: 100,
            minWidth: 100,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: LookupFormatter,
            headerCssClass: "disable-reorder cell-reorder-w",
            cssClass: 'thumb-wrapper',
            // __isCustom: true,
            // __text_id: 'thumbnails',
            __deps: {
                injector: this.injector,
                lookupMap: this.lookups['ACTION_ID']
                    ? this.convertToMap(this.lookups['ACTION_ID'], "ID")
                    : {}
            }
        });

        columns.unshift({
            // isFrozen: true,
            id: 3,
            name: 'Is Preset',
            field: 'IS_PRESET',
            width: 70,
            minWidth: 70,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: CheckBoxFormatter,
            headerCssClass: "disable-reorder",
            cssClass: 'thumb-wrapper',
            // __isCustom: true,
            // __text_id: 'thumbnails',
            __deps: {
                injector: this.injector
            }
        });

        const mapFn = (data: SlickGridRowData|any): string => {
            if (data['IS_PRESET']) {
                const id = data['PRESET_ID'];
                let name;
                let item;

                this.presetGroups.forEach(el => {
                    if (el.Presets && el.Presets.length) {
                        const _item = el.Presets.find(_el => {
                            return _el.Id == id;
                        });
                        if (_item) {
                            item = _item;
                        };
                    } else {
                        if (el.Id == id) {
                            item = el;
                        };
                    }
                });

                name = (item) ? item.Name : '';

                return name;
            } else {
                return data['Checks'].map(el => el['DESCRIPTION']).join('; ');
            }
        }

        columns.unshift({
            // isFrozen: true,
            id: 4,
            name: 'Preset/Checks',
            field: 'Checks',
            // width: 175,
            minWidth: 200,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            // formatter: TableFormatter,
            formatter: ArrayFormatter,
            headerCssClass: "disable-reorder",
            // cssClass: 'thumb-wrapper',
            // __isCustom: true,
            // __text_id: 'thumbnails',
            __deps: {
                injector: this.injector,
                mapFn
                // dataMap: [
                //     {label: 'Description', field: 'DESCRIPTION'},
                //     {label: 'Schema', field: 'SCHEMA_ID'},
                //     {label: 'Mandatory', field: 'MANDATORY'}
                // ],
                // lookups: {'SCHEMA_ID': this._lookups['SCHEMA_ID']}
            }
        });

        columns.unshift({
            id: 5,
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
                    rows: this.rows,
                    component: this,
                    // disabledFieldMask: {
                    //     ColumnName: disabledFieldMask
                    // }
                }
            }
        });

        // this.data.tableColumns.unshift({
        //     id: -2,
        //     name: ' ',
        //     field: '',
        //     width: 35,
        //     resizable: false,
        //     sortable: false,
        //     formatter: DoActionFormatter,
        //     multiColumnSort: false,
        //     headerCssClass: "disable-reorder",
        //     isCustom: true,
        //     __deps: {
        //         injector: this.injector,
        //         data: {
        //             titleHint: "consumer_settings.edit",
        //             actionDelegate: this
        //         }
        //     }
        // });

        return columns;

    }

    private convertToMap(lookupData, field) {
        var result = {};
        for(var i =0; i < lookupData.length; i++)
        {
            result[lookupData[i][field]] = lookupData[i].Name;
        }
        return result;
    }
}
