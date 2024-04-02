import {ChangeDetectionStrategy, Component, Injector, Input, ViewEncapsulation} from "@angular/core";
import {JobStatuses} from "../../../../../views/workflow/constants/job.statuses";
import {StatusFormatterComp} from "../../../../modules/search/slick-grid/formatters/status/status.formatter";
import {
    SlickGridTreeRowData,
    SlickGridRowData,
    SlickGridColumn,
    SlickGridFormatterData
} from "../../../../modules/search/slick-grid/types";
import {commonFormatter} from "../../../../modules/search/slick-grid/formatters/common.formatter";

@Component({
    selector: 'cm-status-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CacheManagerStatusComp {
    public injectedData: SlickGridFormatterData;
    private device = null;
    private status: string = 'off';
    private statusText: string = '';
    private params;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    @Input('device') set setParams(device) {
        this.device = device
    }

    ngOnInit() {
        if (this.device != null) {
            this.setStatus(this.device.STATUS);
        } else {
            this.setStatus(this.params.data.STATUS);
        }
    }

    ngAfterViewInit() {
    }

    private setStatus(status: number) {
        if (status == 1 || status == -3) {
            this.status = 'orange'
        } else if (status == 2) {
            this.status = 'on';
        } else {
            this.status = 'off';
        }

        switch (status) {
            case 0:
                this.statusText = "Missing";
                break;
            case 1:
                this.statusText = "Transferring";
                break;
            case 2:
                this.statusText = "Ready";
                break;
            case -1:
                this.statusText = "Source devices not setup";
                break;
            case -2:
                this.statusText = "Source not found";
                break;
            case -3:
                this.statusText = "Too Early";
                break;
            case -4:
                this.statusText = "In Hiatus";
                break;
            case -5:
                this.statusText = "Job Failure";
                break;
            case -6:
                this.statusText = "Job done/No Media";
                break;
        }

        if(this.params.data != undefined && this.params.data._collapsed != undefined) {
            let row = null;
            if(this.device != null) {
                row = this.params.item;
            } else {
                row = this.params.data
            }
            if (row.FORCE_FLAG == 1) {
                this.statusText += " [Forcing]";
            }
        }

    }
}

export function CacheManagerStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(CacheManagerStatusComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}

