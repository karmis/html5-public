import {SlickGridColumn, SlickGridExpandableRowData} from "../../types";

export function HiddenContentFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridExpandableRowData) {
    if ( value == 0 ) {
        return '<span style="visibility: hidden;">' + value + '</span>';
    } else {
        return value;
    }
}
