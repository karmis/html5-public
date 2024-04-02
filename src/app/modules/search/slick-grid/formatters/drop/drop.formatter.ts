/**
 * Created by Sergey Trizna on 9.12.2017.
 */
import {SlickGridColumn, SlickGridExpandableRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {DropFormatterComp} from "./drop.comp";

export function DropFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridExpandableRowData) {
    let provider = columnDef.__contexts.provider;
    let el = provider.getSlick().getCellNode(rowNumber, cellNumber);
    if (!el || (<any>el).length == 0) {
        return commonFormatter(DropFormatterComp, {
            rowNumber: rowNumber,
            cellNumber: cellNumber,
            value: value,
            columnDef: columnDef,
            data: dataContext
        });
    }
}



