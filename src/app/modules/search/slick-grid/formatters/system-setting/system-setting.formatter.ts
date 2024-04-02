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
    selector: 'system-setting-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SystemSettingFormatterComp {
    public injectedData: any;
    private data: any;
    private value: any;
    private checkbox = false;

    constructor(private injector: Injector, private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.data = this.injectedData.data.data;
    }

    ngOnInit() {
        this.checkbox = this.data.ValueType == "CheckBox";
        this.value = this.data.Value;
    }

    ngAfterViewInit() {

    }
}

export function SystemSettingFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(SystemSettingFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



