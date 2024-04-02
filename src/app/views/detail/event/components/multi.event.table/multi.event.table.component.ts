import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../../../modules/search/slick-grid/slick-grid.config";
import {VersionSearchModalComponent} from "../../../../../modules/version-search-modal/version.search.modal.component";
import {lazyModules} from "../../../../../app.routes";
import {ActivatedRoute, Router} from "@angular/router";
import {SlickGridService} from "../../../../../modules/search/slick-grid/services/slick.grid.service";
import {ErrorModalComponent} from "../../../../../modules/error/modules/error-modal/error";
import {SecurityService} from "../../../../../services/security/security.service";
import {IMFXModalEvent} from "../../../../../modules/imfx-modal/types";
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridComponent} from "../../../../../modules/search/slick-grid/slick-grid";
import {TranslateService} from "@ngx-translate/core";
import {IMFXModalComponent} from "../../../../../modules/imfx-modal/imfx-modal";
import {SearchFormProvider} from "../../../../../modules/search/form/providers/search.form.provider";
import {MultiEventTableViewsProvider} from "./providers/multi.event.table.views.provider";
import {ViewsProvider} from "../../../../../modules/search/views/providers/views.provider";
import {MultiEventTableGridProvider} from "./providers/multi.event.table.grid.provider";
import {Subscription} from "rxjs";
import {ETCheckBoxSelected} from "../../types";
import {IMFXModalAlertComponent} from "../../../../../modules/imfx-modal/comps/alert/alert";
import {SlickGridRowData} from "../../../../../modules/search/slick-grid/types";
import {ProductionOnChangeDataType} from "../../../../../modules/search/detail/components/production.info.tab.component/production.info.tab.component";

import _ from "lodash";
import {DetailEventProvider} from "../../providers/detail.event.provider";

export type OnSelectEventsType = {
    events: SlickGridRowData[]
}

@Component({
    selector: 'multi-event-table',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        ViewsProvider,
        SlickGridService,
        SearchFormProvider,
        MultiEventTableViewsProvider,
        MultiEventTableGridProvider,
        {provide: ViewsProvider, useClass: MultiEventTableViewsProvider},
        {provide: SlickGridProvider, useClass: MultiEventTableGridProvider},
    ],
})
export class MultiEventTableComponent implements OnInit, AfterViewInit, OnChanges {
    @Input('data') data = [];
    @Input('isNew') isNew: boolean = false;

    @Output('onChange') onChangeSub: EventEmitter<any> = new EventEmitter<any>();
    @Output('onSelect') onSelectSub: EventEmitter<any> = new EventEmitter<any>();
    @Output('onCheckBox') onCheckBox: EventEmitter<ETCheckBoxSelected> = new EventEmitter<ETCheckBoxSelected>();
    @Output('onSelectEvents') onSelectEvents$: EventEmitter<OnSelectEventsType> = new EventEmitter<OnSelectEventsType>();
    @Output('onDeleteEvents') onDeleteEvents$: EventEmitter<OnSelectEventsType> = new EventEmitter<OnSelectEventsType>();
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;

    versionModalRef: IMFXModalComponent;
    mediaModalRef: IMFXModalComponent;
    titleModalRef: IMFXModalComponent;

