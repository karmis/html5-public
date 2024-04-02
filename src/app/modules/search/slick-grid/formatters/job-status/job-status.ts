import {ChangeDetectionStrategy, Component, Injector, Input, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData} from "../../types";
import { JobStatuses } from "../../../../../views/workflow/constants/job.statuses";
import {commonFormatter} from "../common.formatter";

@Component({
    selector: 'job-status-formatter-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobStatusFormatterComp {
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

    ngOnInit() {
        this.setStatus(this.params.value);
    }

    ngAfterViewInit() {
    }

    private setStatus(status: string) {
        switch (this.params.data.CMB_STAT) {
                case JobStatuses.READY:
                case JobStatuses.COMPLETED:
                case JobStatuses.INPROG:
                    this.status = 'on';
                    break;
                case JobStatuses.ABORT:
                case JobStatuses.FAILED:
                    this.status = 'off';
                    break;
                default:
                    this.status = '';
            }
            return

    }
}

export function JobStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    if(!(<SlickGridExpandableRowData>dataContext)._isPadding){
        return commonFormatter(JobStatusFormatterComp, {
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


