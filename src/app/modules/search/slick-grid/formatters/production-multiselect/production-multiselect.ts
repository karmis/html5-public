import { ChangeDetectorRef, Component, Injector, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData } from '../../types';
import { commonFormatter } from '../common.formatter';
import { LookupService } from "../../../../../services/lookup/lookup.service";
import { Subscription } from 'rxjs';

@Component({
    selector: 'production-multi-select-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class ProductionMultiSelectFormatterComp implements OnDestroy {
    private params;
    public injectedData: SlickGridFormatterData;
    selected = false;
    disabled = false;
    subsArray: Subscription[] = [];

    @Input('params') set setParams(params) {
        this.params = $.extend(true, this.params, params);
    }

    constructor(private injector: Injector,
                private lookupService: LookupService,
                private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        // @ts-ignore
        this.subsArray.push(this.injectedData.data.columnDef.__contexts.provider.updateCheckbox.subscribe(() => {
            this.updateCheckbox();
        }));
        this.updateCheckbox();
    }

    ngOnDestroy() {
        this.subsArray.forEach(el => {
            el.unsubscribe();
        })
    }

    updateCheckbox() {
        // @ts-ignore
        this.selected = this.injectedData.data.data.MULTI.IS_SELECTED;
        // @ts-ignore
        this.disabled = this.injectedData.data.data.MULTI.IS_DISABLED;
        this.cdr.detectChanges();
    }

    isChecked() {
        // @ts-ignore
        return this.injectedData.data.columnDef.__contexts.provider.isMultiSelected(this.params.data)
    }

    private onChangeStatus(status) {
        // @ts-ignore
        this.injectedData.data.data.MULTI.IS_SELECTED = status;
        // @ts-ignore
        this.injectedData.data.columnDef.__contexts.provider.setMultiSelected({data: this.params, status})
    }
}

export function ProductionMultiSelectFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    if (!(<SlickGridExpandableRowData>dataContext)._isPadding) {
        return commonFormatter(ProductionMultiSelectFormatterComp, {
            rowNumber: rowNumber,
            cellNumber: cellNumber,
            value: value,
            columnDef: columnDef,
            data: dataContext
        });
    }
}


