import { SlickGridProvider } from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { Inject, Injector } from "@angular/core";
import { NotificationService } from "../../../../../../modules/notification/services/notification.service";
import { Observable } from "rxjs";
import {
    SlickGridEventData,
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../../../../../modules/search/slick-grid/types";
import {SearchModel} from "../../../../../../models/search/common/search";
import {AdvancedSearchModel} from "../../../../../../models/search/common/advanced.search";

export class MultiEventTableGridProvider extends SlickGridProvider {

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    onRowDoubleClicked() {
        console.log('ss');
    }

    onRowChanged(_data?: SlickGridEventData): any {
        let data = _data;
        // if (!_data) {
        //     data = this.lastData;
        // }
        if (!data) {
            return;
        }
        this.config.componentContext.onSelectSub.next(data);
        // this.lastData = data;
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).parent().parent().parent().hasClass('selected') ||
            $(event.target).parent().parent().hasClass('selected');
    }


    onClickTimeEdit() {
        console.log(this.getDataView());
        // this.setDefaultColumns()
    }

    getSelectedRow(): SlickGridRowData | SlickGridTreeRowData {
        if (this.getSlick()) {
            const rowIds: number[] = this.getSlick().getSelectedRows();
            if (rowIds && rowIds.length > 0) {
                return this.getDataView().getItem(rowIds[0]);
            }
        }
        else {
            return null
        }
    }

    getVersionById(id: number): Observable<any> {
        return new Observable((observer) => {
            const searchModel = new SearchModel();
            const asm_id = new AdvancedSearchModel();

            asm_id.setDBField('ID');
            asm_id.setField('Id');
            asm_id.setOperation('=');
            asm_id.setValue(id);
            asm_id.setGroupId(searchModel.getNextAvailableGroupId());
            if (!searchModel.hasAdvancedItem(asm_id)) {
                searchModel.addAdvancedItem(asm_id);
            }

            return this.service.search(
                this.config.options.searchType,
                searchModel,
                undefined,
                undefined,
                undefined
            ).subscribe((res:any) => {
                observer.next(res);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }

    getId(row: SlickGridRowData) {
        return <number>row[this.getIdField()];
    }

    getIdField() {
        return 'VERSION_ID';
    }

    // deleteRow(data, _id: number = null) {
    //     let dd = this.slick.getData();
    //     let currentRow = this.slick.getRowById(_id).row;
    //     dd.splice(currentRow,1);
    //     let interRow = currentRow.id
    //     while (currentRow.id < dd.length){
    //         this.slick.invalidateRow(interRow);
    //         interRow++;
    //     }
    //     this.slick.updateRowCount();
    //     this.slick.render();
    //     this.slick.scrollRowIntoView(currentRow-1)
    //     // dd.splice(current_row,1);
    //     // const idToRemove = data.data.rowNumber;
    //     // this.dataView.deleteItem(idToRemove);
    //     // this.slick.invalidateAllRows();
    //     // this.slick.updateRowCount();
    //     // this.slick.render();
    //     // this.onRowDelete.emit(data.data.data);
    // }
}
