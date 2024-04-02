/**
 * Created by Sergey Trizna on 17.12.2016.
 */
// See http://xdsoft.net/jqplugins/datetimepicker/
import {Component, EventEmitter, Input, Output, SimpleChanges, ViewChild, ViewEncapsulation} from "@angular/core";
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";
// Loading jQuery
import * as $ from "jquery";
import "./libs/jquery.datetimepicker.full.js";
import "style-loader!./libs/jquery.datetimepicker.min.css";
import {Guid} from "../../../utils/imfx.guid";
import { NativeNavigatorProvider } from '../../../providers/common/native.navigator.provider';

@Component({
    selector: 'imfx-controls-datetimepicker',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})

export class IMFXControlsDateTimePickerComponent {
    @Output() onSelectDate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelectTime: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChangeMonth: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChangeYear: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChangeDateTime: EventEmitter<any> = new EventEmitter<any>();
    @Output() onShow: EventEmitter<any> = new EventEmitter<any>();
    // @Output() onGenerate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAnyEvent: EventEmitter<any> = new EventEmitter<any>();
    /**
     * timepickerScrollbar
     * @type {boolean}
     */
    @Input('timepickerScrollbar') timepickerScrollbar: boolean = true;
    public selectedDate: Date = new Date();
    /**
     * Reference to current component
     */
    @ViewChild('imfxControlsDateTimePicker', {static: false}) private compRef;
    /**
     * Small
     * should we apply form-control-sm to input or not
     * @type {boolean}
     */
    @Input('small') private small: boolean = false;
    /**
     * Readonly
     * should we restrict edit of input
     * @type {boolean}
     */
    @Input('readonly') private readonly: boolean = false;
    /**
     * Locale
     * @type {string}
     */
    @Input('locale') private locale: string = 'en';
    /**
     * Format
     * @type {string}
     */
    @Input('format') private format: string = 'Y/m/d H:i';
    /**
     * Format date
     * @type {string}
     */
    @Input('formatDate') private formatDate: string = 'Y/m/d';
    /**
     * Format date
     * @type {string}
     */
    @Input('formatTime') private formatTime: string = 'H:i';
    /**
     * Step
     * @type {number}
     */
    @Input('step') private step: number = 5;
    /**
     * closeOnDateSelect
     * @type {boolean}
     */
    @Input('closeOnDateSelect') private closeOnDateSelect: boolean = true;
    /**
     * closeOnWithoutClick
     * @type {boolean}
     */
    @Input('closeOnWithoutClick') private closeOnWithoutClick: boolean = true;
    /**
     * timepicker
     * @type {boolean}
     */
    @Input('timepicker') private timepicker: boolean = true;

    /**
     * minDate
     * @type {Date}
     */
    @Input('minDate') private minDate: Date|boolean = false;

    /**
     * maxDate
     * @type {Date}
     */
    @Input('maxDate') private maxDate: Date|boolean = false;
    /**
     * datepicker
     * @type {boolean}
     */
    @Input('datepicker') private datepicker: boolean = true;
    /**
     * weeks
     * @type {boolean}
     */
    @Input('weeks') private weeks: boolean = false;
    //
    /**
     * startDate
     * @type {Date}
     */
    @Input('startDate') private startDate: Date | boolean = new Date();

    /**
     * minTime
     * @type {Date}
     */
    @Input('minTime') private minTime: Date|boolean = false;
    //
    // /**
    //  * maxTime
    //  * @type {Date}
    //  */
    // @Input('maxTime') private maxTime: Date|boolean = false;
    //
    /**
     * defaultDate
     * @type {Date}
     * not working in plugin ((
     */
    @Input('defaultDate') private defaultDate: string | Date = new Date();
    /**
     * defaultTime
     * @type {Date}
     * not working in plugin ((
     */
    @Input('defaultTime') private defaultTime: string | Date = new Date();
    /**
     * mask
     * @type {boolean}
     */
    @Input('mask') private mask: boolean = true;
    // @Input('showMask') private showMask: boolean = true;
    /**
     * validateOnBlur
     * @type {boolean}
     */
    @Input('validateOnBlur') private validateOnBlur: boolean = true;
    /**
     * todayButton
     * @type boolean
     */
    @Input('todayButton') private todayButton: boolean = true;
    /**
     * defaultSelect
     * @type {boolean}
     */
    @Input('defaultSelect') private defaultSelect: boolean = true;
    /**
     * allowBlank
     * @type {boolean}
     */
    @Input('allowBlank') private allowBlank: boolean = false;

