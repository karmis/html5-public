import {ChangeDetectionStrategy, Component, Injector, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";


@Component({
    selector: 'version-icons-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class VersionIconsFormatterComp {
    private params;
    public injectedData: SlickGridFormatterData;
    private isIMF = false;
    private isMedia = false;
    private imfText = 'IMF';
    private mediaText = 'MEDIA';

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
    }

    ngOnInit() {
        if (this.params.data && this.params.data["PACKAGE_TYPE"] == 1) {
          this.isIMF = true;
        } else if (this.params.data && this.params.data['MediaId']) {
          this.isMedia = true;
        }
    }
}

export function VersionIconsFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(VersionIconsFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    })
}



