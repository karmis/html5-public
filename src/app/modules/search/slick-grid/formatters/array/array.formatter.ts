import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation } from "@angular/core";
import { SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData } from "../../types";
import { commonFormatter } from "../common.formatter";

@Component({
    selector: 'array-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ArrayFormatterComp {
    public injectedData: SlickGridFormatterData;
    private params;
    private deps;
    private str: string = "";
    private mapFn: (data) => string;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.deps = this.params.columnDef.__deps;
        this.mapFn = this.deps && (typeof this.deps.mapFn == 'function') ? this.deps.mapFn : null;
    }

    ngOnInit() {
        if (typeof this.mapFn == 'function') {
            this.str = this.mapFn({...this.params.data});
        }
    }
}

export function ArrayFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(ArrayFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



