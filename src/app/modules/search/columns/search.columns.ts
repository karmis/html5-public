/**
 * Created by Sergey Klimenko on 08.03.2017.
 */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, ViewEncapsulation} from '@angular/core';
import {SearchColumnsConfig} from './search.columns.config';
import {SearchColumnsProvider} from './providers/search.columns.provider';
import {SearchColumnsService} from './services/search.columns.service';
import * as $ from 'jquery';
import * as ld from "lodash";
import {SlickGridProvider} from '../slick-grid/providers/slick.grid.provider';
import {SlickGridColumn} from '../slick-grid/types';
import {IMFXModalComponent} from '../../imfx-modal/imfx-modal';
import {NotificationService} from '../../notification/services/notification.service';
import {IMFXModalProvider} from "../../imfx-modal/proivders/provider";
import {AddCustomColumnModalComponent} from "../../controls/add.customcolumn.modal/add.customcolumn.modal.component";
import { lazyModules } from "../../../app.routes";

@Component({
    selector: 'search-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SearchColumnsService,
        SearchColumnsProvider,
        SlickGridProvider,
        IMFXModalProvider
    ]
})

export class SearchColumnsComponent {
    columns: SlickGridColumn[] = [];
    selectedAll: boolean = false;
    private isDefault: boolean = false;
    private isGlobal: boolean = false;
    private config = <SearchColumnsConfig>{
        componentContext: <any>null,
        options: {},
    };
    private arrSgp: SlickGridProvider[];
    private modalRef: IMFXModalComponent;
    private showCustomColumnsButton = false;
    private isNew = false;
    private viewsProvider = null;
    private searchText = "";

    constructor(protected service: SearchColumnsService,
                protected provider: SearchColumnsProvider,
                private cdr: ChangeDetectorRef,
                private notificationService: NotificationService,
                private modalProvider: IMFXModalProvider,
                private injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        let modalData: { gridProviders: SlickGridProvider[] } = this.modalRef.getData();
        this.arrSgp = modalData.gridProviders;
        this.isNew = (<any>modalData).isNewView;
        this.viewsProvider = (<any>modalData).viewsProvider;
        var searchType = this.arrSgp[0]._config.options.searchType.toLowerCase();
        this.showCustomColumnsButton = searchType == "media" || searchType == "versions" || searchType == "title" || searchType == "supplierversions" || searchType == "carriers";
    }

    @Input('config') set setConfig(config) {
        this.config = $.extend(true, this.config, config);
    }

    ngAfterViewInit() {
        this.columns = this.arrSgp[0].getGlobalColumns();
        var actualColumns: SlickGridColumn[] = this.arrSgp[0].getActualColumns();
        this.columns = this.columns.filter((col) => {
            if (col.field.startsWith('xml|')) {
                if (this.isNew) {
                    return false;
                } else {
                    var matchsColumns = actualColumns.filter((actual) => {
                        return actual.field == col.field;
                    });
                    return matchsColumns.length > 0;
                }
            }
            return true;
        });

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

    public isActiveColumn(col: SlickGridColumn): boolean {
        let actualColumns: SlickGridColumn[] = this.arrSgp[0].getActualColumns();
        let res = false;
        $.each(actualColumns, (k, c: SlickGridColumn) => {
            if (c.field === col.field) {
                res = true;
                return false;
            }
        });
        return res;
    }

    onOk() {
        if (!this.viewHasColumns()) {
            return false;
        }

        for (let item of this.arrSgp) {
            item.applyColumns();
        }

        this.modalRef.modalEvents.emit({
            name: 'ok', state: {
                isGlobal: this.isGlobal,
                isDefault: this.isDefault
            }
        });
    }

    onOkAndSave() {
        if (!this.viewHasColumns()) {
            return false;
        }

        for (let item of this.arrSgp) {
            item.applyColumns();
        }

        this.modalRef.modalEvents.emit({
            name: 'ok_and_save', state: {
                isGlobal: this.isGlobal,
                isDefault: this.isDefault
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

    allowSave() {
        if (this.viewsProvider
            && this.viewsProvider.config
            && this.viewsProvider.config.componentContext
            && this.viewsProvider.config.componentContext.searchSettingsConfig
            && this.viewsProvider.config.componentContext.searchSettingsConfig.options
            && this.viewsProvider.config.componentContext.searchSettingsConfig.options.available
            && this.viewsProvider.config.componentContext.searchSettingsConfig.options.available.isMenuShow
            && this.viewsProvider.config.componentContext.searchSettingsConfig.options.available.isMenuShow.viewsSave === false
        ) {
            return false;
        }

        return true;
    }

    private viewHasColumns(): boolean {
        return !!this.arrSgp[0].getActualColumns().filter((item) => item.id > 0).length;
    }

    private setCheckbox(event, col): void {
        let $inputElement = $(event.target.parentElement).find('input');
        if ($inputElement.length > 0) {
            let input = $inputElement[0];
            let check = (<HTMLInputElement>input).checked;
            let flag: boolean = (event.target.checked || ((event.target.className === 'modal-col') && !check));

            for (let item of this.arrSgp) {
                if (flag) {
                    item.addActualColumn(ld.cloneDeep(col));
                } else {
                    item.removeActualColumn(col);
                }
            }
            // too slow
            // this.sgp.applyColumns();
        }
    }

    private selectAll(): void {
        for (let item of this.arrSgp) {
            let frozenColumns = item.getFrozenColumns(); //use unique sgp instance for right __context field value
            let cols = item.getGlobalColumns();
            if (this.selectedAll) { // deselect all
                item.setActualColumns(frozenColumns);
            } else {
                item.setActualColumns(frozenColumns.concat(ld.cloneDeep(cols)));
            }
            item.applyColumns();
        }
        this.selectedAll = !this.selectedAll;
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
                            resizable: true,
                            multiColumnSort: false,
                            sortable: false,
                            width: 150,
                            SchemaId: res.state[i].SchemaId,
                            __bindingFormat: null,
                            __bindingName: id
                        };
                        for (let item of this.arrSgp) {
                            item.addActualColumn(ld.cloneDeep(c));
                        }
                        arr.push(ld.cloneDeep(c));

                        if (this.viewsProvider._originalViews && this.viewsProvider._originalViews.ViewColumns && !this.viewsProvider._originalViews[id]) {
                            this.viewsProvider._originalViews.ViewColumns[id] = {
                                BindingFormat: null,
                                CanUserSort: false,
                                IsExtendedField: true,
                                BindingName: id,
                                TemplateName: res.state[i].Name
                            };
                        }
                    }
                    this.columns = arr.concat(this.columns);
                    for (let item of this.arrSgp) {
                        item.setGlobalColumns(ld.cloneDeep(this.columns));
                    }
                    this.cdr.detectChanges();
                }
            });
        })
    }
}
