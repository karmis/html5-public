import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from "@angular/core";
import { SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData } from "../../types";
import { commonFormatter } from "../common.formatter";
import { Subject } from "rxjs";
import { SlickGridProvider } from "../../providers/slick.grid.provider";
import { takeUntil } from "rxjs/internal/operators";

@Component({
    selector: 'timecode-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TimecodeInputFormatterComp {
    @ViewChild('timecodeElement', {static: false}) public timecodeElement: ElementRef;
    public injectedData: SlickGridFormatterData;
    public componentContext;
    public timecode: string;
    public format: string;
    public som: number;
    public eom: number;
    public inputError: boolean = false;
    public destroyed$: Subject<any> = new Subject();
    private params;
    private provider: SlickGridProvider;
    private error: boolean = false;
    private isDisplayArrow: boolean = true;
    private isDisabledTooltip: boolean = false;
    private reloadSomEom: Subject<any> = new Subject();

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.timecode = this.params.value;
        this.provider = this.params.columnDef.__contexts.provider;
        this.componentContext = this.params.columnDef.__contexts.provider.componentContext;
        this.isDisplayArrow = this.params.columnDef.__deps.isDisplayArrow !== undefined ? this.params.columnDef.__deps.isDisplayArrow : this.isDisplayArrow;
        this.isDisabledTooltip = this.params.columnDef.__deps.isDisabledTooltip !== undefined ? this.params.columnDef.__deps.isDisabledTooltip : this.isDisabledTooltip;
        this.format = this.params.data.TimecodeFormat || this.componentContext.config.file.TimecodeFormat; //toDo ckecking second source(for AVFaults)
        this.som = this.params.data.videoSom;
        this.eom = this.params.data.videoEom;
    }

    ngAfterViewInit() {
        this.calcInputError();

        (<any>this.timecodeElement).inputError = this.inputError;
        (<any>this.timecodeElement).cdr.detectChanges(); // very dirty hack

        this.provider.formatterTimedcodeIsValid.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.calcInputError();
            (<any>this.provider).isValid(this.error);
        });

        this.provider.formatterTimedcodeSetSomEom.pipe(takeUntil(this.destroyed$)).subscribe((res: any) => {
            this.som = res.videoSom;
            this.eom = res.videoEom;
            this.reloadSomEom.next(res);
        });

        (<any>this.provider).isValid(this.error);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    };

    calcInputError() {
        const id = this.params.data.customId || this.params.data.Id || this.params.data.ID;
        const data = this.params.data;

        if (data && (this.provider as any).getTimecodeValid instanceof Function) {
            this.inputError = (this.provider as any).getTimecodeValid(id, data);
        }
    }

    emitOnTimecodeEdit(error) {
        this.componentContext.onTimecodeEdit.emit({
            timecode: this.timecode,
            type: this.params.columnDef.name,
            error: error,
            params: this.params
        });
    }

    onChangedInputValue(error) {
        this.error = error;
        this.emitOnTimecodeEdit(error);
    }

    onKeyUp(data) {
        this.error = data.error
        if (data.e.which === 13 || (data.e.which >= 48 && data.e.which <= 57) || (data.e.which >= 96 && data.e.which <= 105) || data.e.which == 127 || data.e.which == 8) { // enter or numbers or delete or backspase
            this.emitOnTimecodeEdit(data.error);
        }
    }

    goToTimecode() {
        this.componentContext.goToTimecodeString.emit(this.timecode);
    }

    onFocusTimeCode($event: FocusEvent) {
        const el$ = $($event.currentTarget);
        if (el$.hasClass('timecode-input')) {
            const rowId = el$.data('rowid');
            if (rowId != undefined) {
                this.provider.setSelectedRow(rowId);
            }
        }
    }
}

export function TimecodeInputFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(TimecodeInputFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



