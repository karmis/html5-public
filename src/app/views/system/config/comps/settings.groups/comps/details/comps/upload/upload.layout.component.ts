/**
 * Created by dvvla on 28.09.2017.
 */

import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Select2ItemType } from '../../../../../../../../../modules/controls/select2/types';
import { BasketService } from '../../../../../../../../../services/basket/basket.service';
import {
    IMFXControlsSelect2Component,
    Select2EventType
} from '../../../../../../../../../modules/controls/select2/imfx.select2';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../../../../modules/controls/select2/imfx.select2.lookups';
import { forkJoin, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UploadDefaultMethodSettings, UploadGroupSettings } from "../../../../../../../../../modules/upload/types";
import { UploadAssociateMode } from "../../../../../../../../../modules/upload/upload";
import { HttpService } from '../../../../../../../../../services/http/http.service';
import { IMFXModalComponent } from '../../../../../../../../../modules/imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../../../../../app.routes';
import { IMFXModalPromptComponent } from '../../../../../../../../../modules/imfx-modal/comps/prompt/prompt';
import { IMFXModalEvent } from '../../../../../../../../../modules/imfx-modal/types';
import { IMFXModalProvider } from '../../../../../../../../../modules/imfx-modal/proivders/provider';

@Component({
    selector: 'settings-groups-detail-upload-layout',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        //SettingsGroupsService
    ]
})

