import {
    ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Injector, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {Observable, Subject} from "rxjs";
import {SlickGridProvider} from "../../providers/slick.grid.provider";

@Component({
    selector: 'timecode-string-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
      './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TimecodeStringFormatterComp {
    @ViewChild('timecodeElement', {static: false}) public timecodeElement: ElementRef;
    private params;
    public injectedData: SlickGridFormatterData;
    private provider: SlickGridProvider;
    public componentContext;
    public timecode: string;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.timecode = this.params.value;
        this.provider = this.params.columnDef.__contexts.provider;
        this.componentContext = this.params.columnDef.__contexts.provider.componentContext;
    }
    ngAfterViewInit() {

    }
    goToTimecode() {
        this.componentContext.goToTimecodeString.emit(this.timecode);
    }
}

export function TimecodeStringFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(TimecodeStringFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}
