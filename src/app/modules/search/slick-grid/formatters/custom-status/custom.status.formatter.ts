import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import { commonFormatter } from '../common.formatter';


@Component({
    selector: 'custom-status-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})
export class CustomStatusFormatterComp {
    public params;
    public injectedData: SlickGridFormatterData;
    public objjson;
    public objjsoncustom;
    public statuses: string[] = [];
    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngAfterViewInit(){
        // this.objjson = JSON.stringify(this.params.data.DynamicFields);
        // this.objjsoncustom = JSON.stringify(this.params.data.CustomStatuses);
        // $.each(this.params.data.CustomStatuses, (k, field) => {
        //     this.statuses.push(
        //         this.params.data.DynamicFields['Dynamic.CustomMediaStatus_' + field.TypeId]
        //     )
        // })
    }
}

export function CustomStatusFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(CustomStatusFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



