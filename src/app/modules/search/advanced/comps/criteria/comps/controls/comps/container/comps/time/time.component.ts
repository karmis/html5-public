import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AdvancedSearchDataFromControlType} from "../../../../../../../../types";
import {SearchAdvancedCriteriaProvider} from "../../../../../../providers/provider";
import {TimeProvider} from "../../../../../../../../../../../providers/common/time.provider";
import {IMFXTimepickerComponent} from "../../../../../../../../../../controls/timepicker/timepicker";

@Component({
    selector: 'advanced-criteria-control-time-ms',
    templateUrl: "tpl/index.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class IMFXAdvancedCriteriaControlTimeComponent {
    public data: any;
    private normalLocalDate: Date = new Date();
    @ViewChild('control', {static: false}) private dtpUI: IMFXTimepickerComponent;

    constructor(private injector: Injector,
                private timeProvider: TimeProvider,
                private cdr: ChangeDetectorRef,
                private transfer: SearchAdvancedCriteriaProvider) {
        this.data = this.injector.get('data');
    }

    ngAfterViewInit() {
        const critVal = this.data.criteria.data.value;
        let _dt: Date;
        if (critVal && critVal.value) {
            _dt = this.timeProvider.ticksToTimeMMSS(critVal.value);
        } else {
            _dt = this.timeProvider.ticksToTimeMMSS(0);
        }

        this.normalLocalDate = _dt;
        this.cdr.reattach();
        this.cdr.detectChanges();
        this.dtpUI.setDate(_dt);
        this.transferData();
    }

    transferData() {
        let valueForRequest: number;

        const date = this.dtpUI.getValue();
        if (!date) {
            return;
        }

        const s = this.dtpUI.getSecondsEl().val();
        const m = this.dtpUI.getMinutesEl().val();
        const h = this.dtpUI.getHoursEl().val();
        if(((s === '00') && (m === '00') &&  (h === '00')) || (s === '0' || m === '0' || h === '0')) {
            this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
                value: undefined,
            });
            this.cdr.detectChanges();
            return;
        }

        if (date) {
            valueForRequest = this.timeProvider.timeMMSSToTicks(date);
        }

        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: valueForRequest,
            humanValue: (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) +
                ":" + (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) +
                    ":" + (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds())
        });
    }
}
