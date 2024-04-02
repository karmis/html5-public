import {ChangeDetectionStrategy, Component, Injector, Input, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData} from "../../types";
import {commonFormatter} from "../common.formatter";

@Component({
    selector: 'report-status-formatter-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportStatusFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private status: string = 'off';

    @Input('params') set setParams(params) {
        this.params = $.extend(true, this.params, params);
    }

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }
}

export function ReportStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    return commonFormatter(ReportStatusFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}


