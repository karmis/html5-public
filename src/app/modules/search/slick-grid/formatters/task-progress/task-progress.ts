import {ChangeDetectionStrategy, Component, Injector, Input, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData} from "../../types";
import {commonFormatter} from "../common.formatter";

@Component({
    selector: 'task-progress-formatter-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskProgressFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private task;

    @Input('params') set setParams(params) {
        this.params = $.extend(true, this.params, params);
    }

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.task = this.params.data
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }
}

export function TaskProgressFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    if (!(<SlickGridExpandableRowData>dataContext)._isPadding) {
        return commonFormatter(TaskProgressFormatterComp, {
            rowNumber: rowNumber,
            cellNumber: cellNumber,
            value: value,
            columnDef: columnDef,
            data: dataContext
        });
    }
    // if ((<SlickGridExpandableRowData>dataContext)._detailContent) {
    //
    // }
}


