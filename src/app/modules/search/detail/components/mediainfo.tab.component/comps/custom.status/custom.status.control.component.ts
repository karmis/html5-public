import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IMFXControlsSelect2Component } from 'app/modules/controls/select2/imfx.select2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'custom-status-ctrl-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class CustomStatusControlComponent {
    @Input('cuStatSettingsItem') cuStatSettingsItem;
    @Input('cuStatLookupItem') cuStatLookupItem;
    @Input('cuStatValueItem') cuStatValueItem;
    @Input('commonReadOnly') commonReadOnly;
    @Input('commonValidationEnabled') commonValidationEnabled;
    @ViewChild('statusSelect', {static: false}) public statusSelect: IMFXControlsSelect2Component;
    @Output() updatedStatValue: EventEmitter<any> = new EventEmitter();
    private destroyed$ = new Subject();

    constructor(protected cdr: ChangeDetectorRef,
                protected injector: Injector) {

    }

    // private _config: any;
    //
    // get config(): any {
    //     return this._config;
    // }
    //
    // @Input('config') set config(_config: any) {
    //     this._config = _config;
    // }

    ngOnInit() {

    }

    // ngDoCheck() {
    //     console.log('ngDoCheck', arguments);
    // }

    ngOnChanges(simpleChangesObj) {
        let needRefresh = false;
        let needReinit = false;

        if (simpleChangesObj.commonReadOnly && !simpleChangesObj.commonReadOnly.firstChange) {
            this.statusSelect.setDisabled(this.commonReadOnly || this.cuStatSettingsItem.Readonly);
            needRefresh = true;
        }
        if (simpleChangesObj.isMultiSelect && !simpleChangesObj.isMultiSelect.firstChange) {
            //@ts-ignore
            this.statusSelect.multiple = simpleChangesObj.isMultiSelect.currentValue;
            //@ts-ignore
            this.statusSelect.withCheckboxes = simpleChangesObj.isMultiSelect.currentValue;
            needReinit = true;
        }
        if (simpleChangesObj.cuStatValueItem && !simpleChangesObj.cuStatValueItem.firstChange) {
            this.fillStatusValues();
            needRefresh = true;
        }

        needRefresh && !needReinit && this.statusSelect.refresh();
        needReinit && this.statusSelect.reinitPlugin();
    }

    ngAfterViewInit() {
        //toDo temporaty fix for IE, Safari px-3746
        Promise.resolve().then(() => {
            this.fillStatusLookups();
            this.fillStatusValues();
        });

    };

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    fillStatusLookups(
        // statusSelect: IMFXControlsSelect2Component, item
    ) {
        let lookup = this.cuStatLookupItem;
        // let lookup = this.getLookupBySettings(item.MediaStatusId);
        //
        // if(!lookup) {
        //     return;
        // }

        let items = this.statusSelect.turnArrayOfObjectToStandart(lookup.Lookup, {
            key: 'ID',
            text: 'Name'
        });

        // it's necessary duration to apply jQuery to nativeElement
        // setTimeout(() => {
        //     statusSelect.setData(items, true);
        //     this.fillStatusValues(statusSelect, lookup.Id);
        // });
        this.statusSelect.onReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.statusSelect.setData(items, true);
                this.statusSelect.setDisabled(this.commonReadOnly || this.cuStatSettingsItem.Readonly);
                this.statusSelect.refresh();
                this.checkValidation();
                // this.fillStatusValues(this.statusSelect, lookup.Id);
            });
    }

    fillStatusValues(
        // statusSelect: IMFXControlsSelect2Component, id
    ) {
        // if (!Array.isArray(this.config.CustomStatuses)) {
        //     return;
        // }

        // let valObj = this.config.CustomStatuses.find(el => el.TypeId == id);

        this.statusSelect.onReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
            let valObj = this.cuStatValueItem;

            if (valObj && valObj.Values.length) {
                this.statusSelect.setSelectedByIds(valObj.Values, true);
            } else {
                this.statusSelect.clearSelect();
            }
            this.checkValidation();
        });
    }

    onUpdateStatusValue($event, statusSelect) {
        let ssId = this.cuStatSettingsItem.MediaStatusId;

        let svObj = {
            TypeId: ssId,
            Values: []
        };

        // let val = this.secondSelector.getSelectedId() as any;
        // val = (Array.isArray(val))
        //     ? val.map(el => el - 0)
        //     : [val - 0];

        let newData = ($event.params.data.length > 0)
            ? $event.params.data.map(el => el.id - 0)
            : [];

        svObj.Values = newData;

        this.cuStatValueItem = svObj;
        this.updatedStatValue.emit(svObj);
        this.checkValidation();
    }

    checkValidation() {
        let selected = this.statusSelect.getSelectedId()
            ,isNotSelected = !selected || (Array.isArray(selected) && selected.length === 0);
        let isValid = true;

        if(this.commonReadOnly) {
            isValid = true;
        } else if (this.commonValidationEnabled
            && this.cuStatSettingsItem.Mandatory
            && isNotSelected) {
            isValid = false;
        }

        this.statusSelect.setValidation(isValid);

        return isValid;
    }

}
