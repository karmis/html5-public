import { Inject, Injectable, Injector } from '@angular/core';
import { SearchModel } from '../../../../../../models/search/common/search';
import { SlickGridEventData, SlickGridResp } from '../../../../slick-grid/types';
import { AdvancedSearchModel } from '../../../../../../models/search/common/advanced.search';
import { WorkflowComponent } from '../../../../../../views/workflow/workflow.component';
import { Observable, Subscription } from 'rxjs';
import { ProductionService } from '../../../../../../services/production/production.service';
import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';

@Injectable()
export class BottomSlickGridProvider extends SlickGridProvider {
    selectedSubRow?: { id?: number, index?: number } = {};
    productionService: ProductionService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.productionService = injector.get(ProductionService);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
    }

    productionClone() {
        let data = this.getSelectedRowData();
        // console.log(data); !--
    }

    deleteFromServer(data): Observable<Subscription> {
        return new Observable(obs => {
            // console.log(data); !--
            obs.next();
            obs.complete();
            })
    }

    private updateTable(message) {
        this._buildPageRequestLazy(new SearchModel(), message);
        (this.componentContext as any).refreshStarted = true;
    }


    private refreshGridLazy(ids: number[] = [], message) {
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

    private getSelectedSubRow() {
        return this.selectedSubRow;
    }

    private _buildPageRequestLazy(searchModel: SearchModel, message) {
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

    private afterRequestDataLazy(resp, searchModel, message = null) {
        this.selectedRows = this.getSlick().getSelectedRows();
        this.setSelectedRows(this.selectedRows);

        this.selectedRows.forEach((indexRow, i) => {
            resp.Data[i].Id = indexRow;
            this.getDataView().changeItem(indexRow, resp.Data[i]);
        });

        const data = this.getMergeDataviewData([]);
        this.setOriginalData(data);
        this.updateData(this.selectedRows, data);
        (this.componentContext as WorkflowComponent).refreshStarted = false;
        if (message) {
            this.notificationService.notifyShow(message.type, message.message, message.autoClose);
        }
    }
}
