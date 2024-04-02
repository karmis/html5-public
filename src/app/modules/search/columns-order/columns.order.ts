/**
 * Created by Sergey Trizna on 10.01.2016.
 */
import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as $ from 'jquery';
import { UserLookupType } from '../../../services/lookupsearch/types';
import { AdvancedCriteriaControlLookupUsersModalDataType } from '../advanced/comps/criteria/comps/controls/comps/container/comps/lookupsearch/users.modal/types';
import { TranslateService } from '@ngx-translate/core';
import { SlickGridProvider } from '../slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../slick-grid/slick-grid.config';
import { SlickGridColumn } from '../slick-grid/types';
import { CheckBoxFormatter } from '../slick-grid/formatters/checkBox/checkbox.formatter';
import { Router } from '@angular/router';
import { LookupSearchService } from "../../../services/lookupsearch/common.service";
import { SearchTypesType } from '../../../services/system.config/search.types';
import { ViewsService } from '../views/services/views.service';
import { ViewsOriginalType } from '../views/types';
import { ColumnsOrderService } from './services/columns.order.service';
import { NotificationService } from '../../notification/services/notification.service';
import { Subscription } from 'rxjs/Rx';
import { IMFXModalEvent } from '../../imfx-modal/types';

export type ColumnsOrderModalConfigType = {
    searchType: SearchTypesType,
    selected: { [key: string]: AscDescType },
    prefix: string,
}
export type AscDescType = 'ASC' | 'DESC';
export const ColumnOrderPrefixConst = 'column.order'
@Component({
    selector: 'columns-order',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    providers: [
        SlickGridProvider,
        SlickGridService,
        ColumnsOrderService
    ],
    entryComponents: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class ColumnsOrderComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public modalRef: any;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public onSelectEvent: EventEmitter<any> = new EventEmitter<any>();
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    public config: ColumnsOrderModalConfigType = {
        searchType: 'media',
        selected: {ID: 'ASC'},
        prefix: ColumnOrderPrefixConst
    }
    private compRef = this;
    private paramsOfSearch = '';
    @ViewChild('filterInput', {static: false}) private filterInput: ElementRef;
    @Input('isModal') private isModal: boolean = true;
    /**
     * Grid
     * @type {SlickGridConfig}
     */
    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                forceFitColumns: true,
                multiSelect: false
            }
        })
    });
    private tableColumns_settings = {
        tableRows: [],
        tableColumns: <SlickGridColumn[]>[
            {
                id: '0',
                name: 'Template Name',
                field: 'TemplateName',
                width: 100,
                resizable: true,
                sortable: true,
                multiColumnSort: false
            },
            {
                id: 1,
                name: 'ASC',
                field: '_isASC',
                resizable: true,
                sortable: true,
                formatter: CheckBoxFormatter,
                multiColumnSort: false,
                cssClass: 'imfx-slickgrid-checkboxes',
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector,
                    data: {
                        enabled: true,
                    }
                }
            },
            {
                id: 2,
                name: 'DESC',
                field: '_isDESC',
                resizable: true,
                sortable: true,
                formatter: CheckBoxFormatter,
                multiColumnSort: false,
                cssClass: 'imfx-slickgrid-checkboxes',
                isCustom: true,
                width: 60,
                __deps: {
                    injector: this.injector,
                    data: {
                        enabled: true,
                    }
                }
            },
        ]
    };
    private originalView: ViewsOriginalType;
    private tableRows: any[] = [];
    private originalTableRows: any[] = []

    constructor(private injector: Injector,
                private lookupSearchService: LookupSearchService,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private viewsService: ViewsService,
                private colService: ColumnsOrderService,
                private notificationService: NotificationService) {
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.modalRef = this.injector.get('modalRef');
        this.config = this.modalRef.getData() as ColumnsOrderModalConfigType;
        debugger;
    }

    ngAfterViewInit() {
        this.modalRef.showOverlay(true);
        this.viewsService.getViews(this.config.searchType).subscribe((view: ViewsOriginalType) => {
            if (this.originalView) {
                const keys = Object.keys(this.originalView.ViewColumns);
                keys.forEach((key) => {
                    if (key.startsWith("xml|") && !view.ViewColumns[key]) {
                        view.ViewColumns[key] = this.originalView.ViewColumns[key];
                    }
                });
            }
            this.originalView = view;
            this.tableRows = Object.keys(this.originalView.ViewColumns).filter((colName) => {
                return this.originalView.ViewColumns[colName].CanUserSort;
            }).map((colName) => {
                return Object.assign({}, this.originalView.ViewColumns[colName], {
                    _isASC: this.config.selected[colName] === 'ASC',
                    _isDESC: this.config.selected[colName] === 'DESC'
                });
            });
            this.originalTableRows = Object.assign([], this.tableRows);
            this.filterInput.nativeElement.focus();
            this.bindDataToGrid(true)
            this.cdr.markForCheck();
            // this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            //     if (e.name === 'ok') {
            //         this.closeModal();
            //         // this.saveSbs = this.colService.update(this.config.prefix, this.config.selected).subscribe(() => {
            //         //     this.notificationService.notifyShow(1, this.translate.instant('settings_group.order_col.saved'))
            //         //     this.closeModal();
            //         // });
            //     }
            // });
            this.modalRef.hideOverlay();
            this.onReady.emit();
        });

    }

    bindDataToGrid(isNew: boolean = false) {
        if (isNew) {
            this.slickGridComp.provider.initColumns(this.tableColumns_settings.tableColumns, [], true);
            this.slickGridComp.provider.formatterCheckBoxOnChange.subscribe((data) => {
                this.config.selected = {};
                if (data.value) {
                    const ch = data.data.columnDef.name === 'ASC' ? 'ASC' : 'DESC';
                    this.originalTableRows = this.originalTableRows.map((row) => {
                        row._isASC = false;
                        row._isDESC = false;
                        return row;
                    })
                    this.tableRows = this.tableRows.map((row) => {
                        row._isASC = false;
                        row._isDESC = false;
                        return row;
                    })
                    this.config.selected[data.data.data.BindingName] = ch;
                    this.tableRows[data.data.rowNumber][ch === 'DESC' ? '_isDESC' : '_isASC'] = true;
                    this.slickGridComp.provider.buildPageByData({Data: this.tableRows});
                    this.cdr.markForCheck();
                }
            });
        }
        this.slickGridComp.provider.buildPageByData({Data: this.tableRows});
    }

    private saveSbs: Subscription;

    ngOnDestroy() {
        if (this.saveSbs) {
            this.saveSbs.unsubscribe();
        }
    }

    save() {
        // saveSbs
    }

    closeModal() {
        this.modalRef.hide();
    }

    private onFilter() {
        this.paramsOfSearch = this.filterInput.nativeElement.value;
        let filter = this.originalTableRows.filter((el) => {

            // for loans select user
            if (el.TemplateName) {
                let value = this.paramsOfSearch.toLowerCase();
                if ((el.TemplateName && el.TemplateName.toLowerCase().indexOf(value) !== -1)) {
                    return true;
                }
            }

            return false;
        });
        if (filter.length === 0) {
            this.slickGridComp.provider.clearData(true);
        } else {
            this.tableRows = filter;
            this.slickGridComp.provider.buildPageByData({Data: this.tableRows});
            this.cdr.detectChanges();
        }
    }
}
