import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from "@angular/router";
import {takeUntil} from "rxjs/internal/operators";
import {Subject} from "rxjs";
import {IMFXModalComponent} from 'app/modules/imfx-modal/imfx-modal';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "app/modules/search/slick-grid/slick-grid.config";
import {SlickGridProvider} from "app/modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "app/modules/search/slick-grid/services/slick.grid.service";
import {SlickGridComponent} from "app/modules/search/slick-grid/slick-grid";
import {LookupFormatter} from "app/modules/search/slick-grid/formatters/lookup/lookup.formatter";
import {CheckBoxFormatter} from "app/modules/search/slick-grid/formatters/checkBox/checkbox.formatter";
import {DeleteFormatter} from "app/modules/search/slick-grid/formatters/delete/delete.formatter";
import {ViewsProvider} from "app/modules/search/views/providers/views.provider";
import {DoActionFormatter} from 'app/modules/search/slick-grid/formatters/doaction/doaction.formatter';
import {IMFXModalEvent} from "app/modules/imfx-modal/types";
import {ProductionConfigMakeActionsEditModalGridModalComponent} from '../edit.modal.grid.modal/production.config.make.actions.edit.modal.grid.modal.component';
import {IMFXModalProvider} from "app/modules/imfx-modal/proivders/provider";
import {ProductionConfigTabSlickGridProvider} from "../../../tab.grid/providers/slick.grid.provider";
import {lazyModules} from "../../../../../../../../../../../app.routes";
import {ProductionConfigTabGridEditModalComponent} from "../../../tab.grid/components/edit.modal/production.config.tab.grid.edit.modal.component";
import { ProductionMakeActionsTabEditModalSlickGridProvider } from '../../providers/slick.grid.provider';
import {PresetType} from "../../../../../../../../../../../modules/order-presets-grouped/types";
import { OrderPresetGroupedInputComponent } from 'app/views/media-basket/components/order.preset.grouped.input/order.preset.grouped.input.component';
import { OrderPresetsGroupedComponent } from 'app/modules/order-presets-grouped/order.presets.grouped.component';

@Component({
    selector: 'production-config-make-actions-edit-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        ViewsProvider,
        {provide: SlickGridProvider, useClass: ProductionMakeActionsTabEditModalSlickGridProvider},
    ]
})

export class ProductionConfigMakeActionsEditModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('slickGrid', {static: true}) private slickGridComp: SlickGridComponent;
    // @ViewChild('controlWorkflow', {static: true}) private controlWorkflow: OrderPresetGroupedInputComponent;
    @ViewChild('listWorkflow', {static: true}) private listWorkflow: OrderPresetsGroupedComponent;
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

    private modalRef: IMFXModalComponent;
    private data;
    private presetGroups;
    private readonly itemData;
    private context;
    private readonly isNew;
    private readonly lookups = {};
    private rows = [];
    private readonly itemToSave: {
        ACTION_ID?: number,
        CHECKS_FILTER?: number,
        Checks?: any[],
        ID?: number,
        IS_PRESET?: boolean,
        PRESET_ID?: number,
        TEXT_TEMPLATE_ID?: number,
        TIER?: number,
    } = {};
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                protected router: Router,
                protected modalProvider: IMFXModalProvider,
                protected translate: TranslateService
    ) {

        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.data = d.data;
        this.lookups = this.data.Lookups || {};
        this.rows = this.data.Rows || [];
        this.presetGroups = this.data.PresetGroups || null;
        this.itemData = d.itemData && d.itemData.data ? d.itemData.data : d.itemData && d.itemData.row ? d.itemData && d.itemData.row : {};
        this.context = d.context;
        this.isNew = d.isNew;

        this.itemToSave = (!this.isNew)
            ? $.extend(true, {}, this.itemData)
            : {
                ACTION_ID: null,
                CHECKS_FILTER: null,
                Checks: [],
                IS_PRESET: false,
                PRESET_ID: null,
                TEXT_TEMPLATE_ID: null,
                TIER: null
            };

    }

    ngOnInit() {
        this.slickGridComp.onGridReady.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(()=>{

            this.slickGridComp.provider.onRowMouseDblClick.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((data)=> {
                //delete data.row.id;
                this.doAction({
                    data: data.row,
                    rowNumber: data.row.id
                });
            });

            this.slickGridComp.provider.onSelectRow.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((data)=> {
                if(data && data.length > 0 && this.gridReady) {
                    let row = this.slickGridComp.provider.getSelectedRow();
                }
            });

            this.slickGridComp.provider.onRowDelete.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((data)=> {
                // @ts-ignore
                this.itemToSave.Checks.splice(data.id, 1);
            });
        });
    }

    ngAfterViewInit() {
        this.bindDataToGrid();
        // this.controlWorkflow.setValueByIdAsync(this.itemToSave['PRESET_ID']).subscribe();//[value]="{Id: itemToSave['PRESET_ID']}"
        this.listWorkflow.setPresetActiveByIdAsync(this.itemToSave['PRESET_ID']).subscribe();//[value]="{Id: itemToSave['PRESET_ID']}"
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
        this.slickGridComp.provider.buildPageByData({Data: this.itemToSave.Checks});
        this.slickGridComp.provider.resize();
    }

    private getGridCols() {
        const columns = [];

        const convertToMap = (lookupData) => {
            var result = {};
            for(var i =0; i < lookupData.length; i++)
            {
                result[lookupData[i]['id']] = lookupData[i]['text'];
            }
            return result;
        };

        columns.unshift({
            id: 1,
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

        columns.unshift({
            // isFrozen: true,
            id: 2,
            name: 'Description',
            field: 'DESCRIPTION',
            // width: 200,
            minWidth: 200,
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            headerCssClass: "disable-reorder",
            cssClass: 'thumb-wrapper'
        });

        columns.unshift({
            // isFrozen: true,
            id: 3,
            name: 'Schema',
            field: 'SCHEMA_ID',
            width: 200,
            minWidth: 200,
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            formatter: LookupFormatter,
            headerCssClass: "disable-reorder",
            cssClass: 'thumb-wrapper',
            // __isCustom: true,
            // __text_id: 'thumbnails',
            __deps: {
                injector: this.injector,
                lookupMap: this.lookups['SCHEMA_ID']
                    ? convertToMap(this.lookups['SCHEMA_ID'])
                    : {}
            }
        });

        columns.unshift({
            // isFrozen: true,
            id: 4,
            name: 'Mandatory',
            field: 'MANDATORY',
            width: 75,
            minWidth: 75,
            resizable: true,
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
                    rows: this.itemToSave.Checks,
                    component: this
                }
            }
        });

        return columns;
    }

    doAction(data) {
        this.showModal(data);
    }

    showModal(data = null) {
        let isNew = false;
        if(!data) {
            isNew = true;
        }

        // const modal = this.modalProvider.show(ProductionConfigMakeActionsEditModalGridModalComponent, {
        const modal = this.modalProvider.showByPath(
            lazyModules.production_config_make_actions_edit_modal_grid_modal,
            ProductionConfigMakeActionsEditModalGridModalComponent,
            {
                size: 'md',
                title: isNew ? 'common.add' : 'common.edit',
                position: 'center',
                footerRef: 'modalFooterTemplate',
                usePushState: false
            },
            {
                context: this,
                Lookups: this.lookups,
                itemData: data
            });


        // const cr: ProductionConfigMakeActionsEditModalGridModalComponent = modal.contentView.instance;
        modal.load().then((cr: ComponentRef<ProductionConfigMakeActionsEditModalGridModalComponent>) => {
        modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name == 'ok') {
                const changedItem = cr.instance.getItemToSave();

                if(isNew) {
                    this.itemToSave.Checks.push(changedItem);
                }
                else {
                    this.itemToSave.Checks.splice(data.rowNumber, 1, changedItem);
                    // this.data.tableRows.find(el => el.ID == changedItem.ID);
                }
                //
                this.bindDataToGrid(true);
            }
        });
        });
    }

    clickOk() {
        if (!this.validate()) {
            this.showOkAttepmtValidFlag();
            return;
        }

        this.modalRef.emitClickFooterBtn('ok');

        this.modalRef.hide();
        // this.closeModal();
    }

    closeModal() {
        this.modalRef.hide();
    }

    onSelect(data, fieldId) {
        var id = data.params.data[0] ? data.params.data[0].id : "";
        if (id != this.itemToSave[fieldId]) {
            this.itemToSave[fieldId] = id;
        }
    }

    clickByPresetItemEvent(preset: PresetType) {
        this.itemToSave['PRESET_ID'] = preset.Id;
    }

    onClearPresetItem() {
        this.itemToSave['PRESET_ID'] = null;
    }

    getLookupsForRules(lookupField, isUnic = false) {
        const result = [];
        const lookupData = this.lookups[lookupField];

        for(var i =0; i < lookupData.length; i++)
        {
            if(isUnic) {
                if (!this.rows.find(el => el[lookupField] == lookupData[i].id) || this.itemToSave[lookupField] == lookupData[i].id) {
                    result.push(lookupData[i]);
                }
            } else {
                result.push(lookupData[i]);
            }
        }
        return result;

    }

    getItemToSave() {
        this.itemToSave.Checks = this.slickGridComp.provider.deleteUnnecessaryDataBeforeSaving(this.itemToSave.Checks);
        return this.itemToSave;
    }

    okAttepmt = false;
    showOkAttepmtValidFlag() {
        this.okAttepmt = true;
        this.cd.markForCheck();
        setTimeout(() => {
            this.okAttepmt = false;
        }, 5000);
    }

    validateField(field): boolean {
        if (field == 'ACTION_ID' && !this.itemToSave[field]) {
            return false;
        }

        if (field == 'PRESET_ID' && this.itemToSave['IS_PRESET'] && !this.itemToSave['PRESET_ID']) {
            return false;
        }

        if (field == 'Checks' && !this.itemToSave['IS_PRESET'] && (!this.itemToSave['Checks'] || !this.itemToSave['Checks'].length)) {
            return false;
        }

        return true;
    }

    validate(): boolean {
        if (!this.validateField('ACTION_ID')) {
            return false;
        }

        if (!this.validateField('PRESET_ID')) {
            return false;
        }

        if (!this.validateField('Checks')) {
            return false;
        }

        return true;
    }

    filterByValue(array, string, field, itemId) {
        return array.filter((o) => {
            delete o.$id;
            delete o.EntityKey;
            delete o.id;
            delete o.__contexts;
            if (o.hasOwnProperty(field) && o[field] && o["ID"] != itemId) {
                return o[field].toString().trim().toLowerCase() == string.toLowerCase();
            }
            return false;
        });
    }

}