export class SettingsGroupsDetailsUploadLayoutComponent implements OnInit {
    // private consumerItem: any = {};
    @ViewChild('controlWorkflowPresetId', {static: false}) public controlWorkflowPresetId: IMFXControlsSelect2Component;
    @ViewChild('controlMediaFileTypes', {static: false}) public controlMediaFileTypes: IMFXControlsSelect2Component;
    @ViewChild('controlAspectRatioTypes', {static: false}) public controlAspectRatioTypes: ElementRef;
    @ViewChild('controlTvStandard', {static: false}) public controlTvStandard: ElementRef;
    @ViewChild('controlUsageTypes', {static: false}) public controlUsageTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlItemTypes', {static: false}) public controlItemTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlDeviceTypes', {static: false}) public controlDeviceTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('uploadMediaVersion', {static: false}) public uploadMediaVersion: ElementRef;
    @ViewChild('metadataModeVersion', {static: false}) public metadataModeVersion: ElementRef;
    @ViewChild('metadataModeMedia', {static: false}) public metadataModeMedia: ElementRef;
    @ViewChild('uploadMediaTitle', {static: false}) public uploadMediaTitle: ElementRef;
    @Input('type') type: 'upload' | 'login' = 'upload';
    public settings = {};
    // @Output('uploadSettingsData') private uploadSettingsData: EventEmitter<any> = new EventEmitter<any>();
    // @ViewChild('consumerDetailSettingsComponent', {static: false}) private consumerDetailSettingsComponent: ConsumerDetailSettingsComponent;
    dataForDefferingInit: UploadGroupSettings;
    showAdditionSettings = true;
    uploadTypesSettings = null;
    defaultUploadTypesSettings: UploadDefaultMethodSettings = {
        currentSettingsId: 0,
        settings: [
            {
                id: 0,
                name: 'Native',
                deviceId: null
            },
            {
                id: 1,
                name: 'Aspera',
                deviceId: null
            }
        ]
    };
    @ViewChild('controlUploadTypes', {static: false}) public controlUploadTypesSelect: IMFXControlsSelect2Component;
    // @Input('context') protected context: SettingsGroupsDetailsComponent;
    @Input('uploadSearchSettings') protected uploadSearchSettings: UploadGroupSettings;
    @Output('changeUploadSearchSettings') protected changeUploadSearchSettings: EventEmitter<UploadGroupSettings> = new EventEmitter<UploadGroupSettings>();
    private destroyed$ = new Subject();
    private assiciate = {
        'WorkflowPresetId': 'controlWorkflowPresetId',
        // 'MediaFormat': 'controlMediaFileTypes',
        'AspectRatio': 'controlAspectRatioTypes',
        'TvStandard': 'controlTvStandard',
        'Usage': 'controlUsageTypes',
        'MiType': 'controlItemTypes',
    };
    isApplyAll = false;
    constructor(private httpService: HttpService, private basketService: BasketService, private modalProvider: IMFXModalProvider, private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.initUploadTypesSettings();
    }

    ngAfterViewInit() {
        // this.setDefault();

        // get presets for workflow selector
        let getOrderPresetsObservable = this.basketService.getOrderPresets(false);

        //load all lookups
        let allCompletedObservable = forkJoin(
            getOrderPresetsObservable
            , this.controlUsageTypes.onReady
            , this.controlItemTypes.onReady
        );

        let isAllCompleted = false;
        allCompletedObservable.subscribe((resArr) => {
            // OrderPresets_callback
            if (this.controlWorkflowPresetId) {
                const presets: Array<Select2ItemType> = this.controlWorkflowPresetId.turnArrayOfObjectToStandart(resArr[0], {
                    key: 'Id',
                    text: 'Name',
                    selected: 'Selected'
                });
                this.controlWorkflowPresetId.setData(presets, true);
            }

            // OrderPresets_callback end

            isAllCompleted = true;
        });

        // this.context.uploadSearchSettings.subscribe((res: any) => {
        this.prepareDataForDefferingInit();

        if (isAllCompleted) {
            this.setControls();
        } else {
            allCompletedObservable.subscribe(() => {
                this.setControls();
            });
        }

        // });


        if (this.type === 'upload') {
            Promise.resolve().then(() => {
                this.fillUploadTypeLookups();
                this.fillUploadTypeValues();

            });

            this.getDeviceTypesLookups().subscribe((res: any) => {
                this.fillDeviceTypesLookups(res);
                this.fillDeviceTypesValues();
            });
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();

    }

    prepareDataForDefferingInit() {
        // this.dataForDefferingInit = this.context.uploadSettingData;
        this.dataForDefferingInit = this.uploadSearchSettings;
    }

    setControls() {
        if (!$.isEmptyObject(this.dataForDefferingInit)) {
            if (this.dataForDefferingInit.defaultData) {
                $.each(this.dataForDefferingInit.defaultData, (k: string, d: Select2ItemType | boolean) => {
                    const control = this[this.assiciate[k]];
                    if (control) {
                        if (control instanceof IMFXControlsSelect2Component) {
                            (control as IMFXControlsSelect2Component).setSelectedByIds([(d as Select2ItemType).id]);
                        } else {
                            if (control.nativeElement.type === 'checkbox') {
                                (control as ElementRef).nativeElement.checked = d;
                            }
                        }
                    }
                });

                if (this.dataForDefferingInit['isAspectRatio'] !== undefined) {
                    this.controlAspectRatioTypes.nativeElement.checked = this.dataForDefferingInit['isAspectRatio']
                }

                if (this.dataForDefferingInit['isTvStandard'] !== undefined) {
                    this.controlTvStandard.nativeElement.checked = this.dataForDefferingInit['isTvStandard']
                }
            } else {
                if (this.dataForDefferingInit['WorkflowPresetId'] && this.controlWorkflowPresetId) {
                    this.controlWorkflowPresetId.setSelectedByIds([this.dataForDefferingInit['WorkflowPresetId'].ID])
                }

                if (this.dataForDefferingInit['Usage'] && this.controlWorkflowPresetId) {
                    this.controlWorkflowPresetId.setSelectedByIds([this.dataForDefferingInit['Usage'].ID])
                }

                if (this.dataForDefferingInit['MiType'] && this.controlWorkflowPresetId) {
                    this.controlWorkflowPresetId.setSelectedByIds([this.dataForDefferingInit['MiType'].ID])
                }

                if (this.dataForDefferingInit['AspectRatio'] !== undefined) {
                    this.controlAspectRatioTypes.nativeElement.checked = this.dataForDefferingInit['AspectRatio']
                }

                if (this.dataForDefferingInit['TvStandard'] !== undefined) {
                    this.controlTvStandard.nativeElement.checked = this.dataForDefferingInit['TvStandard']
                }
            }

            // upload-mode
            if (!this.dataForDefferingInit['mode']) {
                this.dataForDefferingInit['mode'] = 'title';
            }
            if (this.dataForDefferingInit['mode'] === 'title') {
                this.uploadMediaTitle.nativeElement.checked = true;
            } else if (this.dataForDefferingInit['mode'] === 'version') {
                this.uploadMediaVersion.nativeElement.checked = true;
            } else if (this.dataForDefferingInit['mode'] as any === 'media') {
                this.uploadMediaTitle.nativeElement.checked = true;
            }

            if (this.dataForDefferingInit['customMetadataMode'] === 'version') {
                this.metadataModeVersion.nativeElement.checked = true;
            } else if (this.dataForDefferingInit['customMetadataMode'] as any === 'media') {
                this.metadataModeMedia.nativeElement.checked = true;
            }
        } else {
            this.setDefault();
        }
    }

    setTVStandard($event) {
        // this.context.uploadSettingData['TvStandard'] = $event.target.checked;
        this.uploadSearchSettings.isTvStandard = $event.target.checked;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    setAspectRatio($event) {
        // this.context.uploadSettingData['AspectRatio'] = $event.target.checked;
        this.uploadSearchSettings.isAspectRatio = $event.target.checked;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    initUploadTypesSettings() {
        const inputSS = (this.uploadSearchSettings && this.uploadSearchSettings.uploadTypesSettings)
            ? this.uploadSearchSettings.uploadTypesSettings
            : {};

        this.uploadTypesSettings = $.extend(
            true,
            {},
            this.defaultUploadTypesSettings,
            inputSS
        );
    }

    fillUploadTypeLookups(
        // statusSelect: IMFXControlsSelect2Component, item
    ) {
        let lookup = this.uploadTypesSettings.settings;


        let items = this.controlUploadTypesSelect.turnArrayOfObjectToStandart(lookup, {
            key: 'id',
            text: 'name'
        });

        this.controlUploadTypesSelect.onReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.controlUploadTypesSelect.setData(items, true);
                this.controlUploadTypesSelect.refresh();
                // this.checkValidation();
            });
    }

    fillUploadTypeValues(
        // statusSelect: IMFXControlsSelect2Component, id
    ) {


        this.controlUploadTypesSelect.onReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                let valObj = this.uploadTypesSettings.currentSettingsId;
                this.controlUploadTypesSelect.setSelectedByIds([valObj], true);

                // this.checkValidation();
            });
    }

    onUpdateUploadTypesControl($event: Select2EventType) {
        this.showAdditionSettings = !!($event.params.data[0].id - 0);
        this.uploadTypesSettings.currentSettingsId = $event.params.data[0].id - 0;

        if (this.showAdditionSettings) {
            const deviceId = this.uploadTypesSettings.settings[this.uploadTypesSettings.currentSettingsId].deviceId;
            this.controlDeviceTypes.setSelectedByIds([deviceId], true);
        }
        this.uploadSearchSettings.uploadTypesSettings = this.uploadTypesSettings;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    onUpdateDevicesControl($event: Select2EventType) {
        if (!$event.params.data.length) {
            return;
        }

        this.uploadTypesSettings.settings[this.uploadTypesSettings.currentSettingsId].deviceId = $event.params.data[0].id - 0;
        this.uploadSearchSettings.uploadTypesSettings = this.uploadTypesSettings;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    getIsValidUploadTypeSettings() {
        const currentSettingsId = this.uploadTypesSettings.currentSettingsId;
        if (currentSettingsId == 0) {
            return true;
        }

        //temporary
        if (currentSettingsId !== 0) {
            return true;
        }
    }

    fillDeviceTypesLookups(data) {
        let items = this.controlDeviceTypes.turnArrayOfObjectToStandart(data, {
            key: 'ID',
            text: 'Name'
        });

        this.controlDeviceTypes.onReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.controlDeviceTypes.setData(items, true);
                this.controlDeviceTypes.refresh();
                // this.checkValidation();
            });
    }

    fillDeviceTypesValues() {
        this.controlDeviceTypes.onReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                const deviceId = this.uploadTypesSettings.settings[this.uploadTypesSettings.currentSettingsId].deviceId;
                this.controlDeviceTypes.setSelectedByIds([deviceId], true);

                // this.checkValidation();
            });
    }


    getDeviceTypesLookups(): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService.get('/api/v3/devices/asperaconnect')
                .pipe(
                    map(res => res.body),
                    takeUntil(this.destroyed$)
                ).subscribe(
                (res: any) => {
                    observer.next(res);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    };

    protected onUpdateControl(controlRefStr, field) {
        if (!this.uploadSearchSettings || !this.uploadSearchSettings.defaultData) {
            this.uploadSearchSettings = {defaultData: {}, versionNameList: []};
        }
        const control: IMFXControlsLookupsSelect2Component = this[controlRefStr];
        this.uploadSearchSettings.defaultData[field] = control.getSelectedObject();
        this.uploadSearchSettings.defaultData[field] = control.getSelectedObject();
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    protected setCustomMetadataMode(mode: "media" | "version") {
        this.uploadSearchSettings['customMetadataMode'] = mode;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    protected setUploadMode(mode: UploadAssociateMode) {
        // this.context.uploadSettingData['upload-mode'] = mode;
        this.uploadSearchSettings['mode'] = mode;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    protected onClear(controlRefStr, field) {
        // this.context.uploadSettingData[field] = {};
        this.uploadSearchSettings.defaultData[field] = {};
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    protected setDefault() {
        // this.context.uploadSettingData = {};
        // this.context.uploadSettingData['upload-mode'] = 'media';
        this.uploadSearchSettings = {defaultData: {}, versionNameList: []};
        this.uploadSearchSettings['mode'] = 'title';
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    onSelectSchema(schema) {
        this.uploadSearchSettings.schema = schema;
        this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
    }

    addItems() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.imfx_modal_prompt,
            IMFXModalPromptComponent, {
                size: 'md',
                title: 'settings_group.version_creation.modal_add_name.title',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr =>{
            let modalContent: IMFXModalPromptComponent =cr.instance;
            modalContent.setLabel('settings_group.version_creation.modal_add_name.label');
            modalContent.setPlaceholder('settings_group.version_creation.modal_add_name.placeholder');
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    let name = modalContent.getValue();
                    if(this.uploadSearchSettings.versionNameList) {
                        this.uploadSearchSettings.versionNameList.push(name)
                    } else {
                        this.uploadSearchSettings.versionNameList = [name]
                    }
                    this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
                    this.cdr.detectChanges();
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    deleteRow($event,item) {
        const index = this.uploadSearchSettings.versionNameList.indexOf(item);
        if (index !== -1) {
            this.uploadSearchSettings.versionNameList.splice(index, 1);
            this.changeUploadSearchSettings.emit(this.uploadSearchSettings);
        }
    }
}
