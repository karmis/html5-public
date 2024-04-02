import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../../../modules/controls/select2/imfx.select2.lookups';
import { CacheManagerDestinationDevicesComponent } from '../../destination-devices.comp';
import { CacheManagerCommonService } from '../../../common/cm.common.service';
import { CacheManagerCommonModal } from '../../../common/cm.common.modal';
import {forkJoin} from "rxjs";

@Component({
    selector: 'cm-dd-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        CacheManagerCommonService
    ]
})

export class CacheManagerDestinationDevicesModal extends CacheManagerCommonModal {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    public context: CacheManagerDestinationDevicesComponent;
    public freeFields: string[] = [
        'TX_SIZE_24_HOURS', 'PURGE_TIME', 'HIGH_WATER_ALARM', 'CACHE_STATUS_REPORT_PERIOD',
        'MAX_LOOK_AHEAD', 'PURGE_CM_ONLY', 'CACHE_STATUS', 'PURGE_STATUS', 'id', 'MODIFIED_DT', 'MODIFIED_BY'
    ];
    @ViewChild('devicesControl', {static: false}) private devicesControl: IMFXControlsLookupsSelect2Component;
    @ViewChild('purgePreset', {static: false}) private purgePreset: IMFXControlsLookupsSelect2Component;
    @ViewChild('purgePresetShrt', {static: false}) private purgePresetShrt: IMFXControlsLookupsSelect2Component;

    constructor(public injector: Injector) {
        super(injector);
    }

    ngAfterViewInit() {
        forkJoin([
            this.purgePreset.onReady,
            this.purgePresetShrt.onReady,
            this.devicesControl.onReady
        ]).subscribe((data) => {
            this.purgePreset.setSelectedByIds([this.itemData['PURGE_PRESET_ID']]);
            this.purgePresetShrt.setSelectedByIds([this.itemData['SF_PURGE_PRESET_ID']]);
            this.devicesControl.setSelectedByIds([this.itemData['DEVICE_ID']]);
            this.toggleOverlay(false);
            this.cdr.markForCheck();
        });
    }

    isValid(): boolean {
        let valid: boolean = true;
        if (this.itemData['PURGE_PRESET_ID'] == null || this.itemData['DEVICE_ID'] == null || this.itemData['SF_PURGE_PRESET_ID'] == null) {
            valid = false;
            return valid;
        }
        $.each(this.itemData, (k, v) => {
            if (v === '' || v == undefined) {
                if (this.freeFields.indexOf(k) > -1) {
                    return true;
                }
                valid = false;
                return false;
            }
        });
        return valid;
    }

    public onUpdateControl(controlRefStr, field: string) {
        if (controlRefStr === 'devicesControl') {
            this.itemData['DeviceName'] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedText()[0];
        }
        this.itemData[field] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedId();
    }
}
