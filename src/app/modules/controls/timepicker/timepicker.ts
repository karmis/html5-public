// see https://valor-software.com/ngx-bootstrap/#/timepicker
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {TimepickerComponent} from "ngx-bootstrap";
import {IMFXControlsSelect2Component} from "../select2/imfx.select2";
import {Select2ItemType} from "../select2/types";

@Component({
    selector: 'imfx-timepicker',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IMFXTimepickerComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('picker', {static: false}) public compRef: TimepickerComponent;
    @ViewChild('dd', {static: false}) public dd: IMFXControlsSelect2Component;
    @Input('time') time: Date = new Date('now');
    @Input('showMinutes') showMinutes: boolean = true;
    @Input('showSeconds') showSeconds: boolean = true;
    @Input('showSpinners') showSpinners: boolean = false;
    @Input('showMeridian') showMeridian: boolean = false;
    @Input('hoursPlaceholder') hoursPlaceholder: string = 'hh';
    @Input('minutesPlaceholder') minutesPlaceholder: string = 'mm';
    @Input('secondsPlaceholder') secondsPlaceholder: string = 'ss';
    @Output('onChange') onChange: EventEmitter<Date> = new EventEmitter<Date>();
    private wrapperEl: any;
    private ddPresets: Select2ItemType[] = [
        {id: 5, text: '00:00:05'},
        {id: 30, text: '00:00:30'},
        {id: 60, text: '00:01:00'},
        {id: 300, text: '00:05:00'},
        {id: 600, text: '00:10:00'},
        {id: 1800, text: '00:30:00'},
        {id: 3600, text: '01:00:00'},
    ];

    constructor(public cdr: ChangeDetectorRef) {
    }

    @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if ($(event.target).closest('.imfx-adv-timepicker-wrapper').length === 1) {
            if (event.keyCode === 8) { // backspace
                if (this.isFocusSecondsEl() && this.getSecondsEl().val() == "") {
                    event.preventDefault();
                    this.getMinutesEl().focus();
                    return false;
                } else if (this.isFocusMinutesEl() && this.getMinutesEl().val() == "") {
                    event.preventDefault();
                    this.getHoursEl().focus();
                    return false;
                } else {
                }
                // ...
            } else if (event.keyCode === 46) { // delete
                if (this.isFocusHoursEl() && this.getHoursEl().val() == "") {
                    event.preventDefault();
                    this.getMinutesEl().focus();
                    return false;
                } else if (this.isFocusMinutesEl() && this.getMinutesEl().val() == "") {
                    event.preventDefault();
                    this.getSecondsEl().focus();
                    return false;
                } else {
                }
            } else if (event.keyCode === 39) { // right
                if (this.isFocusHoursEl() && this.getHoursEl().caret().end === this.getHoursEl().val().length) {
                    event.preventDefault();
                    this.getMinutesEl().focus();
                    return false;
                } else if (this.isFocusMinutesEl() && this.getMinutesEl().caret().end === this.getMinutesEl().val().length) {
                    event.preventDefault();
                    this.getSecondsEl().focus();
                    return false;
                }
            } else if (event.keyCode === 37) { // left
                if (this.isFocusSecondsEl() && this.getSecondsEl().caret().end === 0) {
                    event.preventDefault();
                    this.getMinutesEl().focus();
                    return false;
                } else if (this.isFocusMinutesEl() && this.getMinutesEl().caret().end === 0) {
                    event.preventDefault();
                    this.getHoursEl().focus();
                    return false;
                }
            } else if (event.keyCode === 13) {
                event.preventDefault();
                this.formatDate();
                this.onChange.emit(this.getValue());
                return false;
            } else if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(Number(event.key)) === -1) {
                event.preventDefault();
                return false;
            }
        }
    }

    ngAfterViewInit() {
        this.setValues('00', '00', '00');
        this.wrapperEl = $(this.wrapper.nativeElement);
        // input
        this.getHoursEl().on('input', () => {
            this.onChange.emit(this.getValue())
        });
        this.getMinutesEl().on('input', () => {
            this.onChange.emit(this.getValue())
        });
        this.getSecondsEl().on('input', () => {
            this.onChange.emit(this.getValue())
        });
        // wheel
        this.getHoursEl().on('mousewheel', () => {
            this.onChange.emit(this.getValue())
        });
        this.getMinutesEl().on('mousewheel', () => {
            this.onChange.emit(this.getValue())
        });
        this.getSecondsEl().bind('mousewheel', () => {
            this.onChange.emit(this.getValue())
        });
        // blur
        this.getHoursEl().on('blur', () => {
            this.formatDate();
            this.onChange.emit(this.getValue());
        });
        this.getMinutesEl().on('blur', () => {
            this.formatDate();
            this.onChange.emit(this.getValue());
        });
        this.getSecondsEl().bind('blur', () => {
            this.formatDate();
            this.onChange.emit(this.getValue());
        });


        // const _ddPresets = this.ddPresets.sort(function (a, b) {
        //     return parseInt(a.id.toString()) - parseInt(b.id.toString()) || a.text.localeCompare(b.text);
        // });
        // this.dd.setData(_ddPresets);
    }

    onSelectInDD() {
        const d: Date = new Date();
        d.setMilliseconds(0);
        d.setMinutes(0);
        d.setHours(0);
        d.setSeconds(this.dd.getSelected());
        this.setDate(d);
    }

    formatDate() {
        const d = new Date();
        d.setSeconds(this.getSecondsEl().val());
        d.setMinutes(this.getMinutesEl().val());
        d.setHours(this.getHoursEl().val());
        this.setDate(d);
    }

    setHours(v: string, ut: boolean = false) {
        this.compRef.updateHours(v);
        if (ut) {
            this.compRef._updateTime();
        }
    }

    setMinutes(v: string, ut: boolean = false) {
        this.compRef.updateMinutes(v);
        if (ut) {
            this.compRef._updateTime();
        }
    }

    setSeconds(v: string, ut: boolean = false) {
        this.compRef.updateSeconds(v);
        if (ut) {
            this.compRef._updateTime();
        }
    }

    setValues(h: string, m: string, s: string) {
        this.setHours(h);
        this.setMinutes(m);
        this.setSeconds(s);
        this.compRef._updateTime();
    }

    setDate(d: Date) {
        this.setHours(d.getHours().toString());
        this.setMinutes(d.getMinutes().toString());
        this.setSeconds(d.getSeconds().toString());
        this.compRef._updateTime();
        this.cdr.detectChanges()
        this.onChange.emit(d);
    }

    getValue(): Date {
        const d: Date = new Date();
        d.setHours(Number(this.compRef.hours));
        d.setMinutes(Number(this.compRef.minutes));
        d.setSeconds(Number(this.compRef.seconds));

        return d;
    }

    getHoursEl() {
        return this.wrapperEl.find('.bs-timepicker-field').eq(0);
    }

    getMinutesEl() {
        return this.wrapperEl.find('.bs-timepicker-field').eq(1);
    }

    getSecondsEl() {
        return this.wrapperEl.find('.bs-timepicker-field').eq(2);
    }

    isFocusHoursEl() {
        return this.wrapperEl.find('.bs-timepicker-field').eq(0).is(':focus');
    }

    isFocusMinutesEl() {
        return this.wrapperEl.find('.bs-timepicker-field').eq(1).is(':focus');
    }

    isFocusSecondsEl() {
        return this.wrapperEl.find('.bs-timepicker-field').eq(2).is(':focus');
    }
}
