import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXControlsLookupsSelect2Component} from '../../../../../../../../modules/controls/select2/imfx.select2.lookups';
import {CacheManagerCommonService} from '../../../../cachemanager/common/cm.common.service';
import {CacheManagerCommonModal} from '../../../../cachemanager/common/cm.common.modal';
import {MisrTemplateComponent} from '../../misr.templates.comp';
import {
    CollectionLookupData,
    CollectionLookupsComp,
    CollectionLookupsObjectType,
    CollectionLookupsReturnListType,
    CollectionLookupsReturnType,
    CollectionLookupsStructureDataType
} from '../../../../../../../../modules/controls/collection.lookups/collection.lookups.comp';
import {CollectionLookupComp} from '../../../../../../../../modules/controls/collection.lookup/collection.lookup.comp';
import {IMFXControlsDateTimePickerComponent} from '../../../../../../../../modules/controls/datetimepicker/imfx.datetimepicker';
import {forkJoin} from 'rxjs';
import {SlickGridRequestError} from '../../../../../../../../modules/search/slick-grid/types';
import {IMFXControlsSelect2Component} from 'app/modules/controls/select2/imfx.select2';
import {Select2ItemType} from '../../../../../../../../modules/controls/select2/types';

export type MisrTemplatesMisrItems = {
    AUDIO_CONTENT_TYPE: number
    GROUP_ID: number,
    ID: number,
    MEDIA_TYPE: number
    MISR_ID: number
    MI_FILE_TYPE: number
    NAME: string
    REQUIRED_COMP: string
    STORAGE_ID: number
    USAGE_TYPE: number
}

