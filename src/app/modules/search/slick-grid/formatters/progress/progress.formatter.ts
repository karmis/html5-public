import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";

@Component({
    selector: 'progress-formatter-comp',
    templateUrl: './tpl/index.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ProgressFormatterComp {
    private params;
    private progress;
    public injectedData: SlickGridFormatterData;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.progress = this.params.data.Progress;
    }
}

export function ProgressFormatter(rowNumber: number,
                                  cellNumber: number,
                                  value: any,
                                  columnDef: SlickGridColumn,
                                  dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(ProgressFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



