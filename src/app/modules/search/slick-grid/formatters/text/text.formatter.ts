import {ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {SlickGridProvider} from "../../providers/slick.grid.provider";
import {Observer} from "rxjs";

@Component({
    selector: 'text-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})
export class TextFormatterComp {
    @ViewChild('textControl', {static: false}) private textControl: ElementRef;
    @ViewChild('textareaControl', {static: false}) private textareaControl: ElementRef;
    @ViewChild('textControlWrap', {static: false}) private textControlWrap: ElementRef;
    private params: SlickGridFormatterData;
    private column: SlickGridColumn;
    private provider: SlickGridProvider;
    private isValid: boolean = true;
    public injectedData: { data: SlickGridFormatterData };
    private validationEnabled: boolean = false;
    private multiline: boolean = false;
    private textControlNativeEl;
    private readOnly: boolean = false;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = this.params.columnDef;
        this.provider = this.column.__contexts.provider;
        this.validationEnabled = this.column.__deps.data.validationEnabled;
        this.multiline = this.column.__deps.data.multiline;
        this.readOnly = this.column.__deps.data.readOnly ? true : false;;
    }

    ngOnInit() {
        this.provider.formatterSetReadOnly.subscribe((readonly) => {
            this.readOnly = readonly;
        });
    }

    ngAfterViewInit() {
        // remove selection
        this.textControlNativeEl = (this.multiline) ? this.textareaControl.nativeElement : this.textControl.nativeElement;
        // $(this.textControlWrap.nativeElement).parent().parent().addClass('skipSelection');
        // set value
        $(this.textControlNativeEl).val(this.params.data[this.column.field]);
        if (this.validationEnabled) {
            if (!this.params.data[this.column.field] || this.params.data[this.column.field] == '') {
                $(this.textControlNativeEl).parent().addClass('error-validation');
                this.isValid = false;
            } else {
                $(this.textControlNativeEl).parent().removeClass('error-validation');
                this.isValid = true;
            }
        }
        // event
        $(this.textControlNativeEl).on('keyup', (e) => {
            this.params.columnDef.__contexts.provider.formatterTextOnChange.emit({data: this.params, value: (<any>e.target).value})
            if (this.validationEnabled) {
                if (!(<any>e.target).value || (<any>e.target).value == '') {
                    $((<any>e.target).parentElement).addClass('error-validation');
                    this.isValid = false;
                } else {
                    $((<any>e.target).parentElement).removeClass('error-validation');
                    this.isValid = true;
                }
            }
        });



        // this.subscription = this.provider.onGetValidation.subscribe((callback) => {
        //     callback(this.isValid);
        // });
    }
}
export function TextFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(TextFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}


