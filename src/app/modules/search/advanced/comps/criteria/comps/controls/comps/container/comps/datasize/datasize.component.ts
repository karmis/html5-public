/**
 * Created by Sergey Trizna on 09.12.2016.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AdvancedSearchDataFromControlType} from "../../../../../../../../types";
import {IMFXControlsNumberboxComponent} from "../../../../../../../../../../controls/numberbox/numberbox";
import {SearchAdvancedCriteriaProvider} from "../../../../../../providers/provider";
import {Select2ItemType} from "../../../../../../../../../../controls/select2/types";
import {NumberBoxValues} from "../numberbox/types";

@Component({
    selector: 'advanced-criteria-control-datasize',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlDataSizeComponent {
    public data: any;
    @ViewChild('control', {static: false}) private control: IMFXControlsNumberboxComponent;

    @ViewChild('selectControl', {static: false}) private selectControl: ElementRef;
    private readonly dimensions: Select2ItemType[] = [
        {id: 'byte', text: 'Byte'},
        {id: 'kbyte', text: 'KB'},
        {id: 'mbyte', text: 'MB'},
        {id: 'gbyte', text: 'GB'}
    ];
    private dimension: Select2ItemType = {id: 'mbyte', text: 'MB'};
    private controlName: string;

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider,
                private cdr: ChangeDetectorRef) {
        this.data = this.injector.get('data');
        this.transfer.onSelectedOperator.subscribe(() => {
            this.setFocus();
        });
        this.controlName = this.data.criteria.data.field.Name;
    }

    ngAfterViewInit() {
        const value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        if (value && value.dirtyValue) {
            const dv = value.dirtyValue;
            this.control.setValue(dv.inputValue);
            this.dimension = dv.dimension;
        } else if (value && value.value) {
            let r_dimensions = Object.assign([], this.dimensions);
            r_dimensions = r_dimensions.reverse();
            const byte: number = (value.value as number);
            let got: boolean = false;
            $.each(r_dimensions, (_k: number, d: Select2ItemType) => {
                const pow = r_dimensions.length-_k;
                const diff = byte % Math.pow(1024, pow);
                if (diff === 0) {
                    const r = byte / Math.pow(1024, pow);
                    this.dimension = this.dimensions[pow];
                    this.control.setValue(r);
                    got = true;
                    return false;
                }
            });
            if(!got) {
                this.dimension = this.dimensions[0]; // byte
                this.control.setValue(value.value);
            }
        } else {
            this.control.setValue(0);

        }
        this.selectControl.nativeElement.value = this.dimension.id;
        this.transferData(this.control.getValue(0));
        this.cdr.markForCheck();
        this.setFocus();

    }

    setFocus() {
        setTimeout(() => {
            this.control.setFocus()
        })
    }

    transferData($event: NumberBoxValues) {
        let val = $event.valueAsNumber;
        if (val === 0) {
            return;
        }
        const inputVal = val;
        switch (this.dimension.id) {
            case 'kbyte':
                val *= 1024;
                break;
            case 'mbyte':
                val *= 1024 * 1024;
                break;
            case 'gbyte':
                val *= 1024 * 1024 * 1024;
                break;
        }

        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: val,
            dirtyValue: $.extend(true, {}, $event, {
                inputValue: inputVal,
                dimension: this.dimension
            }),
            humanValue: $event.valueAsString + ' ' + this.dimension.text
        });
    }

    private onChangeDimension($event) {
        this.dimension = this.dimensions[$event.target.selectedIndex];
        console.log(this.dimension);
        this.transferData(this.control.getValue());
    }
}

