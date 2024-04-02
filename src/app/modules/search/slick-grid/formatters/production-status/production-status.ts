import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData } from '../../types';
import { commonFormatter } from '../common.formatter';

@Component({
    selector: 'production-status-formatter-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class ProductionStatusFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private status: string = '';
    private colorClassCss: string = '';

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


    private setStatus(status: string) {
        if (status && status.length > 0)
            this.colorClassCss = status.replace(' ', '-').toLowerCase();
    }
}

export function ProductionStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    if (!(<SlickGridExpandableRowData>dataContext)._isPadding) {
        return commonFormatter(ProductionStatusFormatterComp, {
            rowNumber: rowNumber,
            cellNumber: cellNumber,
            value: value,
            columnDef: columnDef,
            data: dataContext
        });
    }
}


