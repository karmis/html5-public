import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation,
    ElementRef
} from '@angular/core';
import {SearchColumnsConfig} from '../../../../../../../../../../../modules/search/columns/search.columns.config';
import {SearchColumnsProvider} from '../../../../../../../../../../../modules/search/columns/providers/search.columns.provider';
import {SearchColumnsService} from '../../../../../../../../../../../modules/search/columns/services/search.columns.service';
import * as $ from 'jquery';
import * as ld from "lodash";
import {IMFXModalComponent} from '../../../../../../../../../../../modules/imfx-modal/imfx-modal';
import {NotificationService} from '../../../../../../../../../../../modules/notification/services/notification.service';
import {IMFXModalProvider} from "../../../../../../../../../../../modules/imfx-modal/proivders/provider";
import {AddCustomColumnModalComponent} from "../../../../../../../../../../../modules/controls/add.customcolumn.modal/add.customcolumn.modal.component";
import { lazyModules } from "../../../../../../../../../../../app.routes";
import {ViewColumnsType} from "../../../../../../../../../../../modules/search/views/types";
import {RESTColumnSettings, SlickGridColumn} from "../../../../../../../../../../../modules/search/slick-grid/types";

@Component({
    selector: 'search-view-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SearchColumnsService,
        SearchColumnsProvider,
        IMFXModalProvider
    ]
})

export class SearchViewsColumnsComponent {
    columns = [];
    actualColumns = [];
    selectedAll: boolean = false;
    createNewView: boolean = false;
    private isGlobal: boolean = true;
    private isDefault: boolean = false;
    private config = <SearchColumnsConfig>{
        componentContext: <any>null,
        options: {},
    };
    private modalRef: IMFXModalComponent;
    private showCustomColumnsButton = true;
    private isNew = false;
    private searchText = "";