    checkBoxSub: Subscription;
    // checkBoxSelected: ETCheckBoxSelected = {
    //     status: false,
    //     rows: [],
    // };

    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: MultiEventTableGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                exportPath: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false
            } as SlickGridConfigModuleSetups,
            plugin: {
                multiSelect: true,
                rowHeight: 40,
                forceFitColumns: true
            } as SlickGridConfigPluginSetups
        })
    });
    private checkBoxSelectedStatus: boolean = false;
    private checkBoxSelectedRows: SlickGridRowData[] = [];

    constructor(private cdr: ChangeDetectorRef,
                private notificationRef: NotificationService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private injector: Injector,
                private securityService: SecurityService,
                private eventTableGridProvider: MultiEventTableGridProvider,
                private eventTableViewsProvider: MultiEventTableViewsProvider,
                private detailEventProvider: DetailEventProvider
    ) {
    }

    ngOnInit() {
        this.eventTableGridProvider.onRowDelete.subscribe((deletedRow: SlickGridRowData) => {

            // this.data = this.data.filter((row) => this.eventTableGridProvider.getId(removeRow) != this.eventTableGridProvider.getId(row));
            this.onChangeSub.next(this.getData(true));
            const rowId = this.eventTableGridProvider.getId(deletedRow);
            // this.slickGridComp.provider.deleteRow(deletedRow, rowId);
            this.slickGridComp.provider.removeCheckedRows([rowId]);
            // this.
        });
    }

    ngOnDestroy() {
        this.bufferedChanges = {};
        this.eventTableGridProvider.onRowDelete.unsubscribe();
    }

    ngAfterViewInit() {
        // debugger
        this.initTable(this.data);
    }

    ngOnChanges(changes: SimpleChanges) {
        // if (changes.data && changes.data.currentValue) {
        //     this.updateTable(changes.data.currentValue);
        // }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    onAddOrChangeVersions(editVersion = false) {
        const mp: IMFXModalProvider = this.injector.get(IMFXModalProvider);
        this.versionModalRef = mp.showByPath(lazyModules.version_search_modal, VersionSearchModalComponent, {
            name: 'version-search-modal',
            title: editVersion ? 'version.wizard.change' : 'version.wizard.title',
            size: 'xl',
            footer: 'cancel|ok'
        }, {});


        this.versionModalRef.load().then((modal: ComponentRef<ErrorModalComponent>) => {
            const comp: VersionSearchModalComponent = this.versionModalRef.getContent();
            if (editVersion) {
                // @ts-ignore
                comp.searchGridConfig.options.plugin.multiSelect = false;
            }
            console.log(comp);
            comp.rowDbClicked.subscribe((rowData) => {
                this.versionModalRef.hide('ok');
                // this.addRowsIntoGrid([rowData]);
            });
            this.versionModalRef.modalEvents.subscribe((event: IMFXModalEvent) => {
                if (event.name == 'ok') {
                    const sgp: SlickGridProvider = comp.slickGridComp.provider;
                    const sR = sgp.getSelectedRows();
                    if (editVersion && sR[0]) {
                        const selRow = sR[0];
                        const oldRow = this.eventTableGridProvider.getSelectedRow();
                        if (oldRow) {
                            this.updateRowInGrid(selRow, oldRow);
                        }
                    } else {
                        this.addRowsIntoGrid(sR);
                    }

                    this.versionModalRef.hide('autohide');
                }
            });
        });
    }

    onEditTime() {
        if(this.isNew) {
            return;
        }
        let cols = this.eventTableViewsProvider.getCustomColumns();
        let checkBoxCol = [];
        this.checkBoxSelectedStatus = !this.checkBoxSelectedStatus;
        if (this.checkBoxSelectedStatus) {
            checkBoxCol = this.eventTableViewsProvider.getCheckBoxColumn();
            cols = checkBoxCol.concat(cols);
        }
        this.eventTableGridProvider.setGlobalColumns(cols);
        this.eventTableGridProvider.setDefaultColumns(cols, [], true);

        this.cdr.detectChanges();
        if (this.checkBoxSelectedStatus) {
            const sgp = this.slickGridComp.provider;
            this.checkBoxSub = this.eventTableGridProvider.formatterCheckBoxOnChange.subscribe(checkData => {
                if (checkData.value) {
                    this.checkBoxSelectedRows = sgp.getCheckedRowsObjects();
                } else {
                    this.checkBoxSelectedRows = sgp.getCheckedRowsObjects().filter(el => sgp.getId(el) !== sgp.getId(el));
                }
                this.onCheckBox.next({rows: this.checkBoxSelectedRows, status: this.checkBoxSelectedStatus});
            })
        } else {
            this.checkBoxSelectedRows = [];
            this.checkBoxSub && this.checkBoxSub.unsubscribe();
        }
        this.onCheckBox.next({rows: this.checkBoxSelectedRows, status: this.checkBoxSelectedStatus});
    }

    onClearVersions() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'sm',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'common.confirmation',
            );
            const sub = modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    console.log('clear');
                    this.updateTable([]);
                    this.onChangeSub.next([]);
                }
                sub.unsubscribe();
                modal.hide();

            });
        });

    }

    updateTable(data: SlickGridRowData[], selectedId = null) {
        if (this.slickGridComp && this.slickGridComp.provider) {
            data = data.map(row => {
                row['TIMES_MULTI-EDIT'] = false;
                return row;
            });
            data = _.uniqBy(data, this.eventTableGridProvider.getIdField());
            this.eventTableGridProvider.buildPageByData((<any>{Data: data}));
            if (selectedId != null) {
                this.eventTableGridProvider.setSelectedRow(selectedId);
            }
        }
    }

    initTable(data) {
        if (this.slickGridComp && this.slickGridComp.provider) {
            let globalColsView = this.eventTableViewsProvider.getCustomColumns();
            this.eventTableGridProvider.setGlobalColumns(globalColsView);
            this.eventTableGridProvider.setDefaultColumns(globalColsView, [], true);
            this.eventTableGridProvider.buildPageByData({Data: data});
        }
    }

    private bufferedChanges: {[key:string]: any} = {};
    updateRows(changes: ProductionOnChangeDataType[] = [], mode: 'checked'|'all'|'selected' = 'checked', selectedRows: SlickGridRowData[] = null) {
        const provider: SlickGridProvider = this.slickGridComp.provider;
        const rows: SlickGridRowData[] = selectedRows?selectedRows:mode === 'all' ? provider.getData() : provider.getCheckedRowsObjects();
        if (!rows.length) {
            changes.forEach((itemChanges) => {
                this.bufferedChanges[itemChanges.fieldId] = itemChanges.fieldValue;
            });
            return;
        }

        const dataView = provider.getDataView();
        const grid = provider.getSlick();
        dataView.beginUpdate(rows.map((row) => provider.getId(row)));
        rows.forEach((row: SlickGridRowData) => {
            if (changes.length) { // update from changes
                const duration = this.detailEventProvider.calcDuration(row['START_DATETIME'] || 0, row['END_DATETIME'] || 0);
                changes.forEach((itemChanges: ProductionOnChangeDataType) => {
                    const replacer = {};
                    replacer[itemChanges.fieldId] = itemChanges.fieldValue;
                    replacer['DURATION'] = duration;
                    replacer['Duration'] = duration;
                    dataView.updateItem(provider.getId(row), Object.assign({}, row, replacer));
                });
            } else if(!$.isEmptyObject(this.bufferedChanges)) {
                const duration = this.detailEventProvider.calcDuration(this.bufferedChanges['START_DATETIME'] || 0, this.bufferedChanges['END_DATETIME'] || 0);
                this.bufferedChanges['DURATION'] = duration;
                this.bufferedChanges['Duration'] = duration;
                dataView.updateItem(provider.getId(row), Object.assign({}, row, this.bufferedChanges));
            }

        });
        grid.invalidateAllRows();
        dataView.endUpdate();
        grid.render();
    }

    updateRowsFromBuffer(mode: 'selected'|'all' = 'selected') {

    }

    getData(withClear = false) {
        return this.eventTableGridProvider.getData();
    }

    addRowsIntoGrid(data: SlickGridRowData[]) {
        let newData = [];
        newData = [...this.getData(), ...data.map((el: SlickGridRowData|any) => {
            return {
                VERSION_ID: el.ID,
                FULLTITLE: el.FULLTITLE,
                VERSIONID1: el.VERSIONID1,
                OWNERS_text: el.OWNERS_text,
                NEXT_TX_DATE: el.N_TX_DT,
                ID: 0,
                START_DATETIME: null,
                END_DATETIME: null
            }
        })];
        // this.onSelectEvents$.next({selected: newData, events})
        this.updateTable(newData);
        if(!$.isEmptyObject(this.bufferedChanges)) {
            this.updateRows([], this.isNew?'all':'checked');
        }
        this.onChangeSub.next(this.eventTableGridProvider.getClearDataAsArray(this.getData(true)));
    }

    updateRowInGrid(newRow: SlickGridRowData|any, oldRow: SlickGridRowData|any) {

        const data: SlickGridRowData[] = this.getData();
        const newData = data.map((el: SlickGridRowData|any) => {
            if(el.ID === oldRow.VERSION_ID || el.ID === oldRow.ID) { // if we want reselect one version multi times
                return {
                    VERSION_ID: newRow.ID,
                    FULLTITLE: newRow.FULLTITLE,
                    VERSIONID1: newRow.VERSIONID1,
                    OWNERS_text: newRow.OWNERS_text,
                    NEXT_TX_DATE: newRow.N_TX_DT,
                    ID: oldRow.ID,
                    START_DATETIME: null,
                    END_DATETIME: null
                }
            } else {
                return  el;
            }
        })

        // this.onSelectEvents$.next({selected: newData, events})
        this.updateTable(newData, newRow[this.eventTableGridProvider.getIdField()]);

        this.onChangeSub.next(this.eventTableGridProvider.getClearDataAsArray(this.getData(true)));
    }
}
