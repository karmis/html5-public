/**
 * Created by Sergey Trizna on 27.12.2017.
 */
import {SlickGridProvider} from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import {Router} from "@angular/router";
import {BasketService} from "../../../services/basket/basket.service";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {
    SlickGridEventData,
    SlickGridResp
} from "../../../modules/search/slick-grid/types";
import {appRouter} from "../../../constants/appRouter";
import {IMFXModalProvider} from "../../../modules/imfx-modal/proivders/provider";
import {HttpService} from '../../../services/http/http.service';
import {NativeNavigatorProvider} from '../../../providers/common/native.navigator.provider';
import { ProductionService } from '../../../services/production/production.service';
import { SearchModel } from '../../../models/search/common/search';
import { AdvancedSearchModel } from '../../../models/search/common/advanced.search';
import { WorkflowComponent } from '../../workflow/workflow.component';
import { Observable, Subscription } from 'rxjs';
import { ProductionTypeDetail } from '../constants/production.types';
import { IMFXModalComponent } from "../../../modules/imfx-modal/imfx-modal";
import { lazyModules } from "../../../app.routes";
import { IMFXModalAlertComponent } from "../../../modules/imfx-modal/comps/alert/alert";
import { IMFXModalEvent } from "../../../modules/imfx-modal/types";

export class ProductionSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public basketService: BasketService;
    public refreshStarted;
    public modalProvider: IMFXModalProvider;
    public httpService: HttpService;
    public nativeNavigatorProvider: NativeNavigatorProvider;
    selectedSubRow?: { id?: number, index?: number } = {};

    constructor(@Inject(Injector) public injector: Injector,
                public productionService: ProductionService) {
        super(injector);
        this.router = injector.get(Router);
        this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.modalProvider = injector.get(IMFXModalProvider);
        this.httpService = injector.get(HttpService);
        this.nativeNavigatorProvider = injector.get(NativeNavigatorProvider);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type && data && (data.row as any)) {
            const productionTypeDetail: ProductionTypeDetail = 'production-search';
            this.router.navigate([
                appRouter.production.prod_detail.split('/')[0],
                productionTypeDetail,
                (data.row as any).ID
            ]);
        }
    }

    productionClone() {
        const data = this.getSelectedRowData();
        const productionTypeDetail: ProductionTypeDetail = 'clone';
        this.router.navigate([
            appRouter.production.clone.split('/')[0],
            productionTypeDetail,
            data.ID
        ]);
    }

    productionDelete() {
        const rowsData = this.getSelectedRowsData();

        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'sm',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });

        modal.load().then(cr => {
            const modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'production.modal_remove_conformation',
                {textParam: ''}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.deleteFromServer(rowsData[0].ID).subscribe(() => {
                         rowsData.forEach((row) => {
                            this.deleteRow({data: {data: row}});
                        });
                        this.setSelectedRow(0);
                        this.notificationService.notifyShow(1, 'workflow.remove_success');
                        modal.hide();
                    }, (err) => {
                        this.notificationService.notifyShow(2, err.error.Error);
                    }, () => {

                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });

        })
    }

    deleteFromServer(id): Observable<Subscription> {
        return this.productionService.removeProduction(id);
    }

    refreshGridLazy(ids: number[] = []) {
        if (!this.lastSearchModel) {
            return;
        }

        const param = Array.isArray(ids)
            ? ids
            : (isNaN(ids - 0) || !(ids - 0))
                ? []
                : [ids];
        this.buildPageLazy(param);
        (this.componentContext as any).refreshStarted = true;
    }

    buildPageLazy(ids: number[]) {
        let updateIds,
            searchModel: SearchModel = new SearchModel();

        if (Array.isArray(ids) && ids.length != 0) {
            updateIds = ids;
        } else {
            const subRow = this.getSelectedSubRow();
            const selRows = this.getSelectedRows();

            if (selRows.length) {
                updateIds = selRows.map((e) => e.ID);
            } else if (subRow && subRow.hasOwnProperty('id')) {
                updateIds = [this.getDataView().getItemById(subRow.id).ID];
            }
        }

        if (updateIds && updateIds.length > 0) {
            for (const item of updateIds) {
                const asm_id = new AdvancedSearchModel();

                asm_id.setDBField('ID');
                asm_id.setField('Id');
                asm_id.setOperation('=');
                asm_id.setValue(item);
                asm_id.setGroupId(searchModel.getNextAvailableGroupId());
                if (!searchModel.hasAdvancedItem(asm_id)) {
                    searchModel.addAdvancedItem(asm_id);
                }
            }
        }

        this._buildPageRequestLazy(searchModel);
    }

    public getSelectedSubRow() {
        return this.selectedSubRow;
    }

    public _buildPageRequestLazy(searchModel: SearchModel) {
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
                this.onGridEndSearch.emit(false);

            }, () => {
                this.onGridEndSearch.emit(true);
            });
    }


    public afterRequestDataLazy(resp, searchModel) {
        const mergedRespData = this.getMergeOriginalData(resp.Data);

        this.setOriginalData(mergedRespData);
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);


        const refreshIds = searchModel.getAdvanced()
            .filter((e) => e.getDBField() == 'ID' && e.getOperation() == '=')
            .map((e) => e._value);

        const md = (this.getData() as any[]).map((e) => e.ID - 0);
        const refreshIndexes = refreshIds.map((e) => (md.indexOf(e - 0)));

        const data = this.getMergeDataviewData(resp.Data);
        // this.updateData(this.selectedRows, data);
        this.updateData(refreshIndexes, data);
        // this.onGridRowsUpdated.emit(resp);
        (this.componentContext as WorkflowComponent).refreshStarted = false;
    }
}
