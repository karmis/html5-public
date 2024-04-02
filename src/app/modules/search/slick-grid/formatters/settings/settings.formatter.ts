/**
 * Created by Sergey Trizna on 26.12.2017.
 */

import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";


@Component({
    selector: 'settings-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SettingsFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private status: string;
    private column;
    private provider;
    protected classes: string = '';

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = (<any>this.injectedData).data.columnDef;
        this.provider = this.column.__contexts.provider;
        // this.classes = this.params.columnDef.cssClass
    }

    ngOnInit() {
        // this.setStatus(this.params.value);
    }

    ngAfterViewInit() {
    }

    onClick($event) {
        $event.stopPropagation();
        this.provider.tryOpenPopup($event);
    }
}

export function SettingsFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(SettingsFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



