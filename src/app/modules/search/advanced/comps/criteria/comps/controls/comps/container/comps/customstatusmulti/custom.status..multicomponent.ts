/**
 * Created by Ivan Banan on 18.10.2019.
 */
import {ChangeDetectionStrategy, Component, Injector, ViewChild, ViewEncapsulation} from "@angular/core";
import {AdvancedSearchDataForControlType, AdvancedSearchDataFromControlType} from "../../../../../../../../types";
import {SearchAdvancedCriteriaProvider} from "../../../../../../providers/provider";
import {IMFXControlsLookupsSelect2Component} from "../../../../../../../../../../controls/select2/imfx.select2.lookups";
import {HttpService} from "../../../../../../../../../../../services/http/http.service";

@Component({
    selector: 'advanced-criteria-control-combomulti-custom-status',
    templateUrl: "./tpl/index.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent {
    public data: AdvancedSearchDataForControlType;
    public isDestroy = false;
    @ViewChild('control', {static: false}) private control: IMFXControlsLookupsSelect2Component;

    constructor(private injector: Injector,
                private httpService: HttpService,
                private transfer: SearchAdvancedCriteriaProvider) {
        this.data = this.injector.get('data');
        this.transfer.onSelectedOperator.subscribe(() => {
            this.setFocus();
        })
    }

    ngAfterViewInit() {
        let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        if (value) {
            let dv = value.dirtyValue;
            if (!dv && value.value) {
                dv = (value.value as string).split('|')
            }
            if (dv) {
                this.control.onReady.subscribe(() => {
                    this.control.setSelectedByIds(dv);
                    this.transferData();
                });
            }
        } else {
            this.transferData();
        }
    }

    ngOnDestroy() {
        this.isDestroy = true;
    }

    setFocus() {
        setTimeout(() => {
            if (this.isDestroy) {
                return;
            }
            this.control.setFocus();
        })
    }

    /**
     * Send data to parent comp
     */
    transferData($event = null) {
        let val = this.control.getSelected();

        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: val,
            dirtyValue: val,
            humanValue: this.control.getSelectedText().join(', ')
        });
    }
}
