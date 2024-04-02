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
import { CacheManagerSourceDevicesComponent } from '../../source-devices.comp';
import { CacheManagerCommonService } from '../../../common/cm.common.service';
import { CacheManagerCommonModal } from '../../../common/cm.common.modal';

@Component({
    selector: 'cm-sd-modal',
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

export class CacheManagerSourceDevicesModal extends CacheManagerCommonModal {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    public context: CacheManagerSourceDevicesComponent;
    @ViewChild('devicesControl', {static: false}) private devicesControl: IMFXControlsLookupsSelect2Component;
    public freeFields: string[] = [
        'SOURCE_PRIOITY', 'SOURCE_STATUS', 'id', 'MODIFIED_DT', 'MODIFIED_BY'
    ];

    constructor(public injector: Injector) {
        super(injector);
    }

    ngAfterViewInit() {
        this.toggleOverlay(false);
        this.devicesControl.setSelectedByIds([this.itemData['DEVICE_ID']]);
        this.cdr.markForCheck();
    }

    isValid(): boolean {
        let valid: boolean = true;
        if (this.itemData['DEVICE_ID'] == null) {
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
