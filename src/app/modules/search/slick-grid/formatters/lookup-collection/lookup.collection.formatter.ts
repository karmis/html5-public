import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import { LookupFormatterComp } from '../lookup/lookup.formatter';


@Component({
    selector: 'lookup-collection-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class LookupCollectionFormatterComp extends LookupFormatterComp{
    public params;
    public injectedData: SlickGridFormatterData;
    public lookupValue: string = "";

    constructor(public injector: Injector) {
        super(injector);
    }

    ngOnInit() {
        const d = this.params.data[this.params.columnDef.field]||[];
        if(Array.isArray(d)) {
            this.lookupValue = d.map((id) => {
                if(id.ID != undefined) {
                    id = id.ID;
                } else if(id.Id != undefined) {
                    id = id.Id;
                }
                return this.params.columnDef.__deps.lookupMap[id]
            }).join(",\n")
        } else {
            super.ngOnInit();
        }
    }
}

export function LookupCollectionFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(LookupCollectionFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



