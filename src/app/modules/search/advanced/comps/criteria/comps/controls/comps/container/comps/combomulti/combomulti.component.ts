/**
 * Created by Sergey Trizna on 09.12.2016.
 */
import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {
    AdvancedSearchDataForControlType,
    AdvancedSearchDataFromControlType
} from "../../../../../../../../types";
import { SearchAdvancedCriteriaProvider } from "../../../../../../providers/provider";
import { IMFXControlsLookupsSelect2Component } from "../../../../../../../../../../controls/select2/imfx.select2.lookups";

@Component({
    selector: 'advanced-criteria-control-combomulti',
    templateUrl: "tpl/index.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IMFXAdvancedCriteriaControlComboMultiComponent {
    public data: AdvancedSearchDataForControlType;
    @ViewChild('control', {static: false}) private control: IMFXControlsLookupsSelect2Component;

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider) {
        this.data = this.injector.get('data');
        this.transfer.onSelectedOperator.subscribe(() => {
            this.setFocus();
        });
    }

    ngAfterViewInit() {
        let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        if (value) {
            let dv = value.dirtyValue;
            if (!dv) {
                if(typeof value.value == 'number') {
                    dv = [value.value];
                } else {
                    dv = (<string>value.value).split('|');
                }
            }
            this.control.onReady.subscribe(() => {
                this.control.setSelectedByIds(dv);
                this.transferData();
            });
        } else {
            this.transferData();
        }

        this.setFocus();
    }

    setFocus() {
        setTimeout(() => {
            this.control.setFocus();
        });
    }

    transferData() {
        let val = this.control.getSelected();
        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: val.join('|'),
            dirtyValue: val,
            humanValue: this.control.getSelectedText().join('|')
        });
    }

    customStandardToString(dirtyObj, comp, stObj) {
        let obj = Object.assign({}, stObj);
        obj.id = dirtyObj[comp.key];
        obj.text = '[' + dirtyObj[comp.key] + '] ' + dirtyObj[comp.text];

        return obj;
    }
}
