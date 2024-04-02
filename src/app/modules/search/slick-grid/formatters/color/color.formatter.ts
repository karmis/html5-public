import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";


@Component({
    selector: 'color-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ColorFormatterComp {
    private params;
    private column;
    private data;
    private hexColor;
    public injectedData: SlickGridFormatterData;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = (<any>this.injectedData).data.columnDef;
        this.data = this.column.__deps.data;
    }

    ngOnInit() {
        if (this.params.data && this.params.value) {
            this.hexColor = this.delphiToHex(this.params.value);
        }
    }

    ngAfterViewInit() {
    }

    delphiToHex(delphi) {
        var bb = delphi >> 16;
        delphi &= 0x00FFFF;
        var gg = delphi >> 8;
        delphi &= 0x0000FF;
        var rr = delphi;
        return "#"+this.intToHex(bb) + this.intToHex(gg) + this.intToHex(rr);
    }

    intToHex(rgb) {
        var hex = rgb.toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    };
}

export function ColorFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(ColorFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



