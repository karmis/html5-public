import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";

@Component({
    selector: 'preview-imf-details-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
      'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PreviewImfDetailsFormatterComp {
    private params;
    private isXML = false;
    public injectedData: SlickGridFormatterData;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        // if (this.params.data.Filename.toLowerCase().includes('.xml')) {
        if (this.params.data.EntryType == 'xml') {
          this.isXML = true;
        }
    }
    showDetail() {
        this.params.columnDef.__contexts.provider.componentContext.showModal(this.params.data.Id);
    };
}

export function PreviewImfDetailsFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(PreviewImfDetailsFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



