import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    EventEmitter,
    Input, OnChanges,
    Output, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import * as moment from "moment";
import { IMFXControlsDateTimePickerComponent } from "../../../../../../../modules/controls/datetimepicker/imfx.datetimepicker";
import { IMFXControlsSelect2Component } from "../../../../../../../modules/controls/select2/imfx.select2";

@Component({
    selector: 'expiry-date',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/styles.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class ExpiryDateComponent implements AfterViewInit, OnChanges {
    @Input() value = null;
    @Output() onChangeDate = new EventEmitter<any>();
    @ViewChild('datetimepicker', {static: false}) datetimepicker: IMFXControlsDateTimePickerComponent;
    @ViewChild('select2', {static: false}) select2: IMFXControlsSelect2Component;

    private modeAbs: boolean = true;

    private customSorter = (a, b) => a.order < b.order;
    private friendlyDates = [
        {id: 3, text: '3 months from now', order: 0},
        {id: 6, text: '6 months from now', order: 1},
        {id: 12, text: '12 months from now', order: 2},
        {id: 18, text: '18 months from now', order: 3},
    ];

    constructor(private cdr: ChangeDetectorRef) {

    }


    ngAfterViewInit() {
        this.setDate();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setDate(changes.value.currentValue);
    }

    onChangeDateTime(event) {
        let data = event;
        if (event && event.params) {
            data = moment().add(event.params.data[0].id, 'M').toJSON();
            this.datetimepicker.setValue(new Date(data));
        } else if(event) {
            data = moment(event).format('YYYY-MM-DD') + 'T00:00:00'
        }

        this.onChangeDate.emit(data);
    }

    switchMode() {
        this.modeAbs = !this.modeAbs;
    }

    setDate(date = this.value) {
        console.log(date);
        if(this.datetimepicker) {
            this.datetimepicker.setValue(date);
            this.cdr.detectChanges();
        }
    }
}
