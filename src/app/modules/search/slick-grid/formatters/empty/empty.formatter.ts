/**
 * Created by Sergey Trizna on 16.01.2018.
 */
import {SlickGridColumn, SlickGridExpandableRowData} from "../../types";

export function EmptyFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridExpandableRowData) {
    let ctx = columnDef.__contexts;
    new Promise((resolve, reject) => {
        resolve();
    }).then(
        () => {
            let element: HTMLElement = ctx.provider.getSlick().getCellNode(rowNumber, cellNumber);
            $(element).addClass('skipSelection');
        });

    return '<div style="width: 0px; height: 0px; display: none;visibility: hidden; opacity: 1"></div>';
}

