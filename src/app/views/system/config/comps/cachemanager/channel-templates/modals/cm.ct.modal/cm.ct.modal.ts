import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { CollectionLookupComp } from '../../../../../../../../modules/controls/collection.lookup/collection.lookup.comp';
import { CacheManagerCommonModal } from '../../../common/cm.common.modal';
import { CacheManagerChannelTemplatesComponent } from '../../channel-templates.comp';
import { CacheManagerCommonService } from '../../../common/cm.common.service';
import {
    CollectionLookupsReturnListType,
    CollectionLookupsReturnType
} from '../../../../../../../../modules/controls/collection.lookups/collection.lookups.comp';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'cm-ct-modal',
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

export class CacheManagerChannelTemplatesModal extends CacheManagerCommonModal implements AfterViewInit {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public self = this;
    @ViewChild('modalWrapperEl', {static: true}) public modalWrapperEl: ElementRef;
    public context: CacheManagerChannelTemplatesComponent;
    @ViewChild('formatControl', {static: false}) private formatControl: CollectionLookupComp;
    @ViewChild('destinationDeviceControl', {static: false}) private destinationDeviceControl: CollectionLookupComp;
    @ViewChild('sourceDeviceControl', {static: false}) private sourceDeviceControl: CollectionLookupComp;
    @ViewChild('sourceDevicePromoControl', {static: false}) private sourceDevicePromoControl: CollectionLookupComp;
    @ViewChild('sourceDefinitionControl', {static: false}) private sourceDefinitionControl: CollectionLookupComp;
    private controlFieldMap: { [key: string]: CollectionLookupComp } = {};
    private modalIsReady: boolean = false;

    constructor(public injector: Injector) {
        super(injector);
    }

    ngAfterViewInit() {
        this.toggleOverlay(false);
        this.destinationDeviceControl.onReady.subscribe(() => {
            this.destinationDeviceControl.singleFillCollection(
                this.context.res.AvailableDestDevices,
                {key: 'DEVICE_ID', text: 'DeviceName'},
                this.itemData.DestDevices,
                'Id'
            );
        });

        this.sourceDeviceControl.onReady.subscribe(() => {
            this.sourceDeviceControl.singleFillCollection(
                this.context.res.AvailableSourceDevices,
                {key: 'DEVICE_ID', text: 'DeviceName'},
                this.itemData.SrcDevices,
                'Id'
            );
        });

        this.sourceDevicePromoControl.onReady.subscribe(() => {
            this.sourceDevicePromoControl.singleFillCollection(
                this.context.res.AvailableSourceDevices,
                {key: 'DEVICE_ID', text: 'DeviceName'},
                this.itemData.SrcDevicesPromo,
                'Id'
            );
        });

        this.formatControl.onReady.subscribe(() => {
            this.formatControl.singleFillCollection(
                this.context.res.MediaFileTypeLookup,
                {key: 'Id', text: 'Value'},
                (this.itemData.FORMATS || '').split('|'),
                null
            );
        });

        this.sourceDefinitionControl.onReady.subscribe(() => {
            this.sourceDefinitionControl.singleFillCollection(
                this.context.res.TvStandardsLookup,
                {key: 'Id', text: 'Value'},
                this.itemData.VideoDefinitions,
                null
            );
        });

        this.cdr.markForCheck();
        this.controlFieldMap = {
            'FORMATS': this.formatControl,
            'VideoDefinitions': this.sourceDefinitionControl,
            'DestDevices': this.destinationDeviceControl,
            'SrcDevicesPromo': this.sourceDevicePromoControl,
            'SrcDevices': this.sourceDeviceControl
        };

        forkJoin([
            this.formatControl.onReady,
            this.sourceDefinitionControl.onReady,
            this.destinationDeviceControl.onReady,
            this.sourceDevicePromoControl.onReady,
            this.sourceDeviceControl.onReady,
        ]).subscribe(() => {
            this.modalIsReady = true;
        });

        this.cdr.markForCheck();
        setTimeout(() => {
            this.toggleOverlay(false);
        }, 200);
    }

    isValid(): boolean {
        let res: boolean = true;
        if (
            !this.itemData['NAME'] ||
            !this.itemData['TX_PERIOD'] ||
            !this.itemData['COMP_TX_PERIOD'] ||
            !this.itemData['HIATUS'] ||
            !this.itemData['FORMATS'] ||
            (!this.itemData['DestDevices'] || this.itemData['DestDevices'].length === 0) ||
            (!this.itemData['SrcDevices'] || this.itemData['SrcDevices'].length === 0)
        ) {
            res = false;
        }

        return res;
    }

    saveData() {
        super.saveData();
    }

