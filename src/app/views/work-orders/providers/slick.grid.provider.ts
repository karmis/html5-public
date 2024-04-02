/**
 * Created by Sergey Trizna on 27.12.2017.
 */
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import { Router } from "@angular/router";
import { BasketService } from "../../../services/basket/basket.service";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector, ReflectiveInjector } from "@angular/core";
import {
    SlickGridEventData,
    SlickGridExpandableRowData,
    SlickGridInsideExpandRowFormatterData, SlickGridResp
} from "../../../modules/search/slick-grid/types";
import { IMFXModalProvider } from "../../../modules/imfx-modal/proivders/provider";
import { HttpService } from '../../../services/http/http.service';
import * as $ from "jquery";
import { BaseProvider } from '../../base/providers/base.provider';
import { SecurityService } from '../../../services/security/security.service';
import { WorkOrdersExpandRowComponent } from '../modules/slickgrid/formatters/expand.row/expand.row.formatter';
import { WorkOrdersComponent } from '../work.orders.component';
import { WorkOrdersService } from '../services/work.orders.service';
import { NotificationService } from '../../../modules/notification/services/notification.service';
import { SearchModel } from '../../../models/search/common/search';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
import { WorkflowComponent } from '../../workflow/workflow.component';
import { HttpErrorResponse } from '@angular/common/http';

