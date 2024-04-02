import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewEncapsulation
} from "@angular/core";
import {
    SlickGridColumn,
    SlickGridFormatterData,
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../types";
import { commonFormatter } from "../common.formatter";


@Component({
    selector: 'queues-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class QueuesFormatterComp {
    public injectedData: any;
    private data: SlickGridFormatterData;

    constructor(private injector: Injector, private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.data = this.injectedData.data.data.Queues;
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }
}

export function QueuesFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(QueuesFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



