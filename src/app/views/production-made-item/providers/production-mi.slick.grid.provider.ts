/**
 * Created by Sergey Trizna on 27.12.2017.
 */
import { Router } from "@angular/router";
import { BasketService } from "../../../services/basket/basket.service";
import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injector } from "@angular/core";
import { SlickGridEventData, SlickGridResp } from "../../../modules/search/slick-grid/types";
import { NotificationService } from "../../../modules/notification/services/notification.service";
import { IMFXModalComponent } from "../../../modules/imfx-modal/imfx-modal";
import { IMFXModalProvider } from "../../../modules/imfx-modal/proivders/provider";
import { WorkflowListComponent } from '../../workflow/comps/wf.list.comp/wf.list.comp';
import { HttpService } from '../../../services/http/http.service';
import { lazyModules } from "../../../app.routes";
import { NativeNavigatorProvider } from '../../../providers/common/native.navigator.provider';
import { SearchModel } from "../../../models/search/common/search";
import { AdvancedSearchModel } from "../../../models/search/common/advanced.search";
import { WorkflowComponent } from "../../workflow/workflow.component";
import { ProductionSlickGridProvider } from '../../production/providers/production.slick.grid.provider';
import { ProductionService } from '../../../services/production/production.service';
import { ProductionTypeDetail } from '../../production/constants/production.types';
import { appRouter } from '../../../constants/appRouter';


export class ProductionMiSlickGridProvider extends ProductionSlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public basketService: BasketService;
    public modalProvider: IMFXModalProvider;
    selectedSubRow?: { id?: number, index?: number } = {};
    public isMedia = true;
    public refreshStarted;
    public httpService: HttpService;
    public nativeNavigatorProvider: NativeNavigatorProvider;

    constructor(@Inject(Injector) public injector: Injector,
                public productionService: ProductionService,
                public notificationService: NotificationService) {
        super(injector, productionService);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.httpService = injector.get(HttpService);
        this.nativeNavigatorProvider = injector.get(NativeNavigatorProvider);
        // this.notificationService = injector.get(NotificationService);
    }


    afterRequestData(resp, searchModel) {
        if (!this.refreshStarted) {
            super.afterRequestData(resp, searchModel);

        } else {
            let respLength = resp.Rows ? resp.Rows : resp.Data.length;
            let data = this.prepareData(resp.Data, respLength);
            // this.originalPreparedData = data;
            this.updateData(null, data);
            if (this.refreshStarted) {
            }
            this.refreshStarted = false;
        }
    }

    activeWorkflows(): void {
        let data = this.getSelectedRowData();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.wf_list,
            WorkflowListComponent, {
                title: 'misr.wf_list',
                size: 'xl',
                position: 'center',
                footer: 'close'
            });

        modal.load().then((modal: ComponentRef<WorkflowListComponent>) => {
            let modalContent: WorkflowListComponent = modal.instance;
            modalContent.loadData([data.ID]);
        });

    }

    refreshGridLazy(ids: number[] = [], message = false) {
        let updateIds,
            searchModel: SearchModel = new SearchModel();

        if (Array.isArray(ids) && ids.length != 0) {
            updateIds = ids;
        } else {
            if (this.getSelectedRows().length) {
                updateIds = this.getSelectedRows().map((e) => e.ID);
            } else if (this.getSelectedSubRow() && this.getSelectedSubRow().hasOwnProperty('id')) {
                updateIds = [this.getDataView().getItemById(this.getSelectedSubRow().id).ID];
            }

        }

        if (updateIds && updateIds.length > 0) {
            const asm_id = new AdvancedSearchModel();

            asm_id.setDBField('ID');
            asm_id.setField('Id');
            asm_id.setOperation('=');
            asm_id.setValue(updateIds.join('|'));
            asm_id.setGroupId(searchModel.getNextAvailableGroupId());
            if (!searchModel.hasAdvancedItem(asm_id)) {
                searchModel.addAdvancedItem(asm_id);
            }

        }

        this._buildPageRequestLazy(searchModel, message);
        (this.componentContext as any).refreshStarted = true;
    }

    isEnabledRetryTransfer(): boolean {
        return false
    }

    retryTransfer() {
        console.log('coming soon');
    }

    public _buildPageRequestLazy(searchModel: SearchModel, message = false) {
        this.onGridStartSearch.emit();

        this.service.search(
            this.config.options.searchType,
            searchModel,
            1,
            '',
            'desc'
        ).subscribe(
            (resp: SlickGridResp) => {
                this.afterRequestDataLazy(resp, searchModel, message);
            }, (err) => {
                this.onGridEndSearch.emit(false);

            }, () => {
                this.onGridEndSearch.emit(true);
            });
    }

    public afterRequestDataLazy(resp, searchModel, message = true) {
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);

        this.selectedRows.forEach((indexRow, i) => {
            resp.Data[i].id = indexRow;
            this.getDataView().changeItem(indexRow, resp.Data[i]);
        });

        const data = this.getMergeDataviewData([]);
        this.setOriginalData(data);
        this.updateData(this.selectedRows, data);
        (this.componentContext as WorkflowComponent).refreshStarted = false;
        if (message)
            this.notificationService.notifyShow(1, "saved.save_change_custom_status", true, 1200);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type && data && (data.row as any)) {
            const productionTypeDetail: ProductionTypeDetail = 'production-search';
            this.router.navigate([
                appRouter.production.prod_detail.split('/')[0],
                productionTypeDetail,
                (data.row as any).Production.ID
            ]);
        }
    }
}
