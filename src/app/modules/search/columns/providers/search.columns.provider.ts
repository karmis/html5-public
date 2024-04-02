/**
 * Created by Sergey Klimenko on 08.03.2017.
 */
import {EventEmitter, Injectable} from "@angular/core";
import {Observable,  Subscription } from "rxjs";
import {SearchColumnsConfig} from "../search.columns.config";

@Injectable()
export class SearchColumnsProvider {
    config: SearchColumnsConfig;
    data: any;
    onShowModal: EventEmitter<any> = new EventEmitter<any>();

    columns = [];
    _columns;
    selectedAll = false;

    public setCheckbox(event, col): Observable<Subscription> {
        return new Observable((observer: any) => {
            // let $inputElement = $(event.target.parentElement).find('input');
            // let input = $inputElement[0];
            // let check = (<HTMLInputElement>input).checked;
            // if (event.target.checked || ((event.target.className == 'modal-col') && !check)) {
            //     let index = this.config.options.colApi.getAllDisplayedColumns().length;
            //     this.config.options.colApi.moveColumn(col.field, index);
            //     this.config.options.colApi.setColumnVisible(col.field, true);
            // } else {
            //     let index = this.config.options.colApi.getAllColumns().length;
            //     this.config.options.colApi.setColumnVisible(col.field, false);
            //     this.config.options.colApi.moveColumn(col.field, index - 1);
            // }
            // this.config.componentContext.searchGridConfig.options.onSelectedCloumnInModal &&
            // this.config.componentContext.searchGridConfig.options.onSelectedCloumnInModal.emit(
            //     {
            //         column: col.field,
            //         action: event.target.checked ? 'add' : 'delete'
            //     });
            observer.complete();
        });
    }

    public selectAll(): Observable<Subscription> {
        return new Observable((observer: any) => {
            // this.selectedAll = !this.selectedAll;
            // let hiddenColumnsNames = [];
            // if (this.selectedAll) {
            //     let hiddenColumns = this.config.options.colApi.getAllColumns().filter(function (el) {
            //         return !el.visible && !el.pinned
            //     }).sort(function (a, b) {
            //         if (a.colDef.headerName < b.colDef.headerName)
            //             return -1;
            //         if (a.colDef.headerName > b.colDef.headerName)
            //             return 1;
            //         return 0;
            //     });
            //     hiddenColumns.forEach(function (el) {
            //         hiddenColumnsNames.push(el.colId);
            //     });
            //     let index = this.config.options.colApi.getAllDisplayedColumns().length;
            //     this.config.options.colApi.moveColumns(hiddenColumnsNames, index);
            //     this.config.options.colApi.setColumnsVisible(hiddenColumnsNames, true);
            // }
            // else {
            //     this.config.options.colApi.getAllColumns().filter(function (el) {
            //         return el.colDef.$$id > -2 && !el.pinned;
            //     }).forEach(function (el) {
            //         hiddenColumnsNames.push(el.colId);
            //     });
            //     this.config.options.colApi.setColumnsVisible(hiddenColumnsNames, false);
            //
            // }
            // this.config.componentContext.searchGridConfig.options.onSelectedCloumnInModal &&
            // this.config.componentContext.searchGridConfig.options.onSelectedCloumnInModal.emit(
            //     {
            //         columns: hiddenColumnsNames,
            //         action: this.selectedAll ? 'all' : 'none'
            //     });
            observer.complete();
        });
    }
}
