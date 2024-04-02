/**
 * Created by Sergey Trizna on 09.12.2016.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    AdvancedSearchDataForControlType,
    AdvancedSearchDataFromControlType
} from '../../../../../../../../types';
import { SearchAdvancedCriteriaProvider } from '../../../../../../providers/provider';
import { IMFXControlsDateTimePickerComponent } from '../../../../../../../../../../controls/datetimepicker/imfx.datetimepicker';
import { IMFXControlsSelect2Component } from '../../../../../../../../../../controls/select2/imfx.select2';
import {
    AdvancedCriteriaControlSignedDateTimeDirtyValueType,
    AdvancedCriteriaControlSignedDateTimeOptionType
} from './types';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TimeProvider } from '../../../../../../../../../../../providers/common/time.provider';


const epochTicks = 621355968000000000;
const ticksPerMillisecond = 10000;

@Component({
    selector: 'advanced-criteria-control-singledatetime',
    templateUrl: 'tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class IMFXAdvancedCriteriaControlSignedDateTimeComponent {
    private data: AdvancedSearchDataForControlType; // injected data
    @ViewChild('control', {static: false}) private dtpUI: IMFXControlsDateTimePickerComponent; // datepicker for absolute date
    @ViewChild('controlSelector', {static: false}) private selectorUI: IMFXControlsSelect2Component; // select for interval type
    @ViewChild('controlInput', {static: false}) private inputUI: any; // input for interval
    private inputUIVal: number = 0; // value of interval
    private modeAbs: boolean = true; // mode (absolute/relative)
    // available intervals
    private intervals = [
        {id: 'd', text: 'Days'},
        {id: 'h', text: 'Hours'}
    ];
    private selectedInterval = 'd'; // interval selected by default
    private relativeToInt = (10000 * 1000 * 60 * 60);

    // private opts: any; //
    /**
     * Fill form in depends of mode
     * @param absMode [true|false|null]
     * @param dirtyValue
     */
    private normalLocalDate: Date = new Date();

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider,
                private translate: TranslateService,
                private timeProvider: TimeProvider,
                private cdr: ChangeDetectorRef) {
        this.data = this.injector.get('data');
        this.transfer.onSelectedOperator.subscribe(() => {
            this.setFocus();
        });
    }

    ngAfterViewInit() {
        const critVal = this.data.criteria.data.value;
        if (critVal && critVal.dirtyValue && critVal.dirtyValue.mode) {
            this.setValueByMode(critVal.dirtyValue.mode.abs, critVal.dirtyValue);
        } else if (critVal && critVal.value !== undefined) {
            this.setValueByMode();
        }

        this.setFocus();
    }

    setValueByMode(absMode: boolean = null, dirtyValue: any = null): boolean {
        this.cdr.detach();
        const critVal = this.data.criteria.data.value;
        // if (!critVal || !critVal.value) {
        //     return false;
        // }

        // const value = <number>critVal.value;
        this.modeAbs = absMode;
        if (absMode === null && critVal.value !== undefined && critVal.value !== '') {
            this.modeAbs = !this.isRelative(critVal.value);
        }
        if (this.modeAbs === false) {
            if (dirtyValue) { // restore from dirtyVal (recent search)
                this.modeAbs = dirtyValue.mode.abs;
                this.selectedInterval = dirtyValue.mode.intervalType;
                this.inputUIVal = dirtyValue.value;
            } else { // restore by other way (saved search); value: count of ticks
                if (critVal && critVal.value !== undefined && critVal.value !== '') {
                    let ctrlVal = <number>critVal.value / this.relativeToInt;
                    let timestamp = this.timeProvider.ticksToTimestamp(< number>critVal.value);
                    if (timestamp > 0 && (new Date(timestamp)).toString() !== 'Invalid Date') {
                        this.inputUIVal = 0;
                    } else {
                        const dif = (ctrlVal % 24);
                        if (dif === 0 || dif === -0) {
                            this.selectedInterval = 'd';
                            this.inputUIVal = ctrlVal / 24;
                        } else {
                            this.selectedInterval = 'h';
                            this.inputUIVal = ctrlVal;
                        }
                    }
                }
            }

            this.cdr.reattach();
            this.cdr.detectChanges();
            if (this.selectorUI) {
                this.selectorUI.setSelected(this.selectedInterval);
                this.transferData();
                return true;
            }
        } else {
            if (!critVal && !dirtyValue) {
                this.cdr.reattach();
                this.cdr.detectChanges();
                return false;
            }
            // if ((new Date(this.ticksToTimestamp(<number>critVal.value))).toString() === 'Invalid Date') {
            //     this.cdr.reattach();
            //     this.cdr.detectChanges();
            //     return false;
            // }
            let _dt: Date;
            if (dirtyValue) {
                _dt = new Date(dirtyValue.value);
            } else if (
                <number>critVal.value &&
                <number>critVal.value !== 0 &&
                this.timeProvider.ticksToTimestamp(<number>critVal.value) > 0
            ) {
                _dt = this.timeProvider.getDateInCurrentTimezone(new Date(this.timeProvider.ticksToTimestamp(<number>critVal.value)));
            } else {
                _dt = new Date();
            }

            if (_dt.toString() === 'Invalid Date') {
                this.cdr.reattach();
                this.cdr.detectChanges();
                return false;
            }

            // let dt = this.dateToUTC(_dt);
            // _dt.setUTCSeconds(0);
            // _dt.setUTCMilliseconds(0);
            if(this.modeAbs === null) {
                this.modeAbs = true;
                this.cdr.reattach();
                this.cdr.detectChanges();
            } else {
                this.normalLocalDate = _dt;
                this.cdr.reattach();
                this.cdr.detectChanges();
                this.dtpUI.setValue(_dt);
            }
        }
        this.transferData();
    }

    /**
     * Send data to parent comp
     */
    transferData() {
        let valueForRequest: number;
        let value: any;
        let mod = 1;
        let dirtyVal: any;

        // setTimeout(() => {
        if (this.modeAbs) {
            let date = this.dtpUI.getValue();
            dirtyVal = date;
            if (!date) {
                return;
            }
            // value = this.dateToUTC(date);
            if (date) {
                // valueForRequest = this.timestampToTicks(date.getTime());
                valueForRequest = this.timeProvider.dateToTicks(date);
            }
        } else {
            this.selectedInterval = this.selectorUI.getSelected();
            this.inputUIVal = this.inputUI.nativeElement.value;
            value = this.inputUIVal;
            if (value !== undefined) {
                if (this.selectedInterval === 'd') {
                    mod = 24;
                }
                valueForRequest = value * 10000 * 1000 * 60 * 60 * mod;
            }

            dirtyVal = value;
        }

        this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
            value: valueForRequest,
            dirtyValue: <AdvancedCriteriaControlSignedDateTimeDirtyValueType>{
                mode: <AdvancedCriteriaControlSignedDateTimeOptionType>{
                    abs: this.modeAbs,
                    intervalType: this.selectedInterval,
                },
                value: dirtyVal
            },
            humanValue: this.getHumanValue(this.modeAbs ? this.dtpUI.getValue() : this.inputUIVal)
        });
    }

    getTimeZoneInGMT(date){
        var currentTimezone = date.getTimezoneOffset();
        currentTimezone = (currentTimezone/60) * -1;
        let utc = currentTimezone;
        if (currentTimezone !== 0)
        {
            utc = currentTimezone > 0 ? ' +' : ' ';
            utc += currentTimezone
        }

        return utc;
    }

    /**
     * Validation
     * @param $event
     */
    validate($event) {
        let allowKeys = [
            // 190, 188, // comma and point
            // 110, // point in small keyboard
            8, 46, // backspace and delete
            37, 39, // left and right buttons
            45 // minus
        ];
        let regexp = new RegExp(/[0-9\+\-]$/);
        if (!regexp.test($event.key) && allowKeys.indexOf($event.keyCode) === -1) {
            $event.preventDefault();
        }
    }

    /**
     * Return human value
     */
    getHumanValue(val) {
        if (!val) {
            return '';
        }
        let res = null;
        if (this.modeAbs) {
            let locale = this.translate.instant('common.locale');
            let datePipe = new DatePipe(locale);
            // datePipe = new DatePipe((<any>window).navigator.userLanguage || (<any>window).navigator.language);
            let format = this.translate.instant('common.date_full_format_datepipe') || 'dd.MM.yyyy H:mm';
            res = datePipe.transform(val, format);
        } else {
            res = val + ' ' + this.intervals[this.selectedInterval === 'h' ? 1 : 0].text;
        }

        return res;
    }

    /**
     * Switch mode
     */
    switchMode() {
        this.setValueByMode(!this.modeAbs);
        this.transferData();

    }

    onSelectInterval() {
        this.selectedInterval = this.selectorUI.getSelected();
        this.transferData();
    }

    setFocus() {
        if (this.modeAbs === false) {
            this.inputUI.nativeElement.focus();
        }
    }


    isRelative(v) {
        return (v < 0) || (Math.abs(v) < 10000 * 1000 * 60 * 60 * 24 * 365);
    }

    dateToUTC(d: Date): Date {
        return new Date(
            d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()
        );
    }
}
