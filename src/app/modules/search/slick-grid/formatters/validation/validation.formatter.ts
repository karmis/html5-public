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
import { SlickGridProvider } from '../../providers/slick.grid.provider';


@Component({
    selector: 'validation-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ValidationFormatterComp {
    public injectedData: any;
    private params: SlickGridFormatterData;
    protected isActive: boolean = false;
    private provider: SlickGridProvider;

    constructor(private injector: Injector, private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.provider = this.injectedData.data.columnDef.__contexts.provider;
        this.params = this.injectedData.data;
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }
}

export function ValidationFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(ValidationFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