    /**
     * yearStart
     * @type {number}
     */
    @Input('yearStart') private yearStart: number = 1950;
    //
    // /**
    //  * yearEnd
    //  * @type {number}
    //  */
    // @Input('yearEnd') private yearEnd: number = 2050;
    /**
     * withoutCopyright
     * @type {boolean}
     */
    @Input('withoutCopyright') private withoutCopyright: boolean = true;
    /**
     * opened
     * @type {boolean}
     */
    @Input('opened') private opened: boolean = false;
    /**
     * opened
     * @type {string}
     */
    @Input('roundTime') private roundTime: string = 'round';
    /**
     * dayOfWeekStart
     * @type {string}
     */
    @Input('dayOfWeekStart') private dayOfWeekStart: number | string = 0;
    /**
     * value
     * @type {string}
     */
    @Input('value') private value: any = new Date();
    @Input('clearButton') clearButton = false;
    @Input('id') public id: string = '';
    private extendsOptions = {};
    private guid: string;

    public constructor(private translate: TranslateService,
                       private navProvider: NativeNavigatorProvider) {
        this.guid = Guid.newGuid();
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.value) {
            if(this.compRef) {
                this.setValue(changes.value.currentValue);
            } else {
                setTimeout(() => {
                    this.setValue(changes.value.currentValue);
                });
            }
        }
    }

    /**
     * Get default options
     */
    public getDefaultOptions() {
        return {
            locale: this.locale,
            format: this.format,
            formatDate: this.formatDate,
            formatTime: this.formatTime,
            step: this.step,
            closeOnDateSelect: this.closeOnDateSelect,
            closeOnWithoutClick: this.closeOnWithoutClick,
            datepicker: this.datepicker,
            timepicker: this.timepicker,
            weeks: this.weeks,
            minDate: this.minDate,
            maxDate: this.maxDate,
            startDate: this.startDate,
            minTime: this.minTime,
            // maxTime: this.maxTime,
            defaultDate: this.defaultDate,
            defaultTime: this.defaultTime,
            // yearEnd: this.yearEnd,
            yearStart: this.yearStart,
            mask: this.mask,
            // showMask: this.mask,
            todayButton: this.todayButton,
            defaultSelect: this.defaultSelect,
            allowBlank: this.allowBlank,
            timepickerScrollbar: this.timepickerScrollbar,
            withoutCopyright: this.withoutCopyright,
            opened: this.opened,
            roundTime: this.roundTime,
            dayOfWeekStart: this.dayOfWeekStart,
            validateOnBlur: this.validateOnBlur,
            value: this.value,
            readonly: this.readonly
        };
    }

    /**
     * Set default options
     * @param paramOptions
     */
    public setDefaultOptions(paramOptions) {
        this.extendsOptions = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            paramOptions // options from params
        );
    }

    /**
     * Returned current state options for plugin
     */
    public getActualOptions(paramOptions = {}) {
        let opts = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            this.extendsOptions, // actually options
            paramOptions // options from params
        );

        return opts;
    }

    ngAfterViewInit() {
        this.initPlugin();
    }

    public setFocus() {
        setTimeout(() => {
            this.compRef.focus();
        });
    }

    /**
     * Open dropdown
     */
    public open() {
        this.compRef.datetimepicker('show');
    }

    /**
     * Close dropdown
     */
    public close() {
        this.compRef.datetimepicker('hide');
    }

    /**
     * Toggle dropdown
     */
    public toggle() {
        this.compRef.datetimepicker('toggle');
    }

    /**
     * destroy
     */
    public destroy() {
        this.compRef.datetimepicker('destroy');
    }

    /**
     * reset
     */
    public reset() {
        this.compRef.datetimepicker('reset');
    }

    public onClearDatePicker() {
        this.reset();
        this.setOptions({startDate: false, opened: false, value: null});
        this.onChangeDateTime.emit(null);
    }

    /**
     * validate
     */
    public validate(val) {
        return this.compRef.datetimepicker(val);
    }

    /**
     * Set options to plugin
     */
    public setOptions(opts) {
        this.compRef.datetimepicker(opts);
    }

    /**
     * getValue
     */
    public getValue() {
        return this.compRef.datetimepicker('getValue');
    }

    public getValueAsJSON(): string|null {
        const d = this.getValue();
        if(d){
            return (new Date(d.getTime() - d.getTimezoneOffset() * 60000)).toJSON();
        }

        return null

    }

    // private getSecondsWithLeadingZero(d: Date) {
    //     return d.getSeconds()>=10?''+d.getSeconds():'0'+d.getSeconds();
    // }
    //
    // private getMinuitesWithLeadingZero(d: Date) {
    //     return d.getMinutes()>=10?''+d.getMinutes():'0'+d.getMinutes();
    // }
    //
    // private getHourseWithLeadingZero(d: Date) {
    //     return d.getHours()>=10?''+d.getHours():'0'+d.getHours();
    // }
    //
    // private getUTCSecondsWithLeadingZero(d: Date) {
    //     return d.getUTCSeconds()>=10?''+d.getUTCSeconds():'0'+d.getUTCSeconds();
    // }
    //
    // private getUTCMinuitesWithLeadingZero(d: Date) {
    //     return d.getUTCMinutes()>=10?''+d.getUTCMinutes():'0'+d.getUTCMinutes();
    // }
    //
    // private getUTCHourseWithLeadingZero(d: Date) {
    //     return d.getUTCHours()>=10?''+d.getUTCHours():'0'+d.getUTCHours();
    // }

    /**
     * set value
     */
    public setValue(date: any) {
        if (typeof date === "string") {
            this.setOptions({value: new Date(date)});
            return
        }

        if (date == null) {
            this.setOptions({value: date});
            return
        }

        if (typeof (<any>date).getMonth !== 'function') {
            date = new Date(date);
        }

        // this.value = (<Date>date);
        this.setOptions({value: date});
        // this.compRef.trigger('generate.xdsoft');
    }

    /**
     * Re init jQuery plugin with new options
     * @param paramOptions
     */
    public reinitPlugin(paramOptions: Object = {}) {
        this.initPlugin(paramOptions);
    }

    ngOnDestroy() {
        this.destroy();
    }

    /**
     * Init jQuery plugin with options
     */
    private initPlugin(paramOptions?) {
        let self = this;
        this.compRef = $(this.compRef.nativeElement);
        let options: {[key:string]: any} = this.getActualOptions();
        options = $.extend(true, {}, options, paramOptions);
        if(options.readonly) {
            options.timepickerScrollbar = false;
            options.scrollMonth = false;
            options.scrollTime = false;
            options.scrollInput = false;
        }
        options = Object.assign(options, this.bindEventsToEmitters());
        // options = this.beforePluginInit(options);

        this.translate.get('common').subscribe((res: any) => {
            // $.fn.datetimepicker.defaults.i18n[res.lang] = {
            //     months: res.months,
            //     dayOfWeek: res.dayOfWeek
            // };
            options['dayOfWeekStart'] = res.date_day_of_week_start;
            options['dayOfWeekShort'] = res.date_day_of_week_start;
            options['dayOfWeek'] = res.date_day_of_week_start;
            if (this.timepicker && !this.datepicker) {
                options['format'] = res.time_format;
            } else if (!this.timepicker && this.datepicker) {
                options['format'] = res.date_format;
            } else {
                options['format'] = res.date_full_format;
            }
            options['formatDate'] = res.date_format;
            options['formatTime'] = res.time_format;

            if (!options['i18n']) {
                options['i18n'] = {};
            }
            options['i18n']['en'] = {
                months: res.months,
                dayOfWeek: res.dayOfWeek
            };

            self.compRef.datetimepicker(options);
        });

        this.setOptions({
            startDate: isNaN(parseInt(self.compRef.val())) ? new Date() : false,
            opened: false
        });
        this.afterPluginInit();
        if (this.value) {
            this.setValue(new Date(this.value));
        }

        // debugger;
        this.compRef.on('keyup', (e) => {
            this.compRef.trigger('binddate.xdsoft');
            setTimeout(() => {
                this.onChangeDateTime.emit();
            });
        });
    }

    private bindEventsToEmitters() {
        let self = this;

        return {
            onSelectDate: function (e) {
                self.onSelectDate.emit(e);
                this.selectedDate = e;
                self.onAnyEvent.emit();
            },
            onSelectTime: function (e) {
                self.onSelectTime.emit(e);
                self.onAnyEvent.emit();
            },
            onChangeDateTime: function (e) {
                self.selectedDate = e;
                self.onChangeDateTime.emit(e);
                self.onAnyEvent.emit();
                // for display input mask, if date not selected
                if(e === null) {
                    this.setOptions({startDate: isNaN(parseInt(self.compRef.val())) ? new Date() : false, opened: false});
                }
            },
            onChangeMonth: function (e) {
                self.setValue(self.compRef.data('xdsoft_datetimepicker').getValue());
                this.selectedDate = e;
                self.onChangeMonth.emit(e);
                self.onAnyEvent.emit();
            },
            onChangeYear: function (e) {
                self.setValue(self.compRef.data('xdsoft_datetimepicker').getValue());
                this.selectedDate = e;
                self.onChangeYear.emit(e);
                self.onAnyEvent.emit();
            },
            onClick: function (e) {
                self.onClick.emit(e);
                self.onAnyEvent.emit();
            },
            onClose: function () {
                // this.setOptions({value: isNaN(parseInt(self.compRef.val())) ? new Date() : false, opened: false});
                // this.trigger('generate.xdsoft');
                // console.log('closed')
            },
            onShow: function (e, b) {
                if (b && b[0]) {
                    if ($(b[0]).is(":visible")) {
                        $(".xdsoft_datetimepicker").appendTo("body .common-app-wrapper");
                        // this.setOptions({value: isNaN(parseInt(self.compRef.val())) ? new Date() : false});
                        // $(self.compRef).trigger('generate.xdsoft');
                        // this.trigger('generate.xdsoft');
                        // /*debugger*/;
                        self.onShow.emit(e);
                        self.onAnyEvent.emit();
                    }
                } else {
                    $(".xdsoft_datetimepicker").appendTo("body .common-app-wrapper");
                    // this.setOptions({value: isNaN(parseInt(self.compRef.val())) ? new Date() : false});
                    // $(self.compRef).trigger('generate.xdsoft');
                    // this.trigger('generate.xdsoft');
                    // /*debugger*/;
                    self.onShow.emit(e);
                    self.onAnyEvent.emit();
                }
            },
            // onGenerate: function (time, input) {
            //     debugger
            //
            //
            //     //
            //     // console.log('generated', isNaN(parseInt(self.compRef.val())) ? new Date() : false);
            //     // self.onGenerate.emit(view);
            //     // self.onAnyEvent.emit();
            // }
        };
    }

    private afterPluginInit() {
        let self = this;
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            let res = event.translations.common;
            let options = {};
            options['dayOfWeekStart'] = res.date_day_of_week_start;
            options['dayOfWeekShort'] = res.date_day_of_week_start;
            options['dayOfWeek'] = res.date_day_of_week_start;
            options['format'] = res.date_full_format;
            options['formatDate'] = res.date_format;
            options['formatTime'] = res.time_format;
            if (this.timepicker && !this.datepicker) {
                options['format'] = res.time_format;
            } else if (!this.timepicker && this.datepicker) {
                options['format'] = res.date_format;
            } else {
                options['format'] = res.date_full_format;
            }
            if (!options['i18n']) {
                options['i18n'] = {};
            }
            options['i18n']['en'] = {
                months: res.months,
                dayOfWeek: res.dayOfWeek
            };
            self.setOptions(options);
        });
    }

    private beforePluginInit(opts) {
        // Prepare date
        if (opts.allowBlank === false) {
            let cd = new Date();
            cd.setHours(0);
            cd.setMinutes(0);
            cd.setSeconds(0);
            cd.setMilliseconds(0);

            opts.value = cd;
            opts.defaultTime = cd;
            opts.startDate = cd;

        }

        return opts;
    }
}
