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
import { IMFXControlsLookupsSelect2Component } from '../../../../../../../../modules/controls/select2/imfx.select2.lookups';
import { MisrComponentsComponent } from '../../misr.components.comp';
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../../../../modules/notification/services/notification.service";
import { SlickGridRequestError } from "../../../../../../../../modules/search/slick-grid/types";
import { MisrCommonService } from '../../../common/misr.common.service';


@Component({
    selector: 'misr-components-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MisrCommonService
    ]
})

export class MisrComponentsModal {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    public context: MisrComponentsComponent;
    public saveName = 'TM_CFG_MISR_ITEMS';
    // public saveName: CacheManagerAvailableTypes = 'TM_CFG_MISR_ITEMS';
    // public freeFields: string[] = [
    //     'SOURCE_PRIOITY', 'SOURCE_STATUS', 'id', 'MODIFIED_DT', 'MODIFIED_BY'
    public self = this;
    public modalRef: any;
    public isNew;
    public itemData;
    public freeFields: string[] = [];
    public translate: TranslateService;
    public cdr: ChangeDetectorRef;
    public service: MisrCommonService;
    public notificationService: NotificationService;
    // ];
    @ViewChild('mediaTypeControl', {static: false}) private mediaTypeControl: IMFXControlsLookupsSelect2Component;
    @ViewChild('storageDeviceControl', {static: false}) private storageDeviceControl: IMFXControlsLookupsSelect2Component;
    @ViewChild('mediaFileTypeControl', {static: false}) private mediaFileTypeControl: IMFXControlsLookupsSelect2Component;
    @ViewChild('usageTypeControl', {static: false}) private usageTypeControl: IMFXControlsLookupsSelect2Component;
    @ViewChild('audioContentTypeControl', {static: false}) private audioContentTypeControl: IMFXControlsLookupsSelect2Component;

    constructor(public injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.cdr = this.injector.get(ChangeDetectorRef);
        this.translate = this.injector.get(TranslateService);
        this.notificationService = this.injector.get(NotificationService);
        this.service = this.injector.get(MisrCommonService);
        this.translate = this.injector.get(TranslateService);
        let d = this.modalRef.getData();
        this.itemData = d.isNew ? {} : d.itemData.data;
        this.isNew = d.isNew;
        this.context = d.context;
    }

    ngAfterViewInit() {
        this.toggleOverlay(true);
        const lookups: any = this.context.res.Lookups;
        this.mediaTypeControl.turnAndSetData(lookups['MEDIA_TYPE'], {key: 'ID', text: 'Name'}, [this.itemData['MEDIA_TYPE']]);
        this.storageDeviceControl.turnAndSetData(lookups['STORAGE_ID'], {key: 'ID', text: 'Name'}, [this.itemData['STORAGE_ID']]);
        this.mediaFileTypeControl.turnAndSetData(lookups['MI_FILE_TYPE'], {key: 'ID', text: 'Name'}, [this.itemData['MI_FILE_TYPE']]);
        this.usageTypeControl.turnAndSetData(lookups['USAGE_TYPE'], {key: 'ID', text: 'Name'}, [this.itemData['USAGE_TYPE']]);
        this.audioContentTypeControl.turnAndSetData(lookups['AUDIO_CONTENT_TYPE'], {key: 'ID', text: 'Name'}, [this.itemData['AUDIO_CONTENT_TYPE']]);
        this.cdr.markForCheck();
        this.toggleOverlay(false);
    }

    isValid(): boolean {
        return !!this.itemData['NAME'];
    }

    public onUpdateControl(controlRefStr, field: string) {
        // if (controlRefStr === 'devicesControl') {
        //     this.itemData['DeviceName'] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedText()[0];
        // }
        this.itemData[field] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedId();
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
}
