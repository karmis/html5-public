import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {TranslateService} from '@ngx-translate/core';
import {ProductionsConfigService} from "../../services/productions.config.service";
import {ProductionsTemplateConfigService} from "../../../productions.template.config/services/productions.template.config.service";
import {ChannelType} from "../../../settings.user-manager/modals/group.modal/group.modal.component";
import $ from "jquery";
import {ProductionTemplateFieldsComponent} from "./components/template.fields.component/template.fields.component";
import { ProductionConfigEditModalTabsComponent } from './components/tabs.component/production.config.edit.modal.tabs.component';
import {Select2EventType} from "../../../../../../../modules/controls/select2/imfx.select2";
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {lazyModules} from "../../../../../../../app.routes";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {takeUntil} from "rxjs/operators";
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {Subject} from "rxjs";
import {TimeCodeFormat, TMDTimecode} from "../../../../../../../utils/tmd.timecode";

@Component({
    selector: 'edit-production-template',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ProductionsConfigService,
        ProductionsTemplateConfigService
    ]
})

export class EditProductionTemplateModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalEditProductionTemplateOverlayWrapper', {static: true}) private modalEditProductionTemplateOverlayWrapper: ElementRef;
    @ViewChild('dynamicFieldsBlock', {static: false}) private dynamicFieldsBlock: ProductionTemplateFieldsComponent;
    @ViewChild('productionConfigEditModalTabsComponent', {static: false}) private productionConfigEditModalTabsComponent: ProductionConfigEditModalTabsComponent;

    private modalRef: any;
    private context;
    private readonly isNew;
    private productionRowData;
    private itemData;
    private viewData;
    private readonly lookups;
    private defaultPositive = 0;
    private templates = [];
    private templatesMap = {};
    private templateMode = null;
    private existingName = [];
    private destroyed$: Subject<any> = new Subject();

    constructor(private injector: Injector,
                private cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected productionsConfigService: ProductionsConfigService,
                protected templatesConfigService: ProductionsTemplateConfigService,
                protected modalProvider: IMFXModalProvider,
                protected notificationService: NotificationService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
        this.productionRowData = d.isNew ? null : Object.assign({}, d.itemData.data || d.itemData.row);
        this.isNew = d.isNew;
        this.lookups = d.lookups;
        this.lookups["CHANNELS"] = this.lookups["CHANNELS"].map((el, idx) => {
            return {CH_CODE: el.ID, CH_FULL: el.Name, ID: idx }
        });

        this.existingName = d.data && d.data.Data && d.data.Data.map(el => el.NAME) || [];
        if (!d.isNew) {
            this.existingName.splice(this.existingName.indexOf(this.productionRowData.NAME), 1);
        }
    }

    ngOnInit() {
        this.initDialog();
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    initDialog() {
        this.templates = [];
        this.cd.detectChanges();
        this.templatesConfigService.getTemplateConfigList().subscribe((templates)=>{
            this.templatesMap = templates;
            if (!this.isNew) {
                this.productionsConfigService.getProductionConfigById(this.productionRowData.ID).subscribe((res)=>{
                    const viewData = res.View;
                    const itemData = JSON.parse(JSON.stringify(res.Data[0], (k,v) => (k === 'EntityKey' || k === '$id')? undefined : v));
                    itemData.TemplateUiFields.forEach((val)=>{
                        var shouldParse = false;
                        viewData.Columns.forEach((col, idx)=>{
                            if(col.Field == val.Field && col.DataType == "ComboMulti") {
                                shouldParse = true;
                            }
                        })

                        val.Value = shouldParse && val.Value && val.Value.trim().length > 0 ? JSON.parse(val.Value) : val.Value;
                    });
                    $.each(templates, (key) => {
                        this.templates.push({id:key, text:templates[key].ConfigName});
                    });

                    this.itemData = itemData;
                    this.viewData = viewData;
                    this.templateMode = this.templatesMap[this.itemData.CONFIG_ID].ConfigTypeId;
                    this.itemData["PROD_TYPE"] = this.templateMode;
                    this.toggleOverlay(false);
                }, err => {
                    this.notificationService.notifyShow(2, "Error on getting production template config!", true);
                    this.closeModal();
                });
            } else {
                $.each(templates, (key) => {
                    this.templates.push({id:key, text:templates[key].ConfigName});
                });
                this.itemData = {
                    "ID":0,
                    "CHANNELS":[],
                    "RCE":false,
                    "PROD_TYPE":0,
                    "TemplateUiFields":[]
                };
                this.viewData = {Columns:[]};
                this.toggleOverlay(false);
            }
        });
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalEditProductionTemplateOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalEditProductionTemplateOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    closeModal() {
        this.modalRef.hide();
    }

    onSelectConfig(data: Select2EventType) {
        this.itemData["TemplateUiFields"] = [];
        this.itemData["PROD_TYPE"] = 0;

        if(data.params.data && data.params.data.length > 0 && this.itemData["CONFIG_ID"] != data.params.data[0]["id"]) {
            this.itemData.CONFIG_ID = data.params.data[0]["id"];
            this.templateMode = this.templatesMap[this.itemData.CONFIG_ID].ConfigTypeId;
            this.itemData["PROD_TYPE"] = this.templateMode;
            data.params.context.checkValidation(this.itemData["CONFIG_ID"]);
            this.toggleOverlay(true);
            this.productionsConfigService.getViewByTemplateConfigId(this.itemData["CONFIG_ID"]).subscribe((res)=>{
                this.viewData = res;
                this.cd.detectChanges();
                this.dynamicFieldsBlock.Init();
                this.toggleOverlay(false);
            }, err => {
                this.notificationService.notifyShow(2, "Error on getting template config!", true);
                this.toggleOverlay(false);
            });
        }
    }

    onAddChannelsOwners($event, field) {
        this.itemData[field] = this.itemData[field].concat($event);
    }

    onChangeTemplateFields(data) {
        const prevTvStdId = this.getTvStd();
        this.itemData["TemplateUiFields"] = [];
        var mergedObject = {};
        for (var field in data.itemData) {
            if (data.itemData.hasOwnProperty(field)) {
                mergedObject[field] = {
                    Field: field,
                    Value: data.itemData[field],
                    Mandatory: false
                }
            }
        }
        for (var field in data.mandatoryData) {
            if (data.mandatoryData.hasOwnProperty(field)) {
                if(mergedObject[field]) {
                    mergedObject[field].Mandatory = data.mandatoryData[field];
                }
                else {
                    mergedObject[field] = {
                        Field: field,
                        Value: "",
                        Mandatory: data.mandatoryData[field]
                    }
                }
            }
        }
        this.itemData["TemplateUiFields"] = Object.values(mergedObject);
        this.checkAndApplyNewTimecode(prevTvStdId, data.itemData.TV_STD);
    }

    getTvStd() {
        const obj = this.itemData['TemplateUiFields'].find(el => el.Field =='TV_STD');
        return obj && obj.Value || null;
    }

    checkAndApplyNewTimecode(prevTvStdId, tvStdId) {
        if (prevTvStdId == tvStdId) {
            return;
        }

        const prevTcNum = this.getTimecodeFromTvSTD(prevTvStdId);
        const currTcNum = this.getTimecodeFromTvSTD(tvStdId);
        if (prevTcNum != currTcNum) {
            this.refreshSegments(currTcNum);
        }

    }

    getTimecodeFromTvSTD(id): number {
        if (!id) {
            return TimeCodeFormat.Pal;
        }
        return this.lookups.TCF.find(el => el.ID == id).Name - 0;
    }

    getTimecodeStringNameFromTc(id = 0): string {
        const arr = TimeCodeFormat.getArray();
        return (arr.find(el => el.id == id) || {text: 'Pal'}).text;
    }

    refreshSegments(tcFormat:number) {
        let segments = this.itemData['Segments'];

        if(!segments || !segments.length) {
            return;
        }

        //important: reassign object to detectChanges activation.
        segments = $.extend(true, [], this.itemData['Segments']);
        for (let item of segments) {
            item['SOM'] = 0;
            item['EOM'] = 0;
            item['SOMS'] = '';
            item['EOMS'] = '';
            item['Duration_text'] = '';
            item['TimecodeFormat'] =  this.getTimecodeStringNameFromTc(tcFormat);//string
            item['TCF'] = tcFormat;
        }
        // this.itemData = $.extend(true, {}, this.itemData);
        this.itemData['Segments'] = segments;

        //show alert  about refresh
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            title: 'common.warning',
            size: 'md',
            position: 'center',
            footer: 'ok'
        });
        modal.load().then((cd: any) => {
            let alertModal: IMFXModalAlertComponent = cd.instance;
            alertModal.setText('production.production_templates.edit_modal.segments_reset', {});
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                }
            });
        });
    }

    onDeleteChannelsOwners($event: ChannelType[], field) {
        let indexesCh: { [key: string]: ChannelType } = {};
        $event.forEach((rCh: ChannelType) => {
            indexesCh[rCh.CH_CODE] = rCh;
        });

        this.itemData[field] = this.itemData[field].filter((ch: ChannelType) => {
            return !indexesCh[ch.CH_CODE];
        });
    }

    onChangeTabsFields($event) {
        this.itemData = $event;
    }

    isFieldValid(field): boolean {
        const value = this.itemData[field];

        if (!value) {
            return false;
        }

        //precise conditions
        if (field == 'NAME' && this.existingName.includes(value)) {
            return false;
        }

        return true;
    }

    validatePositive(val, limitValue = null) {
        var reg = /^0$|^-?[1-9]\d*(\.\d+)?$/;
        var valid = val !== null && reg.test(val.toString()) && parseInt(val) >= this.defaultPositive && (limitValue == null || parseInt(val) < limitValue);
        return valid;
    }

    onDueDateChange(value) {
        !this.validatePositive(value, 366) ?
            value = "" :
            value = this.processIntegerLimits(value, true, 366);
        this.itemData["DUE_DATE_ADJ"] = value;
    }

    processIntegerLimits(val, positive, limitValue = null) {
        var returnValue = val;
        var reg = /^0$|^-?[1-9]\d*(\.\d+)?$/;

        if (positive) {
            if (val !== null && reg.test(val.toString()) && parseInt(val) > 0 && (limitValue == null ? parseInt(val) < 2147483647 : parseInt(val) < limitValue))
                returnValue = parseInt(val);
            else
                returnValue = "";
        } else {
            if (val !== null && reg.test(val.toString()) && parseInt(val) > -2147483647 && parseInt(val) < 2147483647)
                returnValue = parseInt(val);
            else if (val !== null && reg.test(val.toString()) && (parseInt(val) <= -2147483647 || parseInt(val) >= 2147483647)) {
                if (parseInt(val) <= -2147483647) {
                    returnValue = -2147483646;
                } else {
                    returnValue = 2147483646;
                }
            } else if (val === null || !reg.test(val.toString()))
                returnValue = 0;
        }

        return returnValue;
    }

    isValid() {
        const fields = [
            'NAME', 'CONFIG_ID'
        ]

        for (const item of fields) {
            if(!this.isFieldValid(item)) {
                return false;
            }
        }

        if(!this.productionConfigEditModalTabsComponent.getIsValid()) {
            return false;
        }

        return true;
    }

    saveAttepmt = false;
    showSaveAttepmtValidFlag() {
        this.saveAttepmt = true;
        this.cd.markForCheck();
        setTimeout(() => {
            this.saveAttepmt = false;
        }, 5000);
    }

    saveData() {
        let valid = this.isValid();

        if (valid) {
            this.toggleOverlay(true);
            this.itemData.TemplateUiFields.forEach((val)=>{
                if(val.Value instanceof Array) {
                    val.Value = JSON.stringify(val.Value);
                }
            });
            this.itemData = JSON.parse(JSON.stringify(this.itemData, (k,v) => (k === 'EntityKey' || k === '$id' || k === '__contexts')? undefined : v));
            this.productionsConfigService.updateProductionConfig(this.itemData).subscribe((res: any) => {
                this.modalRef.emitClickFooterBtn('ok', null);
                this.modalRef.hide();
                this.notificationService.notifyShow(1, 'common.saved_successfully', true, 1000);
            },
            (err) => {
                this.notificationService.notifyShow(2, err.error.Message, false, 1000);
                this.toggleOverlay(false);
            });
        } else {
            this.showSaveAttepmtValidFlag();
            this.notificationService.notifyShow(2, 'common.invalid_field_value', false, 1000);
        }
    }
}
