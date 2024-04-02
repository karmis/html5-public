/**
 * Created by Sergey Trizna on 9.12.2017.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation } from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import { JobStatuses, JobTextStatuses } from '../../../../../views/workflow/constants/job.statuses';

@Component({
    selector: 'status-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class StatusFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private status: string;

    constructor(private injector: Injector
                , private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        this.setStatus(this.params.value);
    }

    ngAfterViewInit() {
    }

    private setStatus(status: string) {
        if ( typeof status === 'number') {
            for (let key in JobStatuses) {
               if (JobStatuses[key] === status) {
                   status = JobTextStatuses[key];
                   this.params.value = JobTextStatuses[key];
               }
            }
        }

        if (!status) {
            this.status = "";
            return;
        } else {
            if (status.toLowerCase().indexOf("in") + 1) {
                this.status = "on";
            }
            if (status.toLowerCase().indexOf("out") + 1) {
                this.status = "off";
            }
            if (status.toLowerCase().indexOf("failed") + 1) {
                this.status = "off";
            }
            if (status.toLowerCase().indexOf("error") + 1) {
                this.status = "off";
            }
            if (status.toLowerCase().indexOf("ready") + 1) {
                this.status = "on";
            }
            if (status.toLowerCase().indexOf("not in") + 1 || status.toLowerCase().indexOf("no media") + 1) {
                this.status = "off";
            }
            if (status.toLowerCase().indexOf("missing") + 1) {
                this.status = "";
            }
        }
    }
}

export function StatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(StatusFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



