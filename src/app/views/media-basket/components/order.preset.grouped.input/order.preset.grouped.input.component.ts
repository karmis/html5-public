/**
 * Created by Ivan Banan on 17.02.2020.
 */
import {
    Component,
    Input,
    ViewEncapsulation,
    Output,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ViewChild, ElementRef, EventEmitter
} from '@angular/core';
import { OrderPresetsGroupedComponent } from '../../../../modules/order-presets-grouped/order.presets.grouped.component';
import { PresetType } from '../../../../modules/order-presets-grouped/types';
import {Observable, Subject} from 'rxjs';

@Component({
    selector: 'order-preset-grouped-input',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class OrderPresetGroupedInputComponent {
    @ViewChild('inputDiv', {static: true}) public inputDivElRef: ElementRef;
    @ViewChild('tooltip', {static: true}) private tooltip: ElementRef;
    @ViewChild('orderPresetsGroupedComponent', {static: true}) private orderPresetsGroupedComponent: OrderPresetsGroupedComponent;
    @Input('dontLoadAfterViewInit') dontLoadAfterViewInit = false;
    @Input('value') set value(val: PresetType) {
        this.setValue(val);
        this._value = val;
    }
    private _allowClear: boolean = false;
    @Input('allow_clear') set allowClear(val: boolean) {
        this._allowClear = val
        // this.setValue(val);
        // this._value = val;
    }
    @Output() private onSelect: EventEmitter<any> = new EventEmitter<any>();
    private appEl: Element = document.querySelector('app .common-app-wrapper');
    protected isHiddenTooltip = true;
    private cancelEventListeners = [];
    private _value: PresetType;
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.appEl.appendChild(this.tooltip.nativeElement);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.removeDocumentCancelEventListeners();
        this.isHiddenTooltip = true;
        $(this.tooltip.nativeElement).remove();
        this.cdr.markForCheck();
    };

    getActivePreset(): PresetType {
        return this.orderPresetsGroupedComponent.getActivePreset();
    }

    getStyleForTooltip() {
        const appEl = this.appEl;
        const inputEl = this.inputDivElRef.nativeElement;

        let offset_c = appEl.getBoundingClientRect()
            , offset_i = inputEl.getBoundingClientRect();

        // let nesOffset = 0;

        // if (appEl.offsetWidth > offset_i.left + input.offsetWidth + tooltip.offsetWidth) {
        //     nesOffset = 0;
        // } else {
        //     nesOffset = input.offsetWidth + tooltip.offsetWidth;
        // }

        // tooltip.style.top = offset_i.top - offset_c.top + 'px';
        // tooltip.style.left = offset_i.left - offset_c.left + input.offsetWidth - nesOffset + 'px';

        return {
            'width': `${inputEl.offsetWidth}px`,
            'top': `${offset_i.top + inputEl.offsetHeight - offset_c.top}px`,
            'left': `${offset_i.left - offset_c.left}px`
        }
    }

    inputDivOnClick($event) {
        this.isHiddenTooltip = false;
        this.orderPresetsGroupedComponent.setFocusOnFilter();
        this.bindCancel($event);
    }

    hideTooltip() {
        this.isHiddenTooltip = true;
        this.cdr.markForCheck();
    }


    bindCancel($event) {
        let _this = this;

        let cb = function f(ev) {
            if ($event.target == ev.target
                || _this.tooltip.nativeElement.contains(ev.target)) {
                ev.stopPropagation();
                return;
            }
            if (_this.destroyed$.isStopped) {
                // document.removeEventListener('click', f);
                _this.removeDocumentCancelEventListeners();
                return;
            }

            _this.isHiddenTooltip = true;
            _this.cdr.detectChanges();
            _this.removeDocumentCancelEventListeners();
            // document.removeEventListener('click', f);
        };

        document.addEventListener('click', cb);
        this.cancelEventListeners.push(cb);
    }

    removeDocumentCancelEventListeners() {
        for (let item of this.cancelEventListeners) {
            document.removeEventListener('click', item);
        }
    }

    onClickByPresetItemEvent($event: PresetType) {
        this.setInputDivValue($event.Name);
        this.isHiddenTooltip = true;
        this.removeDocumentCancelEventListeners();
        this.onSelect.emit($event);
    }

    // may be defer
    setValue(preset: PresetType): void {
        const isSuccess = this.orderPresetsGroupedComponent.setPresetActive(preset);

        this.orderPresetsGroupedComponent.onReady.subscribe(val => {
            if (!val) {
                return;
            }

            this.setInputDivValue(preset.Name);
        });
    }

    // setValueById(id: number, async: boolean = false) {
    //
    // }

    setValueByIdAsync(id: number): Observable<boolean> {
        return new Observable(obs => {
            this.orderPresetsGroupedComponent.onReady.subscribe(val => {
                if (!val) {
                    return;
                }
                const item = this.orderPresetsGroupedComponent.getPresetById(id);

                if (item) {
                    this.setValue(item);
                    obs.next(true);
                } else {
                    obs.next(false);
                }
                obs.complete();
            });
        });
    }

    setInputDivValue(val: string = '') {
        this.inputDivElRef.nativeElement.innerText = val;
    }

    @Output('onClear') public onClear: EventEmitter<void> = new EventEmitter<void>();
    clear(withEmit: boolean = true) {
        this.orderPresetsGroupedComponent.clear();
        this.setInputDivValue('');
        if(withEmit) {
            this.onClear.emit();
        }
    }
}
