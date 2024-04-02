import {ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {IMFXControlsSelect2Component, Select2EventType} from "../../../../controls/select2/imfx.select2";
import {SlickGridProvider} from "../../providers/slick.grid.provider";

@Component({
    selector: 'select2-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class Select2FormatterComp {
    public injectedData: { data: SlickGridFormatterData };
    @ViewChild('select2Control', {static: false}) private select2Control: IMFXControlsSelect2Component;
    @ViewChild('select2ControlWrap', {static: false}) private select2ControlWrap: ElementRef;
    private params: SlickGridFormatterData;
    private column: SlickGridColumn;
    private provider: SlickGridProvider;
    private validationEnabled: boolean = false;
    private isReadonly: boolean = false;
    private allowClear: boolean = false;

    constructor(private injector: Injector) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.provider = (<any>this.injectedData).data.columnDef.__contexts.provider;
        this.column = (<any>this.injectedData).data.columnDef;
        this.validationEnabled = this.column.__deps.data.validationEnabled;
        this.allowClear = this.column.__deps.data.allowClear;
        this.isReadonly = this.column.__deps.data.isReadonly;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        // $(this.select2ControlWrap.nativeElement).parent().parent().addClass('skipSelection');
        let select2data = [];
        if (this.column.__deps.data.grouping) {
            select2data = this.select2Control.turnArrayOfObjectToStandartGrouping(this.column.__deps.data.values, this.column.__deps.data.rule);
        } else {
            select2data = this.select2Control.turnArrayOfObjectToStandart(this.column.__deps.data.values, this.column.__deps.data.rule);
        }
        this.select2Control.setData(select2data, true, this.column.__deps.data.grouping);
        let val = undefined;
        if (this.column.__deps.data && this.column.__deps.data.value && typeof this.column.__deps.data.value === 'function') {
            val = this.column.__deps.data.value(this.params, this.column, this.provider);
        } else {
            val = this.params.value;
        }

        // let val = ? : this.params.data[this.column.name];
        this.select2Control.setSelectedByIds([val]);
        this.provider.onGetValidation.subscribe((callback) => {
            let isValid = this.getValidation();
            callback(isValid);
        });

        if (this.validationEnabled) {
            let isValid = val === 0 ? true : !!val;
            this.select2Control.setValidation(isValid);
        }

    }

    onUpdateControl(eventData: Select2EventType) {
        if (eventData.params && eventData.params.isSameAsPrevious) return;

        let selected = this.select2Control.getSelectedObject();
        this.params.columnDef.__contexts.provider.formatterSelect2OnSelect.emit({
            data: this.params,
            value: selected
        });
        this.select2Control.checkValidation(selected);
    }

    getValidation() {
        return this.select2Control.getValidation();
    }

}

export function Select2Formatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    return commonFormatter(Select2FormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}


