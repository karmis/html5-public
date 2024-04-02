import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewEncapsulation
} from "@angular/core";
import {
    SlickGridColumn,
    SlickGridFormatterData,
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../types";
import { commonFormatter } from "../common.formatter";


@Component({
    selector: 'presets-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PresetsFormatterComp {
    public injectedData: any;
    public totalList: string = "";
    private data: SlickGridFormatterData;

    constructor(private injector: Injector, private cdr: ChangeDetectorRef) {
        this.injectedData = this.injector.get('data');
        this.data = this.injectedData.data.data.Presets;
    }

    ngOnInit() {
        for(var i=0; i < (<any>this.data).length; i++) {
            this.totalList += "\n" + this.data[i].Value;
        }
    }

    ngAfterViewInit() {

    }
}

export function PresetsFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(PresetsFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



