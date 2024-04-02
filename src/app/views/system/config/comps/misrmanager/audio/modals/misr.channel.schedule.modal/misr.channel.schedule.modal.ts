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
import { MisrAudioService } from '../../service/misr.audio.service';
import { IMFXControlsLookupsSelect2Component } from 'app/modules/controls/select2/imfx.select2.lookups';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'app/modules/notification/services/notification.service';
import { SlickGridRequestError } from 'app/modules/search/slick-grid/types';
import {Select2ConvertObject, Select2ItemType} from 'app/modules/controls/select2/types';
import { IMFXControlsSelect2Component } from 'app/modules/controls/select2/imfx.select2';
import { MisrAudioComponent } from '../../misr.audio.comp';
import { TimeCodeFormat } from 'app/utils/tmd.timecode';
import {
    CollectionLookupsComp,
    CollectionLookupsStructureType,
    CollectionLookupsObjectType
} from "app/modules/controls/collection.lookups/collection.lookups.comp";
import { CollectionLookupComp } from 'app/modules/controls/collection.lookup/collection.lookup.comp';
import { CacheManagerAvailableTypes } from '../../../../cachemanager/common/cm.common.service';
import {map} from "rxjs/operators";
import {HttpService} from "../../../../../../../../services/http/http.service";


@Component({
    selector: 'misr-channel-schedule-modal',
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

export class MisrChannelScheduleModal {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    public context: MisrAudioComponent;
    @ViewChild('timecodeFormatControl', {static: false}) private timecodeFormatControl: IMFXControlsSelect2Component;
    @ViewChild('requirementsControl', {static: false}) private requirementsControl: IMFXControlsSelect2Component;
    @ViewChild('AudioRequirementsControl', {static: false}) private AudioRequirementsControl: CollectionLookupsComp;
    @ViewChild('AudioRequirementsShortFormControl', {static: false}) private AudioRequirementsShortFormControl: CollectionLookupsComp;
    @ViewChild('SubsRequirementsControl', {static: false}) private SubsRequirementsControl: CollectionLookupsComp;

    public self = this;
    public modalRef: any;
    public lookups: any;
    public itemData;
    public itemChannelSchedule: any;
    public channelScheduleData: any;
    public translate: TranslateService;
    public cdr: ChangeDetectorRef;
    public service: MisrAudioService;
    public notificationService: NotificationService;

    private saveName: CacheManagerAvailableTypes = 'channelschedule';
    private groupProp = 'SubGroupIdx';

    AR_LookupsObjects: CollectionLookupsObjectType[] = [];
    ARSF_LookupsObjects: CollectionLookupsObjectType[] = [];
    SR_LookupsObjects: CollectionLookupsObjectType[] = [];

    matchRules = {
        LangCode: {key: 'Code', text: 'Value'}
    };

    //changing FLAGS value via checkbox (1 - false, 3 - true)
    set comboChannel(val: boolean) {
        if(this.itemChannelSchedule) {
            this.itemChannelSchedule.FLAGS = val ? 3 : 1;
        }
    }
    get comboChannel() {
        if(!this.itemChannelSchedule) {
            return false;
        }

        if(this.itemChannelSchedule.FLAGS == 3) {
            return true;
        } else {
            return false
        }
    }

    constructor(
        public injector: Injector,
        public httpService: HttpService
    ) {
        this.modalRef = this.injector.get('modalRef');
        this.cdr = this.injector.get(ChangeDetectorRef);
        this.translate = this.injector.get(TranslateService);
        this.notificationService = this.injector.get(NotificationService);
        this.service = this.injector.get(MisrAudioService);
        this.translate = this.injector.get(TranslateService);
        let d = this.modalRef.getData();
        this.itemData = MisrChannelScheduleModal._deepCopy(d.itemData.data);
        this.context = d.context;
        this.channelScheduleData = this.context.data.channelScheduleData;
        this.itemChannelSchedule = MisrChannelScheduleModal._deepCopy(this.channelScheduleData.ChannelSchedule);
        // this.lookups = this.prepareLookups(this.context.data.lookups);
        this.lookups = {
            timecode: TimeCodeFormat.getArray(),
            applyRequirements: this.prepareLookups(this.channelScheduleData.ItemSourceLookup),
            language: this.prepareLookups(this.channelScheduleData.LanguageLookup, this.matchRules.LangCode),
            ms: this.prepareLookups(this.channelScheduleData.MsLookup),
            contentType:this.prepareLookups(this.channelScheduleData.ContentTypeLookup)
        }; //mock

        this.service.path = 'config/misr';
        this.entryLookups();
    }

    entryLookups() {
        this.AR_LookupsObjects = [
            {controlType: 'lookups-select2', lookupData: this.lookups.language, idField: 'LangCode', fetchLookup: true, displayLabel:'Language'},
            {controlType: 'lookups-select2', lookupData: this.lookups.ms, idField: 'MsCode', fetchLookup: true, displayLabel:'M/S'},
            {controlType: 'lookups-select2', lookupData: this.lookups.contentType, idField: 'ContentType', fetchLookup: true, displayLabel:'Content Type'},
            {controlType: 'checkbox', idField: 'Non100pc', displayLabel:'Non 100%'}
        ];
        this.ARSF_LookupsObjects = [
            {controlType: 'lookups-select2', lookupData: this.lookups.language, idField: 'LangCode', fetchLookup: true, displayLabel:'Language'},
            {controlType: 'lookups-select2', lookupData: this.lookups.ms, idField: 'MsCode', fetchLookup: true, displayLabel:'M/S'},
            {controlType: 'lookups-select2', lookupData: this.lookups.contentType, idField: 'ContentType', fetchLookup: true, displayLabel:'Content Type'},
            {controlType: 'checkbox', idField: 'Non100pc', displayLabel:'Non 100%'}
        ];
        this.SR_LookupsObjects = [
            {controlType: 'lookups-select2', lookupData: this.lookups.language, idField: 'LangCode', fetchLookup: true, displayLabel:'Language'}
        ];
    }

    prepareLookups(lookups, format: Select2ConvertObject = {key: 'Id', text: 'Value'}) {
        let result;
        if (Array.isArray(lookups)) {
            result = lookups.map(el => (<Select2ItemType>{id:el[format.key], text: el[format.text]}));
        }
        return result;
    }

    prepareCollectionLookupsSavingData(items: CollectionLookupsStructureType, lookups: CollectionLookupsObjectType[]) {
        let resArr = [];

        for (let k in items) {
            for (let k1 in items[k]) {
                const item = {};
                item[this.groupProp] = k;
                for (let k2 in items[k][k1].values) {
                    const val = <any>(items[k][k1].values[k2][0])
                    item[this.AR_LookupsObjects[k2].idField] = isNaN(val - 0) || (typeof val == 'boolean')
                        ? val
                        : val - 0;
                }
                resArr.push(item);
            }
        }

        return resArr;
    }

    ngAfterViewInit() {
        this.toggleOverlay(false);
        this.cdr.markForCheck();
        this.entryControls();
    }

    entryControls() {
        const auReqItems = this.itemChannelSchedule['AudioRequirements'] || [];
        this.AudioRequirementsControl.onReady.subscribe(() => {
            const controlRef: CollectionLookupsComp = this.AudioRequirementsControl;
            controlRef.update(auReqItems, this.groupProp);
        });

        const auReqShortItems = this.itemChannelSchedule['AudioShortFormRequirements'] || [];
        this.AudioRequirementsShortFormControl.onReady.subscribe(() => {
            const controlRef: CollectionLookupsComp = this.AudioRequirementsShortFormControl;
            controlRef.update(auReqShortItems, this.groupProp);
        });

        const sReqItems = this.itemChannelSchedule['SubsRequirements'] || [];
        this.SubsRequirementsControl.onReady.subscribe(() => {
            const controlRef: CollectionLookupsComp = this.SubsRequirementsControl;
            controlRef.update(sReqItems, this.groupProp);
        });
    }

    isValid(): boolean {
        let valid: boolean = true;

        return valid;
    }

    saveData() {
        if (!this.isValid()) {
            return;
        }

        const auReq = this.prepareCollectionLookupsSavingData(this.AudioRequirementsControl.getStructure(), this.AR_LookupsObjects);
        const auSFReq = this.prepareCollectionLookupsSavingData(this.AudioRequirementsShortFormControl.getStructure(), this.ARSF_LookupsObjects);
        const sReq = this.prepareCollectionLookupsSavingData(this.SubsRequirementsControl.getStructure(), this.SR_LookupsObjects)
            .map(el => ({LangCode: el.LangCode, SubGroupIdx: 1, MsCode: 0, ContentType: 0, Non100pc: false}));

        // console.log(
        //     this.itemChannelSchedule['AudioRequirements'],
        //     auReq
        // );
        // console.log(
        //     this.itemChannelSchedule['AudioShortFormRequirements'],
        //     auSFReq
        // );
        // console.log(
        //     this.itemChannelSchedule['SubsRequirements'],
        //     sReq
        // );

        this.itemChannelSchedule['REQ_MODE'] = this.requirementsControl.getSelectedId();
        this.itemChannelSchedule['TC_FORMAT'] = this.timecodeFormatControl.getSelectedId();

        this.itemChannelSchedule['AudioRequirements'] = auReq;
        this.itemChannelSchedule['AudioShortFormRequirements'] = auSFReq;
        this.itemChannelSchedule['SubsRequirements'] = sReq;

        this.toggleOverlay(true);

        this.service.save(this.saveName, this.itemChannelSchedule).subscribe(() => {
            this.toggleOverlay(true);
            this.context.getTable(false);
            this.closeModal();
            this.notificationService.notifyShow(1, this.translate.instant('global_settings.success'));
        }, (err) => {
            this.toggleOverlay(false);
            this.notificationService.notifyShow(2, (err.error.Error) ? (err.error.Error + '(' + err.error.ErrorDetails + ')') : err.statusText);
        });
    }

    public onUpdateControl($event) {

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
