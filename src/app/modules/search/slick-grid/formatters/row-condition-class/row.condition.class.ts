import {SlickGridColumn, SlickGridExpandableRowData} from "../../types";

export function RowConditionClassFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridExpandableRowData) {
    if(dataContext[columnDef.__deps.data.conditionField] == columnDef.__deps.data.conditionValue) {
        new Promise((resolve, reject) => {
            resolve();
        }).then(
            () => {
                const element: HTMLElement = columnDef.__contexts.provider.getSlick().getCellNode(rowNumber, cellNumber);
                const parent = $(element).parent();
                if(!$(parent).hasClass(columnDef.__deps.data.conditionClass)) {
                    $(parent).addClass(columnDef.__deps.data.conditionClass);
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }
    return '<span></span>';
}
