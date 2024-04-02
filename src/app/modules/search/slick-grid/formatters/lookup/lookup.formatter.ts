import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";


@Component({
    selector: 'lookup-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class LookupFormatterComp {
    public params;
    public injectedData: SlickGridFormatterData;
    public lookupValue: string = "";

    constructor(public injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        if(this.params.value != null && this.params.columnDef.__deps.relativeLookup) {
            var relativeFieldValue = this.params.data[this.params.columnDef.__deps.relativeLookup.ItemsSource.split(".")[0]];
            if(relativeFieldValue) {
                var lookups = this.params.columnDef.__deps.relativeLookup.Data.filter((el)=>{
                    return el[this.params.columnDef.__deps.relativeLookup.ItemsSource.split(".")[1]] == relativeFieldValue
                });
                if(lookups.length > 0) {
                    var finalLookups = lookups[0].ChildLookup.filter((el)=>{
                        return el.ID == this.params.value
                    });
                    if(finalLookups.length > 0) {
                        this.lookupValue = finalLookups[0].Name;
                    }
                }
            }
        }
        else if (this.params.value != null && this.params.columnDef.__deps.lookupMap && this.params.columnDef.__deps.lookupMap[this.params.value] != undefined) {
            this.lookupValue = this.params.columnDef.__deps.lookupMap[this.params.value];
        }
    }
}

export function LookupFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(LookupFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



