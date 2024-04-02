import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation } from "@angular/core";
import { SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData } from "../../types";
import { commonFormatter } from "../common.formatter";

@Component({
    selector: 'table-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableFormatterComp {
    public injectedData: SlickGridFormatterData;
    protected lookups;
    protected dataMap;
    protected data;
    private params;
    private deps;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.deps = this.params.columnDef.__deps;
        this.lookups = this.deps && this.deps.lookups || {};
        this.dataMap = this.deps && this.deps.dataMap || [];
        this.data = this.params.data[this.params.columnDef.field];
    }

    ngOnInit() {

    }

    getValue(item, mapItem) {
        const lookupItem = this.lookups[mapItem.field], //array
            value = item[mapItem.field];

        if (lookupItem) {
            const lookupValue = lookupItem.find(el => el.id == value);
            return (lookupValue)
                ? lookupValue.text
                : '';
        } else {
            return value;
        }
    }

}

export function TableFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(TableFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



