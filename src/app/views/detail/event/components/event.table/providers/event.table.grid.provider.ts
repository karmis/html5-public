import { SlickGridProvider } from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { Inject, Injector } from "@angular/core";
import { Observable } from "rxjs";
import {
    SlickGridEventData,
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../../../../../modules/search/slick-grid/types";
import {SearchModel} from "../../../../../../models/search/common/search";
import {AdvancedSearchModel} from "../../../../../../models/search/common/advanced.search";

export class EventTableGridProvider extends SlickGridProvider {

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
        return Observable.create((observer) => {
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
}
