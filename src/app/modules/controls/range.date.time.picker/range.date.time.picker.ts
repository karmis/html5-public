/**
 * Created by Sergey Trizna on 29.05.2017.
 */
import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewEncapsulation,
    Input,
    Output,
    EventEmitter,
    ViewChild
} from "@angular/core";

@Component({
    selector: 'imfx-controls-range-date-time-picker',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
})

export class RangeDateTimePickerComponent {
    private fromDefValue: Date = new Date();
    private toDefValue: Date = new Date();
    @ViewChild('fromRDTPcontrol', {static: false}) private fromCompRef;
    @ViewChild('toRDTPcontrol', {static: false}) private toCompRef;
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
        // this.fromDefValue = new Date();
        // this.toDefValue.setDate(this.toDefValue.getDate() + 1);
    }

    private changedDate(type) {
        if (this.getRange() < 0) {
            if (type == 'from') {
                this.fromCompRef.setValue(new Date());
            } else {
                this.toCompRef.setValue(new Date());
                this.toCompRef.setSe
            }

            this.onChange.emit({from: this.fromCompRef.getValue(), range: this.getRange(), to: this.toCompRef.getValue()});
        }
    }


    getRange() {
        return this.toCompRef.getValue().getTime() - this.fromCompRef.getValue().getTime();
    }
}