    onUpdateControl(controlRefStr: string, field: string, $event = null) {
        const control: any = this[controlRefStr] || controlRefStr === 'checkbox';
        if (!control || !this.modalIsReady) {
            return;
        }
        if (control && controlRefStr === 'checkbox') {
            this.itemData[field] = $event ? 1 : 0;
        } else if (control instanceof CollectionLookupComp) {
            if (!control.lastChanged || control.lastChanged['i'] == 'fake') {
                return;
            }

            const vals: CollectionLookupsReturnListType = control.getValues();
            const mappedVals = Object.keys(vals).filter((key) => {
                const item: CollectionLookupsReturnType = vals[key];
                return item != null && item.items.length != 0
            }).map((key, i) => {
                const item: CollectionLookupsReturnType = vals[key];
                return item.items[0].id;
            });
            if (field === 'SrcDevices' || field === 'SrcDevicesPromo' || field === 'DestDevices') {
                const resVal = [];
                let vocabulary: any[] = [];
                if (field === 'DestDevices') {
                    vocabulary = this.context.res.AvailableDestDevices || [];
                } else {
                    vocabulary = this.context.res.AvailableSourceDevices || [];
                }
                mappedVals.forEach((val) => {
                    const idObj = vocabulary.find((item) => {
                        return item.DEVICE_ID == val
                    });
                    if (idObj != null) {
                        resVal.push({
                            "Id": 0,
                            "Name": idObj.DeviceName,
                            "DvLoc": null,
                            "DvPath": null,
                            "DvCode": "",
                            "TypeId": 0,
                            "DestSrcId": idObj.ID
                        });
                    }
                });
                this.itemData[field] = resVal;
            } else if (field === 'VideoDefinitions') {
                this.itemData[field] = mappedVals;
            } else if (field === 'FORMATS') {
                this.itemData[field] = mappedVals.join('|');
            }

            // if (control instanceof CollectionLookupComp) {
            //     if (field === 'DEVICES_AUDIO' || field === 'SUBS_FMTS' || field === 'DEVICES_SUBS') {
            //         const vals: CollectionLookupsReturnListType = control.getValues();
            //         this.itemData[field] = Object.keys(vals).filter((key) => {
            //             const item: CollectionLookupsReturnType = vals[key];
            //             return item != null && item.items.length != 0
            //         }).map((key, i) => {
            //             const item: CollectionLookupsReturnType = vals[key];
            //             return item.items[0].id;
            //         }).join('|');
            //     } else {
            //         const data = [];
            //         let values: string[] = [];
            //         $.each(control.getValues(), (rowId: string, returnData: CollectionLookupsReturnType) => {
            //             if (!returnData) {
            //                 return true;
            //             }
            //             const dataItem = {
            //                 AUDIO_CONTENT_TYPE: null,
            //                 EntityKey: null,
            //                 GROUP_ID: -1,
            //                 ID: 0,
            //                 MEDIA_TYPE: null,
            //                 MISR_ID: null,
            //                 MI_FILE_TYPE: null,
            //                 MODIFIED_BY: null,
            //                 MODIFIED_DT: null,
            //                 NAME: null,
            //                 REQUIRED_COMP: null,
            //                 STORAGE_ID: null,
            //                 USAGE_TYPE: null
            //             } as MisrTemplatesMisrItems;
            //             const structItem: CollectionLookupsObjectType = returnData && returnData.structItem;
            //             if (!structItem) {
            //                 return true;
            //             }
            //             const values: CollectionLookupData = structItem.values || {};
            //             dataItem['REQUIRED_COMP'] = values[rowId][0] as string;
            //             data.push(dataItem);
            //         });
            //         this.itemData[control.idField] = data;
            //     }
            // }
        }
    }


    // public onUpdateControl(data: CollectionLookupOnUpdate) {
    //
    //
    //
    //
    //
    //     if(data.idField === 'FORMATS') {
    //         this.formatControl.getValues()
    //     }
    //     // this.bindData(data);
    //
    // }

    // private bindData(data: CollectionLookupOnUpdate) {
    //     // const values:CollectionLookupsReturnType[] = this.controlFieldMap[data.field].getValues();
    //     // let select2Items: Select2ItemType[] = [];
    //     // if(values && values.length && values[0] && !(values[0] as CollectionLookupsReturnType).items) {
    //     //     select2Items = values.map((item:CollectionLookupsReturnType, i) => {
    //     //         return item.values;
    //     //     })
    //     // }
    //     // if (data.field === 'FORMATS') {
    //     //     const formats:string[] = (this.itemData[data.field]||'').split('|');
    //     //     this.itemData['FORMAT'] = formats && formats.length?parseInt(formats[0]):[];
    //     //     this.itemData[data.field] = select2Items.map((item: Select2ItemType) => {
    //     //         return item.id;
    //     //     }).join('|');
    //     // } else if(data.field === 'DestDevices' || data.field === 'SrcDevices' || data.field === 'SrcDevicesPromo') {
    //     //     this.itemData[data.field] = select2Items.map((item: Select2ItemType) => {
    //     //         const dataObj = this.context.injectedDataMap[data.field].find((obj) => {
    //     //             return obj['DEVICE_ID'] == item.id
    //     //         });
    //     //         console.log(this, this.itemData, data, dataObj);
    //     //         return {DestSrcId: dataObj&&dataObj.ID != undefined?dataObj.ID:null};
    //     //     }).filter((item) => {
    //     //         return item != null;
    //     //     })
    //     // } else {
    //     //     this.itemData[data.field] = select2Items.map((item: Select2ItemType) => {
    //     //         return item.id;
    //     //     })
    //     // }
    // }
}
