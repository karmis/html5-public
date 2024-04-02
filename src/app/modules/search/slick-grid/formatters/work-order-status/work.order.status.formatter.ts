import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    Input,
    ViewEncapsulation
} from "@angular/core";
import {SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import { WorkOrdersStatuses } from '../../../../../views/work-orders/constants/work.orders.statuses';

@Component({
    selector: 'work-order-status-formatter-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderStatusFormatterComp {
    private params;
    protected item;
    public injectedData: SlickGridFormatterData;
    // private status: string = 'off';

    @Input('params') set setParams(params) {
        this.params = $.extend(true, this.params, params);
    }

    constructor(private injector: Injector
                , private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.item = this.params.data;
    }

    ngOnInit() {
        // this.setStatus(this.params.value);
    }

    ngAfterViewInit() {
    }


    // private setStatus(status: string) {
    //     switch (this.item.TSK_STATUS) {
    //         case WorkOrdersStatuses.Unknown:
    //             this.status = 'off';
    //             break;
    //         case WorkOrdersStatuses.NO_MEDIA:
    //             this.status = 'off';
    //             break;
    //         case WorkOrdersStatuses.MEDIA_WRONG_LOC:
    //             this.status = 'off';
    //             break;
    //         case WorkOrdersStatuses.MEDIA_CORR_LOC:
    //             this.status = 'on';
    //             break;
    //         case WorkOrdersStatuses.IN_PROG:
    //             this.status = 'on';
    //             break;
    //         case WorkOrdersStatuses.COMPLETE:
    //             this.status = 'on';
    //             break;
    //         case WorkOrdersStatuses.PROBLEM:
    //             this.status = 'off';
    //             break;
    //         default:
    //             this.status = '';
    //     }
    // }
}

export function WorkOrderStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    if(!(<SlickGridExpandableRowData>dataContext)._isPadding){
        return commonFormatter(WorkOrderStatusFormatterComp, {
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