@Component({
    selector: 'misr-templates-modal',
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

export class MisrTemplatesModal extends CacheManagerCommonModal {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    @ViewChild('control_MEDIA_FORMAT', {static: true}) public control_MEDIA_FORMAT: IMFXControlsLookupsSelect2Component;
    public context: MisrTemplateComponent;
    public freeFields: string[] = [
        'SOURCE_PRIOITY', 'SOURCE_STATUS', 'id', 'MODIFIED_DT', 'MODIFIED_BY'
    ];
    @ViewChild('devicesAudio', {static: false}) private devicesAudio: CollectionLookupComp;
    @ViewChild('subsDevices', {static: false}) private subsDevices: CollectionLookupComp;
    @ViewChild('subsFmts', {static: false}) private subsFmts: CollectionLookupComp;
    @ViewChild('components', {static: false}) private components: CollectionLookupComp;

    @ViewChild('audioFmt', {static: false}) private audioFmt: IMFXControlsLookupsSelect2Component;
    @ViewChild('mediaIdField', {static: false}) private mediaIdField: IMFXControlsLookupsSelect2Component;
    @ViewChild('versionIdField', {static: false}) private versionIdField: IMFXControlsSelect2Component;
    @ViewChild('chkDevice', {static: false}) private chkDevice: IMFXControlsSelect2Component;

    @ViewChild('selectionRulesControl', {static: false}) private selectionRulesControl: CollectionLookupsComp;

    @ViewChild('txDtSt', {static: false}) private txDtSt: IMFXControlsDateTimePickerComponent;
    private subtitlesMode: 'collection' | 'single' | null = 'collection';
    private mediasMode: 'collection' | 'single' | null = 'collection';

    private lookupsObjects: CollectionLookupsObjectType[] = [
        {
            controlType: 'lookups-select2',
            lookupType: 'ItemTypes',
            idField: 'MEDIA_TYPE',
            lookupField: 'MEDIA_TYPE',
            compareObject: {key: 'Id', text: 'Value'},
            fetchLookup: false
        },
        {
            controlType: 'lookups-select2',
            lookupType: 'Devices',
            idField: 'STORAGE_ID',
            lookupField: 'DevicesLookup',
            compareObject: {key: 'ID', text: 'Name'},
            fetchLookup: false
        },
        {
            controlType: 'lookups-select2',
            lookupType: 'MediaFileTypes',
            idField: 'MI_FILE_TYPE',
            lookupField: 'MI_FILE_TYPE',
            compareObject: {key: 'ID', text: 'Name'},
            fetchLookup: false
        },
        {
            controlType: 'lookups-select2',
            lookupType: 'UsageTypes',
            idField: 'USAGE_TYPE',
            lookupField: 'USAGE_TYPE',
            compareObject: {key: 'ID', text: 'Name'},
            fetchLookup: false
        }
    ];
    private modalIsReady: boolean = false;

    constructor(public injector: Injector) {
        super(injector);
    }

    static getEmptyDataItemMisrItem(): MisrTemplatesMisrItems {
        return {
            AUDIO_CONTENT_TYPE: null,
            EntityKey: null,
            GROUP_ID: null,
            ID: 0,
            MEDIA_TYPE: null,
            MISR_ID: null,
            MI_FILE_TYPE: null,
            MODIFIED_BY: null,
            MODIFIED_DT: null,
            NAME: null,
            REQUIRED_COMP: null,
            STORAGE_ID: null,
            USAGE_TYPE: null
        } as MisrTemplatesMisrItems;
    }

    ngAfterViewInit() {
        this.toggleOverlay(true);
        this.cdr.detach();


        // DEVICES_AUDIO
        const devAudio = this.itemData.DEVICES_AUDIO;
        this.devicesAudio.onReady.subscribe(() => {
            this.devicesAudio.singleFillCollection(
                this.context.res.Lookups.DevicesLookup,
                {key: 'ID', text: 'Name'},
                devAudio ? devAudio.split('|') : null
            );
        });

        // MediaFormatsLookup
        this.audioFmt.onReady.subscribe(() => {
            this.audioFmt.setData(this.audioFmt.turnArrayOfObjectToStandart(this.context.res.Lookups.MediaFormatsLookup,
                {
                    key: 'ID',
                    text: 'Name',
                }));
            this.audioFmt.setSelected([this.itemData['AUDIO_FMT']]);
        });


        // subsDevices
        const devSubs = this.itemData['DEVICES_SUBS'];
        this.subsDevices.onReady.subscribe(() => {
            this.subsDevices.singleFillCollection(
                this.context.res.Lookups.DevicesLookup,
                {key: 'ID', text: 'Name'},
                devSubs ? devSubs.split('|') : null,
            );
        });

        // MisrItems
        const misrItems = this.itemData['MisrItems'] || [];
        this.selectionRulesControl.onReady.subscribe(() => {
            const controlRef: CollectionLookupsComp = this.selectionRulesControl;
            controlRef.update(misrItems, 'GROUP_ID', this.context.res.Lookups);
        });

        // subsFmts
        const subsFmts = this.itemData['SUBS_FMTS'];
        this.subsFmts.onReady.subscribe(() => {
            this.subsFmts.singleFillCollection(
                this.context.res.Lookups.SubsFormatsLookup,
                {key: 'ID', text: 'Name'},
                subsFmts ? subsFmts.split('|') : null,
            );
        });

        // SubsFormatsLookup
        this.chkDevice.onReady.subscribe(() => {
            this.chkDevice.setData(this.chkDevice.turnArrayOfObjectToStandart(this.context.res.Lookups.DevicesLookup,
                {
                    key: 'ID',
                    text: 'Name',
                }));
            if (this.itemData['CHK_DEVICE'] != null) {
                this.chkDevice.setSelected([this.itemData['CHK_DEVICE']]);
            }
        });


        // components
        let compValues = [];
        if (this.itemData.Components && Array.isArray(this.itemData.Components) && this.itemData.Components.length) {
            compValues = this.itemData.Components.map((comp) => {
                return comp['REQUIRED_COMP'];
            });
        }

        this.components.onReady.subscribe(() => {
            this.components.singleFillCollection(
                this.context.res.Lookups.ComponentsLookup,
                {key: 'ID', text: 'Name'},
                compValues
            );
        });

        // mediaIdField
        this.mediaIdField.setData(this.mediaIdField.turnArrayOfObjectToStandart(this.context.res.Lookups.IdCheckFields,
            {
                key: 'ID',
                text: 'Name',
            }));
        this.mediaIdField.setSelected([this.itemData['MEDIA_ID_FIELD']]);

        // versionIdField
        this.versionIdField.setData(this.versionIdField.turnArrayOfObjectToStandart(this.context.res.Lookups.IdCheckFields,
            {
                key: 'ID',
                text: 'Name',
            }));
        this.versionIdField.setSelected([this.itemData['VERSION_ID_FIELD']]);


        forkJoin([
            this.devicesAudio.onReady,
            this.audioFmt.onReady,
            this.subsDevices.onReady,
            this.selectionRulesControl.onReady,
            this.subsFmts.onReady,
            this.chkDevice.onReady,
            this.components.onReady
        ]).subscribe(() => {
            this.modalIsReady = true;
            this.switchSubtitlesMode();
            this.switchMediasMode();
        });

        this.cdr.markForCheck();
        setTimeout(() => {
            this.toggleOverlay(false);
        }, 200);
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

    switchSubtitlesMode(field?) {
        if (field && this.itemData.CHECK_SUBS && this.itemData.CHECK_SUBS_CHK) {
            if (field === 'CHECK_SUBS_CHK') {
                this.itemData.CHECK_SUBS = 0;
            } else {
                this.itemData.CHECK_SUBS_CHK = 0;
            }
            this.cdr.detectChanges();
        }
        const vs: boolean = this.itemData.CHECK_SUBS as boolean;
        const vsc: boolean = this.itemData.CHECK_SUBS_CHK as boolean;
        if (!vsc && !vs) {
            this.subtitlesMode = null;
            this.chkDevice.setDisabled(false);
            this.subsFmts.setDisabled(false);
            this.subsDevices.setDisabled(false);
        } else {
            this.subtitlesMode = vsc ? 'single' : 'collection';
            if (this.subtitlesMode === 'single') {
                this.subsFmts.setDisabled(true);
                this.subsDevices.setDisabled(true);
                this.chkDevice.setDisabled(false);
            } else {
                this.subsFmts.setDisabled(false);
                this.subsDevices.setDisabled(false);
                this.chkDevice.setDisabled(true);
            }
        }
    }

    switchMediasMode(field?) {
        if (field && this.itemData.CHECK_AUDIO && this.itemData.CHECK_AUDIO_META) {
            if (field === 'CHECK_AUDIO') {
                this.itemData.CHECK_AUDIO_META = 0;
            } else {
                this.itemData.CHECK_AUDIO = 0;
            }
            this.cdr.detectChanges();
        }
        const va: boolean = this.itemData.CHECK_AUDIO as boolean;
        const vam: boolean = this.itemData.CHECK_AUDIO_META as boolean;
        if (!vam && !va) {
            this.audioFmt.setDisabled(false);
            this.devicesAudio.setDisabled(false);
            this.mediasMode = null;
        } else {
            this.mediasMode = vam ? 'single' : 'collection';
            if (this.mediasMode === 'single') {
                this.devicesAudio.setDisabled(true);
                this.audioFmt.setDisabled(true);
            } else {
                this.devicesAudio.setDisabled(false);
                this.audioFmt.setDisabled(false); /// ???
            }
        }
    }

    onUpdateControl(controlRefStr: string, field: string, $event = null) {
        const control: any = this[controlRefStr] || controlRefStr === 'checkbox';
        if (!control || !this.modalIsReady) {
            return;
        }
        if (control && controlRefStr === 'checkbox') {
            this.itemData[field] = $event ? 1 : 0;
        } else if (control instanceof CollectionLookupsComp || control instanceof CollectionLookupComp) {
            // if (!control.lastChanged) {
            //     return;
            // }

            if (control instanceof CollectionLookupsComp) {
                // if(control.lastChanged.type === 'remove') { // anyway
                //
                // } else {
                //
                // }
                const data = [];
                $.each(control.getStructure(), (groupId: string, rules: { [key: number]: CollectionLookupsStructureDataType }) => {
                    $.each(rules, (rowId: string, struct: CollectionLookupsStructureDataType) => {
                        const dataItem: MisrTemplatesMisrItems = MisrTemplatesModal.getEmptyDataItemMisrItem();
                        const values: CollectionLookupData = struct.values;
                        $.each(values, (ruleId: string, value: string[]) => {
                            const originLookup: CollectionLookupsObjectType = this.lookupsObjects[parseInt(ruleId) % this.lookupsObjects.length];
                            dataItem[originLookup.idField] = value[0];
                        });
                        dataItem['GROUP_ID'] = parseInt(groupId);
                        data.push(dataItem);
                    });
                });
                this.itemData[field] = data;
            } else if (control instanceof CollectionLookupComp) {
                if (field === 'DEVICES_AUDIO' || field === 'SUBS_FMTS' || field === 'DEVICES_SUBS') {
                    const vals: CollectionLookupsReturnListType = control.getValues();
                    this.itemData[field] = Object.keys(vals).filter((key) => {
                        const item: CollectionLookupsReturnType = vals[key];
                        return item != null && item.items.length != 0
                    }).map((key, i) => {
                        const item: CollectionLookupsReturnType = vals[key];
                        return item.items[0].id;
                    }).join('|');
                } else {
                    let data = [];
                    // let values: string[] = [];
                    $.each(control.getValues(), (rowId: string, returnData: CollectionLookupsReturnType) => {
                        if (!returnData) {
                            return true;
                        }
                        const structItem: CollectionLookupsObjectType = returnData && returnData.structItem;
                        if (!structItem) {
                            return true;
                        }
                        const values: CollectionLookupData = structItem.values || {};
                        const dataItem = {
                            AUDIO_CONTENT_TYPE: null,
                            EntityKey: null,
                            GROUP_ID: null,
                            ID: 0,
                            MEDIA_TYPE: null,
                            MISR_ID: null,
                            MI_FILE_TYPE: null,
                            MODIFIED_BY: null,
                            MODIFIED_DT: null,
                            NAME: null,
                            REQUIRED_COMP: values[rowId][0],
                            STORAGE_ID: null,
                            USAGE_TYPE: null
                        } as MisrTemplatesMisrItems;


                        data.push(dataItem);
                    });
                    console.log(data);
                    this.itemData['Components'] = data;
                }
            }
        } else if (control instanceof IMFXControlsLookupsSelect2Component || control instanceof IMFXControlsSelect2Component) {
            let values: string[] = [];
            values = control.getSelectedObjects().map((item: Select2ItemType) => {
                return item.id as string;
            });
            this.itemData[field] = values[0];
            // if(field === 'DEVICES_AUDIO' || field === 'SUBS_FMTS' || field === 'DEVICES_SUBS') {
            //     this.itemData[field] = values.join('|');
            // } else {
            //    this.itemData[field] = values[0];
            // }

        } else if (control instanceof IMFXControlsDateTimePickerComponent) {
            const _time: Date = control.getValue();
            const arrDate = _time.toString().match(/\d+/g);
            this.itemData[field] = arrDate[2] + ':' + arrDate[3]
        } else {
            console.error('Unbounded control ', control, ' for field ', field);
        }
    }

    saveData() {
        if (!this.isValid()) {
            return;
        }
        if (this.itemData['ID'] == null) {
            this.itemData['ID'] = 0;
        }
        this.toggleOverlay(true);
        if (this.isNew === true) {
            this.itemData = $.extend(true, {
                AUDIO_FMT: null,
                AUTO_QC_FLAG: 0,
                CHECK_AUDIO: true,
                CHECK_AUDIO_META: false,
                CHECK_SUBS: false,
                CHECK_SUBS_CHK: true,
                CHK_DEVICE: null,
                CONFIG_NAME: "",
                Components: [],
                DEVICES_AUDIO: null,
                DEVICES_SUBS: null,
                EntityKey: null,
                ID: 0,
                MEDIA_ID_FIELD: null,
                MisrItems: [],
                QC_FLAG: 1,
                SUBS_FMTS: null,
                TAGGING_FLAG: 1,
                TIMING_FLAG: 0,
                TX_DT_ST: null,
                VERSION_ID_FIELD: null
            }, this.itemData || {})
        }
        this.service.save(this.context.saveName, this.itemData, 'config-table').subscribe(() => {
            this.toggleOverlay(true);
            this.context.getTable(true);
            this.closeModal();
        }, (err: { error: SlickGridRequestError }) => {
            this.toggleOverlay(false);
            this.notificationService.notifyShow(2, err.error.Error + '(' + err.error.ErrorDetails + ')');
        });
    }

    private turnToCollectionValues(values: any[] = [], field: string) {
        return values && values.length > 0 ? this.itemData['Components'].map((item: string) => {
            return item[field];
        }) : [];
    }
}
