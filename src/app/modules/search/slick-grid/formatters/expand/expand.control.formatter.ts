/**
 * Created by Sergey Trizna on 07.12.2017.
 */
import {SlickGridColumn, SlickGridExpandableRowData} from "../../types";
import {SlickGridProvider} from "../../providers/slick.grid.provider";

export function ExpandControlFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridExpandableRowData) {
    let ctx = columnDef.__contexts;
    let provider: SlickGridProvider = ctx.provider;

    new Promise((resolve, reject) => {
        resolve();
    }).then(
        () => {
            let element: HTMLElement = ctx.provider.getSlick().getCellNode(rowNumber, cellNumber);
            $(element).addClass('skipSelection');
        });
    if(!dataContext._disabled) {
        if (dataContext._isPadding == true) {
        } //render nothing
        else if (dataContext._collapsed) {
            return "<div class='slickgrid-toggle-expandable dd-not-upload skipSelection'></div><i class='skipSelection  dd-not-upload slickgrid-toggle-expandable icons-right icon'></i>"
        } else {
            let html = [];
            html.push("<div class='slickgrid-toggle-expandable dd-not-upload skipSelection'></div><i class='skipSelection  dd-not-upload slickgrid-toggle-expandable icons-down icon'></i>");
            return html.join("");
        }
    }
}
