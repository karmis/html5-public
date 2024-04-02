import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { SlickGridColumn, SlickGridExpandableRowData, SlickGridFormatterData, SlickGridRowData } from '../../types';
import { commonFormatter } from '../common.formatter';
import { LookupService } from "../../../../../services/lookup/lookup.service";

@Component({
    selector: 'production-media-type-comp',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class ProductionMediaTypeFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    mediaTypeText;

    @Input('params') set setParams(params) {
        this.params = $.extend(true, this.params, params);
    }

    constructor(private injector: Injector,
                private lookupService: LookupService,) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        this.setStatus(this.params.value);
    }


    private setStatus(id: string) {
        this.lookupService.getLookups('MediaFileTypes')
            .subscribe((lookups: any) => {
                const mediaType = lookups[Number(id)];
                this.mediaTypeText = mediaType ? mediaType.Name : id;
            });
    }
}

export function ProductionMediaTypeFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridRowData | SlickGridExpandableRowData) {
    if (!(<SlickGridExpandableRowData>dataContext)._isPadding) {
        return commonFormatter(ProductionMediaTypeFormatterComp, {
            rowNumber: rowNumber,
            cellNumber: cellNumber,
            value: value,
            columnDef: columnDef,
            data: dataContext
        });
    }
}


