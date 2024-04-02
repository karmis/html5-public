/**
 * Created by Sergey Trizna on 09.12.2016.
 */
import {ChangeDetectionStrategy, Component, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {SearchAdvancedCriteriaProvider} from "../../../../../../providers/provider";
import {AdvancedSearchDataForControlType, AdvancedSearchDataFromControlType} from "../../../../../../../../types";
import {isUndefined} from "util";

@Component({
    selector: 'advanced-criteria-control-textbox',
    templateUrl: "tpl/index.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlTextBoxComponent {
    public data: AdvancedSearchDataForControlType;
    @ViewChild('control', {static: false}) private control;

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider) {
        this.data = this.injector.get('data');
        this.transfer.onSelectedOperator.subscribe(() => {
            this.setFocus();
        })
    }

    ngAfterViewInit() {
        let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        if (value) {
            this.control.nativeElement.value = value.value;
        }

        this.setFocus();
        this.transferData();
    }

    setFocus() {
        setTimeout(() => {
            this.control.nativeElement.focus();
        });
    }

    /**
     * Send data to parent comp
     */
    transferData() {
        let val = this.control.nativeElement.value;
        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: $.trim(val),
            dirtyValue: val,
            humanValue: val
        });
    }
}