    constructor(protected service: SearchColumnsService,
                protected provider: SearchColumnsProvider,
                private cdr: ChangeDetectorRef,
                private notificationService: NotificationService,
                private modalProvider: IMFXModalProvider,
                private injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        let modalData = this.modalRef.getData();
        this.isNew = (<any>modalData).isNewView;
        this.columns = this.prepareGlobalColumnsToArray((<any>modalData).columns, (<any>modalData).actualColumns);
        this.actualColumns = this.prepareViewColumnsToArray((<any>modalData).actualColumns, (<any>modalData).columns);
    }

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }
    @ViewChild('columnsWrapper', {static: false}) public columnsWrapper: ElementRef;

    ngAfterViewInit() {
        // this.columns = this.columns.filter((col) => {
        //     if (col.field.startsWith('xml|')) {
        //         if (this.isNew) {
        //             return false;
        //         } else {
        //             var matchsColumns = this.actualColumns.filter((actual) => {
        //                 return actual.field == col.field;
        //             });
        //             return matchsColumns.length > 0;
        //         }
        //     }
        //     return true;
        // });

        let countActive = 0;
        this.columns.forEach(col => {
            if (this.isActiveColumn(col)) {
                countActive += 1;
            }
        });

        if (countActive === this.columns.length) {
            this.selectedAll = true;
        }

        this.cdr.detectChanges();
    }

    public isActiveColumn(col): boolean {
        let res = false;
        $.each(this.actualColumns, (k, c) => {
            if (c.field === col.field) {
                res = true;
                return false;
            }
        });
        return res;
    }

    onOk() {
        this.modalRef.modalEvents.emit({
            name: 'ok', state: {
                isGlobal: this.isGlobal,
                isDefault: this.isDefault,
                actualColumns: this.prepareViewColumnsToObject(this.actualColumns)
            }
        });
    }

    onOkAndSave() {
        this.modalRef.modalEvents.emit({
            name: 'ok_and_save', state: {
                isGlobal: this.isGlobal,
                isDefault: this.isDefault,
                actualColumns: this.prepareViewColumnsToObject(this.actualColumns)
            }
        });
    }

    hide() {
        this.modalRef.hide();
        this.modalRef.modalEvents.emit({
            name: 'hide',
        });
    }

    isXMLColumn(col) {
        return col.field.startsWith("xml|");
    }

    getXPath(col) {
        return col.field.split("|")[2];
    }

    private setCheckbox(event, col): void {
        let $inputElement = $(event.target.parentElement).find('input');
        if ($inputElement.length > 0) {
            let input = $inputElement[0];
            let check = (<HTMLInputElement>input).checked;
            let flag: boolean = (event.target.checked || ((event.target.className === 'modal-col') && !check));
            if (flag) {
                this.addActualColumn(ld.cloneDeep(col));
            } else {
                this.removeActualColumn(col);
            }
        }
    }

    private selectAll(): void{
        if (this.selectedAll) { // deselect all
            $.each(this.columns, (k, col) => {
                this.removeActualColumn(col);
            })
        } else {
            $.each(this.columns, (k, col) => {
                this.addActualColumn(col);
            })
        }
        $(this.columnsWrapper).find('input[type="checkbox"]').prop('checked', this.selectedAll);
        this.selectedAll = !this.selectedAll;
    }
    private addActualColumn(col){
        if (!col) {
            return;
        }
        // added because when add new column, it id can duplicate
        const idxArray = this.actualColumns.map((el) => {
            return el.id;
        });
        const maxId = Math.max.apply(null, idxArray);

        if (col && col.id >= 0) {
            col.id = (maxId < 0) ? 1 : maxId + 1;
        }
        this.actualColumns.push(col);
    }
    private removeActualColumn(col){
        const result: any[] = this.actualColumns.filter((dc: any) => {
            let res = true;
            $.each([col], (k: number | string, c: any) => {
                if (c.__isCustom == true) {
                    if (c && c.__text_id && c.__text_id == dc.__text_id) {
                        res = false;
                        return true;
                    }
                } else {
                    if (c.field == dc.field) {
                        // for simple columns
                        res = false;
                        return true;
                    }
                }
            });

            return res;
        });

        this.actualColumns = result;
    }
    private prepareViewColumnsToArray(_columnData: any, _viewColumns: ViewColumnsType) {
        let cols: any[] = [];
        // const prevExtCols = this.service.getExtendsColumns();
        // const newExtCols = [];
        $.each(_viewColumns, (key, settingsForCol: RESTColumnSettings) => {
            const col: any = _columnData[key];
            if (col && settingsForCol) {
                const colDef: any = {
                    id: col.Index,
                    name: settingsForCol.TemplateName,
                    field: settingsForCol.BindingName,
                    __bindingFormat: settingsForCol.BindingFormat,
                    __bindingName: settingsForCol.BindingName,
                    __col: col
                };

                cols.push(colDef);
            }

        });
        for (let key in _columnData) {
            if(key.slice(0,4) === 'xml|') {
                cols.push({
                    id: _columnData[key].Index,
                    name: _columnData[key].Label,
                    field: _columnData[key].Tag,
                    __bindingFormat: null,
                    __bindingName: _columnData[key].Tag,
                    __col: _columnData[key]
                })
            }
        }

        return cols;
    }
    private prepareGlobalColumnsToArray(_c: ViewColumnsType, selectedColumns) {
        const gc: any[] = [];
        $.each(_c, (k, o: RESTColumnSettings) => {
            const colDef = {
                id: gc.length + 1,
                name: o.TemplateName,
                field: o.BindingName,
                __bindingFormat: o.BindingFormat,
                __bindingName: o.BindingName,
            };
            gc.push(colDef as SlickGridColumn);
        });

        for (let key in selectedColumns) {
            if(key.slice(0,4) === 'xml|') {
                gc.push({
                    id: 999 + selectedColumns[key].Index,
                    name: selectedColumns[key].Label,
                    field: selectedColumns[key].Tag,
                    __bindingName: selectedColumns[key].Tag,
                    __bindingFormat: null,
                    __col: selectedColumns[key]
                })
            }
        }

        return gc;
    }
    private prepareViewColumnsToObject(cols: any) {
        let ColumnData = {};
        $.each(cols, (key, col: any) => {
            if(col.__bindingName.indexOf("xml|") >= 0){
                ColumnData[col.field] =  {
                    Index: col.id,
                    Tag: col.field,
                    Width: col.__col? col.__col.Width : 150,
                    Label: col.name
                }
            } else {
                ColumnData[col.field] =  {
                    Index: col.id,
                    Tag: col.field,
                    Width: col.__col? col.__col.Width : 150
                }
            }

        });
        return ColumnData;
    }

    private addCustomColumns() {
        var setupCustomColumnsModal = this.modalProvider.showByPath(lazyModules.add_custom_column_modal,
            AddCustomColumnModalComponent, {
                size: 'md',
                title: 'custom_columns.modal.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {context: this});
        setupCustomColumnsModal.load().then(cr => {
            setupCustomColumnsModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    var arr = [];
                    for (var i = 0; i < res.state.length; i++) {
                        var id = "xml|" + res.state[i].SchemaId + "|" + res.state[i].Path;

                        if (this.columns.find(el => el.field === id)) {
                            continue;
                        }

                        var c = {
                            id: 999 + i,
                            name: res.state[i].Name,
                            field: id,
                            width: 150,
                            __bindingFormat: null,
                            __bindingName: id
                        };
                        this.addActualColumn(ld.cloneDeep(c));

                        arr.push(ld.cloneDeep(c));
                        this.columns = arr.concat(this.columns);
                        this.cdr.detectChanges();
                    }
                }
            });
        })
    }
}
