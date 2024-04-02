import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MisrAudioService} from '../../service/misr.audio.service';
import {IMFXControlsLookupsSelect2Component} from 'app/modules/controls/select2/imfx.select2.lookups';
import {TranslateService} from '@ngx-translate/core';
import {NotificationService} from 'app/modules/notification/services/notification.service';
import {MisrAudioComponent} from "../../misr.audio.comp";
import {SlickGridRequestError} from 'app/modules/search/slick-grid/types';
import {Select2ItemType} from 'app/modules/controls/select2/types';
import {IMFXControlsSelect2Component} from "../../../../../../../../modules/controls/select2/imfx.select2";
import {IMFXControlsDateTimePickerComponent} from "../../../../../../../../modules/controls/datetimepicker/imfx.datetimepicker";


@Component({
    selector: 'misr-audio-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MisrAudioService
    ]
})

export class MisrAudioModal {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    public context: MisrAudioComponent;
    // public saveName = 'channels';
    // public saveName: CacheManagerAvailableTypes = 'TM_CFG_MISR_ITEMS';
    // public freeFields: string[] = [
    //     'SOURCE_PRIOITY', 'SOURCE_STATUS', 'id', 'MODIFIED_DT', 'MODIFIED_BY'
    // ];
    @ViewChild('countryControl', {static: false}) private countryControl: IMFXControlsSelect2Component;
    @ViewChild('languagesControl', {static: false}) private languagesControl: IMFXControlsSelect2Component;
    @ViewChild('timeZoneControl', {static: false}) private timeZoneControl: IMFXControlsSelect2Component;
    @ViewChild('startTimeControl', {static: false}) private startTimeControl: IMFXControlsDateTimePickerComponent;
    @ViewChild('CMTemplateControl', {static: false}) private CMTemplateControl: IMFXControlsSelect2Component;
    @ViewChild('MISRTemplateControl', {static: false}) private MISRTemplateControl: IMFXControlsSelect2Component;
    @ViewChild('locationControl', {static: false}) private locationControl: IMFXControlsSelect2Component;

    public self = this;
    public modalRef: any;
    public isNew;
    public lookups: any;
    public itemData;
    public freeFields: string[] = [];
    public translate: TranslateService;
    public cdr: ChangeDetectorRef;
    public service: MisrAudioService;
    public notificationService: NotificationService;

    constructor(public injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.cdr = this.injector.get(ChangeDetectorRef);
        this.translate = this.injector.get(TranslateService);
        this.notificationService = this.injector.get(NotificationService);
        this.service = this.injector.get(MisrAudioService);
        this.translate = this.injector.get(TranslateService);
        let d = this.modalRef.getData();
        this.itemData = d.isNew ? {} : MisrAudioModal._deepCopy(d.itemData.data);
        this.isNew = d.isNew;
        this.context = d.context;
        this.lookups = this.prepareLookups(this.context.data.lookups);
    }

    ngAfterViewInit() {
        this.toggleOverlay(false);
        // this.countryControl.setSelectedByIds(this.itemData['OP_CNTRY_ID']);
        // this.languagesControl.setSelectedByIds([this.itemData['DEF_LANG_ID']]);
        // this.timeZoneControl.setSelectedByIds([this.itemData['DEF_LANG_ID']]);
        // this.CMTemplateControl.setSelectedByIds([this.itemData['CH_TEMPLATE_ID']]);
        // this.MISRTemplateControl.setSelectedByIds([this.itemData['MISR_TEMPLATE_ID']]);
        // this.locationControl.setSelectedByIds([this.itemData['AUDIO_CONTENT_TYPE']]);
        this.cdr.markForCheck();
    }

    // CM_TEMPLATE_ID
    // DEF_LANG_ID
    // LOCATION
    // MISR_TEMPLATE_ID
    // OP_CNTRY_ID
    // TIME_ZONE
    prepareLookups(lookups) {
        let result = {};
        for (let key in lookups) {
            if (Array.isArray(lookups[key])) {
                result[key] = lookups[key].map(el => (<Select2ItemType>{id: el.ID, text: el.Name}));
            }
        }
        return result;
    }

    isValid(): boolean {
        let valid: boolean = true;
        // if (this.itemData['DEVICE_ID'] == null) {
        //     valid = false;
        //     return valid;
        // }
        // $.each(this.itemData, (k, v) => {
        //     if (v === '' || v == undefined) {
        //         if (this.freeFields.indexOf(k) > -1) {
        //             return true;
        //         }
        //         valid = false;
        //         return false;
        //     }
        // });

        return valid;
    }

    public onUpdateControl(controlRefStr, field: string) {
        // if (controlRefStr === 'devicesControl') {
        //     this.itemData['DeviceName'] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedText()[0];
        // }
        this.itemData[field] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedId();
    }

    onChangeDateTime($event, controlRefStr, field: string) {
        this.itemData[field] = (this[controlRefStr] as IMFXControlsDateTimePickerComponent).getValueAsJSON();
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalWrapperEl.nativeElement).show();
        } else {
            $(this.modalWrapperEl.nativeElement).hide();
        }
        this.cdr.markForCheck();
    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        if (!this.isValid()) {
            return;
        }
        if (this.itemData['ID'] == null) {
            this.itemData['ID'] = 0;
        }
        this.toggleOverlay(true);
        this.service.save(this.context.saveName, this.itemData).subscribe(() => {
            this.toggleOverlay(true);
            this.context.getTable(false);
            this.closeModal();
        }, (err: { error: SlickGridRequestError }) => {
            this.toggleOverlay(false);
            this.notificationService.notifyShow(2, err.error.Error + '(' + err.error.ErrorDetails + ')');
        });
    }

    public static _deepCopy(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this._deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = Object.create(obj);
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this._deepCopy(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type is not supported.');
    }
}