export class WorkOrdersSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public basketService: BasketService;
    public baseProvider: BaseProvider;
    private refreshStarted;
    private modalProvider: IMFXModalProvider;
    private httpService: HttpService;
    public expandedRows?: any[] = [];
    public isGridExpanded: boolean;
    public selectedSubRow?: { id?: number, index?: number } = {};
    public securityService: SecurityService;
    public workOrdersService: WorkOrdersService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.httpService = injector.get(HttpService);
        this.baseProvider = injector.get(BaseProvider);
        this.securityService = injector.get(SecurityService);
        this.workOrdersService = injector.get(WorkOrdersService);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        return;
    }

    requestBrowseCopy() {
        console.log('requestBrowseCopy');
    }

    afterRequestData(resp, searchModel) {
        if ( !(<WorkOrdersComponent>this.componentContext).refreshStarted) {
            this.expandedRows = [];
        }
        if (!(<WorkOrdersComponent>this.componentContext).refreshStarted) {
            super.afterRequestData(resp, searchModel);

        } else {
            let respLength = resp.Rows ? resp.Rows : resp.Data.length;
            let data = this.prepareData(resp.Data, respLength);
            // this.originalPreparedData = data;
            if ((<WorkOrdersComponent>this.componentContext).refreshStarted) {
                this.selectedRows = this.getSlick().getSelectedRows();
                this.setSelectedRows(this.selectedRows);
            }
            this.updateData(this.selectedRows, data);
            this.onGridRowsUpdated.emit(resp);
            (<WorkOrdersComponent>this.componentContext).refreshStarted = false;
        }

        // if (this.isGridExpanded) {
        //     this.setAllExpanded(true);
        // } else if (this.expandedRows[this.PagerProvider.getCurrentPage()] && this.expandedRows[this.PagerProvider.getCurrentPage()].length > 0) {
        //     // let expandedItems = this.expandedRows.map((row:{id: number|string, page:number}) => {
        //     //     if(row.page == this.PagerProvider.getCurrentPage()){
        //     //         return this.getDataView().getItemById(row.id);
        //     //     }
        //     // });
        //
        //     $.each(this.expandedRows[this.PagerProvider.getCurrentPage()], (k, id) => {
        //         let row = this.getDataView().getItemById(id);
        //         this.expandExpandableRow(row, false);
        //         // debugger
        //     });
        //     // this.expandByItems(expandedItems)
        // }
    }

    resetChecksInSubRow($event) {
        let btnEl = $($event.target);
        let subId = btnEl.parents('.workOrdersSettingsPopup').data('childid');
        let id = btnEl.parents('.workOrdersSettingsPopup').data('parentid');

        this.workOrdersService.ResetChecks(subId).subscribe((res: any) => {
            this.notificationService.notifyShow(1, 'work_orders.table.dropdown.reset_checks.success');
            this.refreshGridLazy(id);
        }, (err: HttpErrorResponse) => {
            this.notificationService.notifyShow(2, this.translate.instant(
                'work_orders.table.dropdown.reset_checks.error',
                {errMessage: err.error.Message}
            ));
        });
    }


    public onClickByExpandRow(item, i) {
        this.selectedSubRow = {id: item.id, index: i};
        this.getSlick().render();
    }

    public getSelectedSubRow() {
        return this.selectedSubRow;
    }

    public navigateToPage(wo, i) {
        return false;
    }

    public lookupDynamicContent(item: SlickGridExpandableRowData): void {
        if (item._collapsed == true) {
            if (!this.expandedRows.length && this.isGridExpanded === true) {
                this.clearItem(item);
            } else {
                let index = this.expandedRows[this.PagerProvider.getCurrentPage()].indexOf(item.id);
                if (index > -1) {
                    this.expandedRows[this.PagerProvider.getCurrentPage()].splice(index, 1);
                }
            }
            return;
        } else {
            if (!this.expandedRows[this.PagerProvider.getCurrentPage()]) {
                this.expandedRows[this.PagerProvider.getCurrentPage()] = [];
            }
            if (this.expandedRows[this.PagerProvider.getCurrentPage()].indexOf(item.id) == -1) {
                this.expandedRows[this.PagerProvider.getCurrentPage()].push(item.id);
            }
        }
        let content = [];
        if (!item.Items) {
            return;
        }
        let contentCount = (item.Items.length);
        content.push('<div class="expanded-row-detail-' + item.id + '">Loading...</div>');
        item._detailContent = content.join("");
        let rowHeight = this.getSlick().getOptions().rowHeight;
        let lineHeight = 24; //we know cuz we wrote the custom css init ;)
        item._sizePadding = Math.ceil(((contentCount * lineHeight) / rowHeight) + 1); // + 1 cuz we are added additional row as caption of subrows
        item._height = (item._sizePadding * rowHeight);
    }

    public createDetailComponent(item): void {
        // let self = this;
        // prepare ang module for render
        let factory = this.compFactoryResolver.resolveComponentFactory(WorkOrdersExpandRowComponent);
        let resolvedInputs = ReflectiveInjector.resolve([{
            provide: 'data', useValue: {
                data: <SlickGridInsideExpandRowFormatterData>{
                    item: item,
                    provider: this
                }
            }
        }]);
        let injector = ReflectiveInjector.fromResolvedProviders(
            resolvedInputs
        );
        let componentRef = factory.create(injector);

        let el: any = $(this.getGridEl().nativeElement).find('div.expanded-row-detail-' + item.id);
        if (el) {
            this.baseProvider.insertComponentIntoView(this.moduleContext.vcRef, componentRef, el);
        }
    }

    clearItem(item) {
        item._collapsed = true;
        item._sizePadding = 0;     //the required number of padding rows
        item._height = 0;     //the actual height in pixels of the detail field
        item._isPadding = false;
        delete item._detailContent;
        return item;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    refreshGridLazy(id?: number) {
        if (this.lastSearchModel) {
            this.buildPageLazy(id);
            (<any>this.componentContext).refreshStarted = true;
        }
    }

    buildPageLazy(id?: number) {
        let itemId;
        let searchModel: SearchModel = new SearchModel();
        // if (!resetSearch) {

        if((id !== null) && (id !== undefined)) {
            itemId = id;
        } else {
            let selectedRows = this.getSlick().getSelectedRows();
            if (selectedRows && selectedRows.length > 0) {
                let selectedItem = this.getDataView().getItemById(selectedRows[0]);
                itemId = selectedItem.ID;
            }
        }

        if (itemId) {
            let asm_id = new AdvancedSearchModel();

            asm_id.setDBField('ID');
            asm_id.setField('Id');
            asm_id.setOperation('=');
            asm_id.setValue(itemId);
            if (!searchModel.hasAdvancedItem(asm_id)) {
                searchModel.addAdvancedItem(asm_id);
            }
        }



        // }

        this._buildPageRequestLazy(searchModel);
    }

    private _buildPageRequestLazy(searchModel: SearchModel) {
        // this.isBusyGrid = true;
        this.onGridStartSearch.emit();

        this.service.search(
            this.config.options.searchType,
            searchModel,
            1,
            '',
            'desc'
        ).subscribe(
            (resp: SlickGridResp) => {
                this.afterRequestDataLazy(resp, searchModel);
            }, (err) => {
                // this.isBusyGrid = false;
                this.onGridEndSearch.emit(false);

            }, () => {
                // this.isBusyGrid = false;
                this.onGridEndSearch.emit(true);
                // this.searchFormProvider && this.searchFormProvider.unlockForm();
            });
    }

    afterRequestDataLazy(resp, searchModel) {
        // console.log('WF_afterRequestData_Lazy');
        let rowsToUpdate = this.getRowsToUpdateByIds(resp.Data.map(el => el.ID));
        let mergedRespData = this.getMergeOriginalData(resp.Data);
        // let respLength = Object.keys(mergedRespData).length;
        this.setOriginalData(mergedRespData);
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);
        // }

        let data = this.getMergeDataviewData(resp.Data);
        this.updateData(rowsToUpdate, data);
        // this.onGridRowsUpdated.emit(resp);
        (<WorkflowComponent>this.componentContext).refreshStarted = false;
    }
}
