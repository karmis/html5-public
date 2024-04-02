/**
 * Created by Sergey Trizna on 09.12.2016.
 */
import {ChangeDetectionStrategy, Component, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {AdvancedSearchDataForControlType, AdvancedSearchDataFromControlType} from "../../../../../../../../types";
import {SearchAdvancedCriteriaProvider} from "../../../../../../providers/provider";
@Component({
    selector: 'advanced-criteria-control-checkbox',
    templateUrl: "tpl/index.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlCheckBoxComponent {
    public data: AdvancedSearchDataForControlType;
    @ViewChild('control', {static: false}) private control: any;

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider) {
        this.data = this.injector.get('data');
    }

    ngAfterViewInit() {
        let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        if (value) {
            let dv = value.dirtyValue;
            if (!dv) {
                dv = value.value
            }
            if (typeof dv == 'string') {
                dv = dv == 'true' ? true : false;
            }
            this.control.nativeElement.checked = dv;
            this.transferData();
        } else {
            if (this.data.mode == 'builder') {
                this.transferData();
            }
        }
    }

    /**
     * Send data to parent comp
     */
    transferData() {
        let checked = this.control.nativeElement.checked;
        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: checked,
            dirtyValue: checked,
            humanValue: checked ? 'Yes' : 'No'
        });
    }
}
