import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef, EventEmitter,
    Injector,
    Input, Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import * as $ from "jquery";
import 'script-loader!./libs/jquery.maskedinput.js';
import { FormControl, NgModel, Validators } from '@angular/forms';
import { TimeCodeFormat, TMDTimecode } from '../../../utils/tmd.timecode';
import {Subject} from "rxjs";
import { ClipboardProvider } from '../../../providers/common/clipboard.provider';
import { NativeNavigatorProvider } from 'app/providers/common/native.navigator.provider';

@Component({
    selector: 'timecode-input',
    templateUrl: './tpl/index.html',
    styleUrls: [
      './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TimecodeInputComponent {
    @ViewChild('inputElement', {static: false}) public inputElement: ElementRef;
    @ViewChild('inputModel', {static: false}) public inputModel: NgModel;
    @ViewChild('tooltip', {static: false}) private tooltip;
    // @ViewChild('field', {static: false}) private field;
    @Output() inputValueChange = new EventEmitter<string>();
    @Output() changedInputValue = new EventEmitter<object>();
    @Output() onKeyUpEvent = new EventEmitter<any>();
    @Output() goToTimecodeString = new EventEmitter<any>();
    @Output() onFocusEvent: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>()
    @Input() public inputValue: string = '';
    @Input() public timecodeFormat: string = null;
    @Input() public som: number = null;
    @Input() public eom: number = null;
    @Input() public enableValidation: boolean = true;
    @Input() public inputError: boolean = false;
    @Input() public isDisabledTooltip: boolean = false;
    @Input() public rowId: number = 0;
    @Input() reloadSomEom: Subject<any>;
    @Input() displayGoToTimecodeBtn: boolean = true;
    public mask = '99:99:99:99';
    public pattern = /^(?:(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d):)?(\d?\d)$/;
    protected visibleTooltip = false;
    protected storagePasteValue = null;
    protected storageInValue = null;
    protected storageOutValue = null;
    private destroyed$: Subject<any> = new Subject();

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private clipboardProvider: ClipboardProvider,
                private nativeNavigatorProvider: NativeNavigatorProvider) {
    }
    ngAfterViewInit(){
        let format = TimeCodeFormat[this.timecodeFormat];

        if(TMDTimecode.isDropFrame(format)) {
            this.mask = '99:99:99;99';
            this.pattern = /^(?:(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d);)?(\d?\d)$/;

            // toDo remake transform to valid (current decision is temporary)
            if(this.inputValue && !this.pattern.test(this.inputValue)) {
                let arr = this.inputValue.split('');
                arr[this.inputValue.lastIndexOf(':')] = ';';
                this.inputValue = arr.join('');
                // this.inputModel.control.setValue(this.inputValue);
                this.cdr.detectChanges(); //dirty hack
            }
        } else {
            // toDo remake transform to valid (current decision is temporary)
            if ( this.inputValue && !this.pattern.test(this.inputValue) ) {
                this.inputValue = this.inputValue.replace(';', ':');
                // this.inputModel.control.setValue(this.inputValue);
                this.cdr.detectChanges(); //dirty hack
            }
        }

        if(format !== undefined){
            this.inputModel.control.setValidators(
                [
                    this.formatValidator,
                    Validators.pattern(this.pattern),
                    this.videoSomEomValidator
                ]
            );

        } else {
            this.inputModel.control.setValidators(Validators.pattern(this.pattern));
        }

        //for make a first validation
        setTimeout(() => {
            if (!this.cdr['destroyed']) {
                this.cdr.detectChanges();
            }
        },0);

        (<any>$(this.inputElement.nativeElement)).mask(this.mask, {
            placeholder: '-',
            autoclear: false,
            completed:() => {
                this.visibleTooltip = false;
            }
        });
        this.reloadSomEom && this.reloadSomEom.subscribe(data => {
            this.setSomEom(data);
        });
    }
    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.reloadSomEom && this.reloadSomEom.unsubscribe();
    };


    onKeyUp($event){
        let value = $event.target.value;
        if ($event.which === 13 ||                              // enter
            ( $event.which >= 48 && $event.which <= 57) ||      // numbers
            ( $event.which >= 96 && $event.which <= 105) ||     // numbers
            $event.which == 127 ||                              // delete
            $event.which == 8 ||
            $event.ctrlKey && $event.which === 86) {            // ctrl + V
            this.setInputValue(value);
        }
        // this.onKeyUpEvent.emit({e: $event, error: this.inputModel.errors});
    }

    onClick($event){
    }

    onCopy($event) {
        this.visibleTooltip = false;
        if (typeof $event.target.value == 'string' && this.pattern.test($event.target.value)) {
            // this.storagePasteValue = $event.target.value;
            let st = this.clipboardProvider.pasteLocal();
            if(!st) {
                st = {pasteTc: $event.target.value};
            } else {
                st.pasteTc = $event.target.value;
            }
            this.clipboardProvider.copyLocal(st);
        }
    }

    onPaste($event) {
        this.visibleTooltip = false;
        let sv = this.getTimecodeStorageValue();
        if (!sv) {
            return;
        }
        if (typeof sv.pasteTc == 'string' && this.pattern.test(sv.pasteTc)) {
            this.storagePasteValue = sv.pasteTc;
        }
        this.setInputValue(this.storagePasteValue);
    }

    setInputValue (value) {
        // for Safari. fix for: lost input curson bug
        if (this.nativeNavigatorProvider.isSafari()) {
            const selectionStart = this.inputElement.nativeElement.selectionStart;
            const selectionEnd = this.inputElement.nativeElement.selectionEnd;
            setTimeout(() => {
                this.inputElement.nativeElement.selectionStart = selectionStart;
                this.inputElement.nativeElement.selectionEnd = selectionEnd;
            });
        }

        this.inputModel.control.setValue(value);
        this.cdr.detectChanges();
        this.inputValueChange.emit(value);
        this.changedInputValue.emit(this.inputModel.errors);
    }

    onBlur($event) {
        this.visibleTooltip = false;
        // Promise.resolve().then(() => {
        // setTimeout(() => {
        //     this.visibleTooltip = false;
        //     this.cdr.detectChanges();
        // },100);
    }

    onFocus($event) {
        this.onFocusEvent.emit($event);
        let sv = this.getTimecodeStorageValue();
        // let valid = typeof sv == 'string' && this.pattern.test(sv);
        if (!sv) {
            return;
        }
        if (typeof sv.pasteTc == 'string' && this.pattern.test(sv.pasteTc)) {
            this.storagePasteValue = sv.pasteTc;
        }
        if (typeof sv.inTc == 'string' && this.pattern.test(sv.inTc)) {
            this.storageInValue = sv.inTc;
        }
        if (typeof sv.outTc == 'string' && this.pattern.test(sv.outTc)) {
            this.storageOutValue = sv.outTc;
        }
        if (this.storagePasteValue === null &&
            this.storageInValue === null &&
            this.storageOutValue === null) {
            return;
        }
        this.doVisibleTooltip();
        this.bindCancel($event);
    }

    bindCancel($event) {
        let self = this;

        let cb = function f(ev) {
            if ($event.target == ev.target
                || $event.target.parentElement.contains(ev.target)) {
                ev.stopPropagation();
                return;
            }
            if (self.destroyed$.isStopped) {
                document.removeEventListener('click', f);
                return;
            }

            self.visibleTooltip = false;
            self.cdr.detectChanges();
            document.removeEventListener('click', f);
        };

        document.addEventListener('click', cb);
    }

    doVisibleTooltip() {
        this.visibleTooltip = true;
        this.cdr.detectChanges();

        let cont: any = document.querySelector('app > div')  //must be position:relative
            , tooltip = this.tooltip.nativeElement
            , input = this.inputElement.nativeElement;

        if (!cont) {
            return;
        }

        let offset_c = cont.getBoundingClientRect()
            , offset_i = input.getBoundingClientRect();

        let nesOffset;

        if (cont.offsetWidth > offset_i.left + input.offsetWidth + tooltip.offsetWidth) {
            nesOffset = 0;
        } else {
            nesOffset = input.offsetWidth + tooltip.offsetWidth;
        }

        cont.appendChild(tooltip);
        tooltip.style.top = offset_i.top - offset_c.top + 'px';
        tooltip.style.left = offset_i.left - offset_c.left + input.offsetWidth - nesOffset + 'px';
    }

    tooltipOnMouseDown($event, val) {
        this.setInputValue(val);
        this.visibleTooltip = false;
        //fix for ff/safari px-3826
        Promise.resolve().then(() => {
            this.cdr.detectChanges();
        });

    }

    getTimecodeStorageValue() {
        return this.clipboardProvider.pasteLocal() || null;
    }

    getIsValid(){
        return this.inputModel.control.valid;
    }

    formatValidator = (control: FormControl) => {
        let condition
            ,format = TimeCodeFormat[this.timecodeFormat];

        if(format !== undefined){
            condition = TMDTimecode.isValidTimecode(control.value, format);
            if (!condition) {
                return {formatValidator: 'does not match the format'};
            }
        }

        return null;
    };

    videoSomEomValidator = (control: FormControl) => {
        if( this.som == null || this.som == undefined || this.eom == null || this.eom == undefined || !this.eom) return null;  // som, eom not set
        let currentValFrames = TMDTimecode.stringToFrames(control.value, TimeCodeFormat[this.timecodeFormat]);
        if (currentValFrames >= this.som && currentValFrames <= this.eom) {
            return null;
        }
        return {formatValidator: 'does not match the start or end video timecode'};
    };

    setSomEom(data) {
        this.som = data.videoSom;
        this.eom = data.videoEom;
    }
    goToTimecode() {
        this.goToTimecodeString.emit();
    }
}
