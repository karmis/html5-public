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
import {NumberBoxValues} from "./types";
import {SearchAdvancedCriteriaProvider} from "../../../../../../providers/provider";
import {Select2ItemType} from "../../../../../../../../../../controls/select2/types";

@Component({
    selector: 'advanced-criteria-control-numberbox',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlNumberBoxComponent {
    public data: any;
    @ViewChild('control', {static: false}) private control: IMFXControlsNumberboxComponent;
    @ViewChild('selectControl', {static: false}) private selectControl: ElementRef;
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

        let valueAsString
            , valAsNumber
            , dv
            , value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        if (value) {
            valueAsString = (<string>value.value);
            valAsNumber = parseFloat(valueAsString);
            dv = value.dirtyValue;

        } else {
            valueAsString = '';
            valAsNumber = null;
        }

        if (!dv) {
            dv = <NumberBoxValues>{
                valueAsString: valueAsString,
                valueAsNumber: valAsNumber
            }
        }

        if (valAsNumber !== null) {
            this.control.setValue(valAsNumber.toString());
        }
        this.transferData(dv);
        this.control.onChange.emit(this.control.getValue());

        this.setFocus();

    }

    setFocus() {
        setTimeout(() => {
            this.control.setFocus()
        })
    }

    transferData($event: NumberBoxValues) {

        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: $event.valueAsNumber,
            dirtyValue: $event,
            humanValue: $event.valueAsString
        });

    }
}

