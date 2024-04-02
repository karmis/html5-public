/**
 * Created by Sergey Trizna on 02.09.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Injector,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    ViewRef
} from "@angular/core";
import { BasketService } from "../../services/basket/basket.service";
import { LookupService } from "../../services/lookup/lookup.service";
// import * as $ from "jquery";
import { UploadProvider } from "./providers/upload.provider";
import { IMFXControlsLookupsSelect2Component } from "../controls/select2/imfx.select2.lookups";
import { Select2ItemType, Select2ListTypes } from "../controls/select2/types";
import { forkJoin, from, Observable, of, Subject, Subscription } from 'rxjs';
import { IMFXModalComponent } from "../imfx-modal/imfx-modal";
import { IMFXModalProvider } from "../imfx-modal/proivders/provider";
import { IMFXModalEvent } from "../imfx-modal/types";
import { TranslateService } from '@ngx-translate/core';
import { SettingsGroupsService } from '../../services/system.config/settings.groups.service';
import { IMFXControlsSelect2Component } from '../controls/select2/imfx.select2';
import { IMFXListOfSameFilesComponent } from './modules/same-file-modal/comp';
// import {VersionsInsideUploadComponent} from "./modules/versions/versions.component";
import { UploadGroupSettings, UploadMetaDataTypes } from "./types";
import { UploadModel } from "./models/models";
import { UploadService } from "./services/upload.service";
import { concatMap, reduce, takeUntil, tap } from "rxjs/operators";
import * as $ from "jquery";
import { InterfaceUploadService } from "./services/interface.upload.service";
import { AsperaUploadService } from "./services/aspera.upload.service";
import { SecurityService } from "../../services/security/security.service";
import { lazyModules } from "../../app.routes";
import { PresetType } from "../order-presets-grouped/types";
import { XMLService } from "../../services/xml/xml.service";
import { OrderPresetGroupedInputComponent } from "../../views/media-basket/components/order.preset.grouped.input/order.preset.grouped.input.component";
import { IMFXMLTreeComponent } from "../controls/xml.tree/imfx.xml.tree";
import * as _ from 'lodash';
import { ViewsService } from '../search/views/services/views.service';

require('./libs/filedrop/filedrop.ts');

export type UploadAssociateMode = 'title' | 'version';
export type UploadCustomMetaDataAssociateMode = 'media' | 'version';
export type UploadMethod = 'native' | 'remote' | 'aspera' | 'native.chunk' | 'default';
export type XmlTreeValidationResult = { model: any, result: boolean, ref: IMFXMLTreeComponent };

@Component({
    selector: 'imfx-upload-modal',
    templateUrl: 'tpl/common-upload.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush, // noway
    providers: [
        // ControlToAdvTransfer,
        BasketService,
        LookupService,
        ViewsService,
        // IMFXModalProvider,
        // BsModalRef,
        // BsModalService,
        // SettingsGroupsService,
        // UploadService,
        // {provide: UploadService, useClass: AsperaUploadService},
        // {provide: UploadService, useClass: RemoteUploadService},
        // {provide: UploadService, useClass: NativeUploadService},
    ]
})

export class UploadComponent {
    public context = this;
    public uploadMethod: UploadMethod = 'native.chunk';
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public isValidForm: boolean = false;
    @ViewChild('inputFile', {static: true}) public inputFile;
    @ViewChild('inputFilename', {static: true}) public inputFilename;
    @ViewChild('controlWorkflow', {static: false}) public controlWorkflow: OrderPresetGroupedInputComponent;
    @ViewChild('controlMediaTypes', {static: true}) public controlMediaTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlAspectRatio', {static: true}) public controlAspectRatio: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlTvStandards', {static: true}) public controlTvStandards: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlUsageTypes', {static: true}) public controlUsageTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlItemTypes', {static: true}) public controlItemTypes: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlChannels', {static: true}) public controlChannels: IMFXControlsLookupsSelect2Component;
    @ViewChild('controlNotes', {static: true}) public controlNotes: ElementRef;
    @ViewChild('controlWorkflowNotes', {static: true}) public controlWorkflowNotes: ElementRef;
    @ViewChild('controlVersionTitle', {static: true}) public controlVersionTitle: ElementRef;
    @ViewChild('controlTitle', {static: true}) public controlTitle: ElementRef;
    @ViewChild('controlAFD', {static: true}) public controlAFD: IMFXControlsLookupsSelect2Component;
    @ViewChild('xmlTreePresets', {static: false}) public xmlTreePresets: IMFXMLTreeComponent;
    @ViewChild('overlayExport', {static: false}) public overlay;
    @ViewChild('overlayWrapper', {static: false}) public wrapper;
    @ViewChild('xmlTreeGroupSettings', {static: false}) public xmlTreeGroupSettings: IMFXMLTreeComponent;
    public modalRef: IMFXModalComponent;
    public isAfterViewInit: Subject<void> = new Subject<void>();
    public currentStep = 0;
    // }
    xmlEmpty: boolean = true;
    xmlSchema: any = null;
    public uploadProvider: UploadProvider;
    protected firstStep = 0;
    protected lastStep = 1;
    protected data: { forcedUploadMode: UploadAssociateMode };
    protected uploadService: UploadService;
    protected basketService: BasketService;
    protected controlChannelsSbs: Subscription;
    private destroyed$: Subject<any> = new Subject();

    afdIcon: string = '';
    isReady: boolean = false;
    private initSubscr = new Subject();

    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider,
                public translate: TranslateService,
                public cdr: ChangeDetectorRef,
                public sgs: SettingsGroupsService,
                public securityService: SecurityService,
                public xmlService: XMLService,
                public viewsService: ViewsService) {
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();
        this.uploadProvider = this.injector.get(UploadProvider);
        this.uploadService = this.injector.get(UploadService);
        this.basketService = this.injector.get(BasketService);

        // forced state for UploadAssociateMode;
        if (this.data.forcedUploadMode) {
            this.uploadProvider.forcedUploadMode = this.data.forcedUploadMode;
        }
        // ref to component
        this.uploadProvider.moduleContext = this;
        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name.indexOf('hide') > -1) {
                this.uploadProvider.clearProperties();
            } else if (e.name === 'overlay-cancel') {
                this.onCancel();
            }
        });
    }

    goToPreviousStep() {
        if (this.currentStep <= this.firstStep) {
            return;
        }

        this.currentStep--;
        this.isValidForm = this.uploadProvider.isValidForm();
        this.toggleOverlay(false);
        this.cdr.markForCheck();
    }

    goToNextStep() {
        if (this.uploadProvider.associateUploadMode === 'version' && !('id' in this.uploadProvider.selectedVersion)) {
            this.uploadProvider.showVersions();
        } else {
            if (this.currentStep >= this.lastStep) {
                return;
            }
            const nextStep = this.currentStep + 1;
            this.loadStep(nextStep).subscribe(() => {
                // success step
                this.currentStep++;
                this.isValidForm = this.uploadProvider.isValidForm();
                this.cdr.markForCheck();
            }, () => {
                // error step
                this.toggleOverlay(false);
            });
        }

        if (this.xmlTreeGroupSettings) {
            this.xmlTreeGroupSettings.ExpandAll();
        }
        this.cdr.markForCheck();
    }

    loadStep(stepNumber): Observable<Subscription> {
        return new Observable((observer: any) => {
            if (stepNumber === 0) {
            } else if (stepNumber === 1) {
                this.fillControls(this.uploadProvider.selectedUploadModel, this.uploadProvider.uploadGroupSettings);
                //
            }
            observer.next();
            observer.complete();
        });
    }

    toggleOverlay(bShow) {
        if (!bShow) {
            this.overlay.hide($(this.wrapper.nativeElement));
        } else {
            this.overlay.showWithoutButton($(this.wrapper.nativeElement));
        }
        // this.cdr.markForCheck();
    }

    onSelectUploadModel(um: UploadModel /*um is new, not selected schema yet*/) {
        // grab prev schema
        this.updateCurrentMedia();

        // set new schema
        if (um && !um.meta.XmlDocument && this.xmlSchema && this.uploadProvider.isVisibleVersionName()) {
            um.meta.XmlDocument = _.cloneDeep(this.xmlSchema.XmlModel);
        }
        if (um && !um.meta.xmlDocAndSchema && this.uploadProvider.selectedPreset) {
            um.meta.xmlDocAndSchema = _.cloneDeep(this.uploadProvider.selectedPreset);
        }

        this.uploadProvider.selectedUploadModel = null;
        this.cdr.detectChanges();
        this.uploadProvider.selectedUploadModel = um;
        this.afdIcon = null;
        this.fillControls(um, {} as UploadGroupSettings);
        this.isValidForm = this.uploadProvider.isValidForm();
        this.cdr.detectChanges();
        if (this.xmlTreeGroupSettings) {
            this.xmlTreeGroupSettings.ExpandAll();
            this.xmlTreeGroupSettings.isValid();
        }

        if (this.xmlTreePresets) {
            this.xmlTreePresets.ExpandAll();
            this.xmlTreePresets.isValid();
        }
    }

    getCurrentSchema() {
        if (this.xmlSchema) {
            return this.xmlSchema.SchemaModel;
        }
    }

    getCurrentModel() {
        const selUm: UploadModel = this.uploadProvider.selectedUploadModel;
        if (!selUm) {
            return;
        }
        const doc = selUm.meta.XmlDocument;
        if (doc) {
            return doc
        }

        return null;
    }

    /**
     * On change Notes field
     */
    onChangeNotes() {
        this.uploadProvider.updateVal('Notes', this.controlNotes.nativeElement.value);
    }

    /**
     * On change workflow Notes field
     */
    onChangeWorkflowNotes() {
        let updateAll = this.uploadProvider.groupFilesForOneWf;
        this.uploadProvider.updateVal('WorkflowNotes', this.controlWorkflowNotes.nativeElement.value, updateAll);
    }

    //
    setVersion(version: Select2ItemType, origData) {
        this.uploadProvider.setVersion(version, origData);
    }

    ngAfterViewInit() {
        this.isAfterViewInit.next();
        this.isAfterViewInit.complete();

        this.init().subscribe(this.initSubscr);
        this.initSubscr.subscribe(() => {

            if (this.uploadProvider.getUploadMethod() == 'aspera') {
                let mode = this.uploadProvider.getUploadMethod();
                let service = (<AsperaUploadService>this.uploadProvider.getService(mode));
                service.initAspera();
            }
        });
    }

    init(): Observable<{ ugs: UploadGroupSettings }> {

        this.modalRef.showOverlay();
        const promises = this.getPromises();
        if (!this.controlChannels) {
            promises.push(this.isAfterViewInit)
        }

        return new Observable((observer: any) => {
            this.uploadProvider.init(promises).subscribe((data: { ugs: UploadGroupSettings }) => {
                this.afterInit(data);
                observer.next(data);
                observer.complete();
            });
        });
    }

    /**
     * On select files
     */
    onSelectFiles(_files: FileList | File[] | Event) {
        const func = () => {
            let files: File[] = [];
            if (_files instanceof Event) {
                _files = (<any>_files.target).files;
            }
            if (_files instanceof FileList) {
                Array.from(_files).forEach(file => {
                    files.push(file)
                });
            }

            if ($.isEmptyObject(files)) {
                console.warn(files, ' list of upload files is empty');
                return;
            }

            this.inputFile.nativeElement.value = '';
            this.uploadProvider.select(files, this.uploadProvider.getUploadMethod());
            // this.controlChannels.clearSelected();
            if (this.uploadProvider.selectedUploadModel) {
                this.fillControls(this.uploadProvider.selectedUploadModel, this.uploadProvider.uploadGroupSettings);
            }
            if (this.uploadProvider.isNativeUpload(this.uploadProvider.getUploadMethod())) {
                this.uploadProvider.checkSize();
            }
            this.isValidForm = this.uploadProvider.isValidForm();
            this.cdr.markForCheck();
        };


        if (this.initSubscr.isStopped) {
            func();
        } else {
            this.initSubscr.subscribe(({ugs: UploadGroupSettings}) => {
                func();
            });
        }
    }

    /**
     * Emulate click by <input type='file'> button
     */
    emulateClickByFile($event) {
        if ($($event.target).closest('.row-item').length) {
            return true;
        }
        if ($($event.target).closest('.select-files-block-handler')) {
            if (this.uploadProvider.isNativeUpload(this.uploadProvider.getUploadMethod())) {
                $(this.inputFile.nativeElement).click();
            } else {
                const service: InterfaceUploadService = this.uploadProvider.getService(this.uploadProvider.getUploadMethod());
                service.openDialog({
                    withUpload: true, callback: () => {
                    }
                })
            }
        }
    }

    /**
     * Fill controls by activeFormItem
     */
    public fillControls(um: UploadModel = this.uploadProvider.selectedUploadModel, ugs: UploadGroupSettings) {
        // if (!um) {
        if (ugs && ugs.defaultData && ugs.defaultData.WorkflowPresetId && this.controlWorkflow) { // set wf
            const d: Select2ItemType = ugs.defaultData.WorkflowPresetId;
            if (!d || $.isEmptyObject(d)) {
                this.controlWorkflow.clear();
                return;
            }

            const isSuccess = this.controlWorkflow.setValueByIdAsync(d.id as number).subscribe(res => {
                if (!res) {
                    return;
                }

                this.uploadProvider.selectedPreset = this.controlWorkflow.getActivePreset();
                const preset: PresetType = this.uploadProvider.selectedPreset;
                if (preset && preset.Active) {
                    this.clickByPresetItemEvent(this.uploadProvider.selectedPreset);
                } else {
                    this.controlWorkflow.clear();
                }
            });

            this.cdr.markForCheck();
        }

        // }


        if (!um) {
            // owner
            if (this.controlChannels.getData().length === 1) {
                this.controlChannels.setSelectedByIds([this.controlChannels.getData()[0].id]);
            }
            console.warn('>>> dont got channels in .fillControls()');
            return;
        }

        // notes
        if (this.controlNotes) {
            this.controlNotes.nativeElement.value = um.meta.Notes || '';
        }

        // wf notes
        if (this.controlWorkflowNotes) {
            this.controlWorkflowNotes.nativeElement.value = um.meta.WorkflowNotes || '';
        }

        // tv standards
        // if (ugs.isTvStandard === true) {
        if (um.meta.TvStandard && um.meta.TvStandard.id !== undefined) {
            this.controlTvStandards.setSelectedByIds([um.meta.TvStandard.id]);
        } else {
            this.controlTvStandards.clearSelected();
        }
        // }

        // aspect ratio
        // if (ugs.isAspectRatio === true) {
        //     if (um.meta.AspectRatio && um.meta.AspectRatio.id != undefined) {
        //         this.controlAspectRatio.setSelectedByIds([um.meta.AspectRatio.id]);
        //     } else {
        //         this.controlAspectRatio.clearSelected();
        //     }
        // }

        // const ugs_data = ugs.defaultData;
        // usage types
        if (um.meta.Usage && um.meta.Usage.id !== undefined) {
            this.controlUsageTypes.setSelectedByIds([um.meta.Usage.id]);
        } else {
            this.controlUsageTypes.clearSelected();
        }

        // owner
        if (um.meta.Owner && um.meta.Owner.id !== undefined) {
            this.controlChannels.setSelectedByIds([um.meta.Owner.id]);
        } else {
            if (this.controlChannels.getData().length === 1) {
                this.controlChannels.setSelectedByIds([this.controlChannels.getData()[0].id], true);
            } else {
                this.controlChannels.clearSelected();
            }
        }

        // item types
        if (um.meta.MiType && um.meta.MiType.id !== undefined) {
            this.controlItemTypes.setSelectedByIds([um.meta.MiType.id]);
        } else {
            this.controlItemTypes.clearSelected();
        }


        // workflow presets
        // if (this.uploadProvider.groupFilesForOneWf) {
        if (this.hasPermissionByName('preset-workflow')) {
            this.fillSchema();
        }
        // }

        // title
        this.controlTitle.nativeElement.value = um.meta.Title || um.name;


        // fill AFD
        // if (ugs.isAspectRatio) {
        this.fillAFD(um, "AspectRatio");
        this.fillAFD(um, "AFD");
        // if (um.meta.AFD && um.meta.AFD.id != undefined) {
        //     this.controlAFD.setSelectedByIds([um.meta.AFD.id]);
        // } else {
        //     this.controlAFD.clearSelected();
        // }
        // }

        // media types
        const types: Select2ListTypes = this.uploadProvider.getMediaTypesAsSelect2ItemByExt(um.getFileExtension());
        if (types && types.length > 0) {
            this.controlMediaTypes.enable();
            this.controlMediaTypes.setData(types);
            this.controlMediaTypes.setSelectedByIds([um.meta.MediaFormat.id]);
            if (types.length === 1) {
                this.controlMediaTypes.disable();
            }
        } else {
            this.controlMediaTypes.reinitPlugin();
            this.controlMediaTypes.enable();
            if (this.uploadProvider.availableAllExt === true) {
                this.controlMediaTypes.reloadData().subscribe(() => {
                    if (um.meta.MediaFormat && um.meta.MediaFormat.id !== undefined) {
                        this.controlMediaTypes.setSelectedByIds([um.meta.MediaFormat.id]);
                    } else {
                        this.controlMediaTypes.setSelectedByIds([this.uploadProvider.availableAllExtObj.Id]);
                    }
                });
            }
        }
        // todo ???
        // const obj: Select2ItemType = this.controlMediaTypes.getSelectedObject();
        // if(obj && obj.id) {
        //     um.meta.MediaFormat = {ID: obj.id.toString(), Name: obj.text};
        // }
    }

    afdTypesFilter: any = (lookups: any[], context: any) => {
        return lookups;
    };

    public syncControl(controlRefStr, field: UploadMetaDataTypes, i: number = 0) {
        const ql: QueryList<IMFXControlsSelect2Component> = this[controlRefStr];
        const crs: IMFXControlsSelect2Component[] = ql.toArray();
        const cr: IMFXControlsSelect2Component = crs[i];
        const val = cr.getSelectedId();
        crs.forEach((cr: IMFXControlsSelect2Component, j) => {
            if (i !== j) {
                cr.setSelectedByIds([val], false);
            }
        });
    }

    public onUpdateControl(controlRefStr, field: UploadMetaDataTypes) {
        let cmp = this[controlRefStr];

        // if (cmp instanceof QueryList) {
        //     cmp = cmp.toArray()[0];
        // }
        const id: number = cmp.getSelected();
        const um = this.uploadProvider.selectedUploadModel;
        if (id) {
            const item: Select2ItemType = cmp.getSelectedObject();
            this.uploadProvider.updateVal(field, item);
            if (field == 'MediaFormat') {
                this.controlMediaTypes.setValidation(true);
                this.isValidForm = this.uploadProvider.isValidForm();
            }
            if (field === 'Owner') {
                const lastSelected = this.uploadProvider.selectedUploadModel;
                this.uploadProvider._uploadModels.forEach(u => {
                    this.uploadProvider.selectedUploadModel = u;
                    this.uploadProvider.updateVal(field, item);
                    this.cdr.markForCheck();
                    this.fillAFD(u, field);
                });
                this.isValidForm = this.uploadProvider.isValidForm();
                this.uploadProvider.selectedUploadModel = lastSelected;
            }
        } else {
            this.uploadProvider.updateVal(field, null);
        }
        this.cdr.markForCheck();
        this.fillAFD(um, field);
        // this.isValidForm = this.uploadProvider.isValidForm();
        // this.cdr.markForCheck();
    }

    public onClearControl(field: UploadMetaDataTypes) {
        if (field === 'AFD') {
            this.afdIcon = null;
        }
        this.uploadProvider.updateVal(field, null);
        setTimeout(() => {
            if (field === 'MiType') {
                this.isValidForm = this.uploadProvider.isValidForm();
                this.cdr.markForCheck();
            }
        })
    }

    clickByPresetItemEvent(preset: PresetType) {
        this.uploadProvider.selectedPreset = preset;
        if (!this.uploadProvider.selectedPreset.SchemaId) {
            this.uploadProvider.isEnabledGroupFilesForOneWf = true;
            this.uploadProvider.setApplyAll();
            this.cdr.markForCheck();
            return;
        }
        this.xmlService.getXmlData(this.uploadProvider.selectedPreset.SchemaId, false).subscribe(
            (result: any) => {
                if (result) {
                    this.uploadProvider.selectedSchemaModel = result.SchemaModel;
                    this.uploadProvider.selectedXmlModel = result.XmlModel;

                    this.cdr.markForCheck();
                }
            },
            (err) => {
                console.log(err);
            }
        );
        // debugger;
    }

    /**
     * Enable all fields
     */
    // enableAllFields() {
    //     this.controlItemTypes.enable();
    //     this.controlUsageTypes.enable();
    //     this.controlTvStandards.enable();
    //     this.controlAspectRatio.enable();
    //     this.controlMediaTypes.enable();
    //     this.controlWorkflow.enable();
    //     this.controlNotes.nativeElement.disabled = false;
    //     // this.controlVersionTitle.nativeElement.disabled = false;
    //     // this.cdr.detectChanges();
    // }

    changeAssociateMode(mode: UploadAssociateMode) {
        this.uploadProvider.changeAssociateMode(mode);
        this.isValidForm = this.uploadProvider.isValidForm();
        try {
            this.cdr.detectChanges();
        } catch (e) {
        }
    }

    ngOnDestroy() {
        this.unbindListeners();
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public disableMedia() {
        this.uploadProvider.disableMedia();
        this.cdr.markForCheck();
    }

    /**
     * Clear value for all controls
     */
    // public clearControls() {
    //     this.controlItemTypes.clearSelected();
    //     this.controlUsageTypes.clearSelected();
    //     this.controlTvStandards.clearSelected();
    //     this.controlAspectRatio.clearSelected();
    //     this.controlMediaTypes.clearSelected();
    //     this.controlWorkflow.clearSelected();
    //     this.controlNotes.nativeElement.value = '';
    //     // this.controlVersionTitle.nativeElement.value = '';
    // }

    onClearPresetItem() {
        this.uploadProvider.isEnabledGroupFilesForOneWf = false;
        this.uploadProvider.groupFilesForOneWf = false;
        this.uploadProvider.selectedPreset = null;
        if (this.controlWorkflow) {
            this.controlWorkflow.clear(false);
        }
        this.cdr.markForCheck();
    }

    fillSchema() {
        const preset: PresetType = this.controlWorkflow && this.controlWorkflow.getActivePreset();
        if (!preset) {
            this.uploadProvider.selectedPreset = preset;
            this.onClearPresetItem();
        }
        this.uploadProvider.getUploadModelsByStates('not_ready').forEach((_um) => {
            // const d: Select2ItemType = this.uploadProvider.uploadGroupSettings;
            // this.controlWorkflow.setValue({Id: d.id, Name: d.text} as PresetType);
            if (preset && preset.Id !== undefined) {
                _um.meta.WorkflowPresetId = {
                    id: this.uploadProvider.selectedPreset.Id,
                    text: this.uploadProvider.selectedPreset.Name
                };
                _um.meta.preset = preset;
                _um.meta.xmlDocAndSchema = this.uploadProvider.selectedPreset && this.uploadProvider.selectedPreset.SchemaId && this.xmlTreePresets ? this.xmlTreePresets.getXmlModel(false) : undefined;
            } else {
                _um.meta.WorkflowPresetId = undefined;
                _um.meta.preset = undefined;
                _um.meta.xmlDocAndSchema = undefined;
                // _um.meta.WorkflowNotes = undefined;
            }
        });
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }


    onSelectNodes($event: any) {

    }

    onChange($event: any) {

    }

    isReadonlyXML() {
        return false;
    }

    isVisiblePresetXML() {
        return !!(this.hasPermissionByName('preset-workflow') &&
            this.uploadProvider.selectedPreset &&
            this.uploadProvider.selectedPreset.SchemaId)
    }

    hasPermissionForPresetXML() {
        return this.hasPermissionByName('preset-workflow');
    }

    isVisibleMetaXml() {
        return !!(
            this.uploadProvider.selectedUploadModel &&
            this.xmlSchema &&
            this.uploadProvider.isVisibleVersionName()
            // && this.isSameMode()
        );
    }

    isSameMode() {
        return (this.uploadProvider.customMetadataMode === 'media' && this.uploadProvider.associateUploadMode === 'title') ||
            (this.uploadProvider.customMetadataMode === 'version' && this.uploadProvider.associateUploadMode === 'version');
    }


    getColumnName(name: string): string {
        if (this.uploadProvider.columns[name]) {
            return this.uploadProvider.columns[name].TemplateName || this.uploadProvider.columns[name].BindingName
        } else {
            return '[no label]';
        }
    }

    isHalfFullScreenForMeta() {
        const isVisibleXML = this.isVisibleMetaXml() && this.uploadProvider.isVisibleVersionName();
        const isVisiblePreset = this.isVisiblePresetXML();
        return (isVisibleXML && isVisiblePreset) || (!isVisibleXML && !isVisiblePreset);
        // this.isVisibleVersionName() && !this.isVisiblePresetXML() &&  || (this.isVisiblePresetXML() && !this.isVisibleMetaXml())
    }

    /**
     * Disable all fields
     */
    // disableAllFields() {
    //     this.controlItemTypes.disable();
    //     this.controlUsageTypes.disable();
    //     this.controlTvStandards.disable();
    //     this.controlAspectRatio.disable();
    //     this.controlMediaTypes.disable();
    //     this.controlWorkflow.disable();
    //     this.controlNotes.nativeElement.disabled = true;
    //     // this.controlVersionTitle.nativeElement.disabled = true;
    //     // this.cdr.detectChanges();
    // }

    protected isAspectOrTV(): boolean {
        return this.isAspect() || this.isTv();
    }

    protected isAspect(): boolean {
        const ugs: UploadGroupSettings = this.uploadProvider.uploadGroupSettings;
        return ugs.isAspectRatio;
    }

    protected isTv(): boolean {
        const ugs: UploadGroupSettings = this.uploadProvider.uploadGroupSettings;
        return ugs.isTvStandard;
    }

    protected changeAssociateTitle($event) {
        this.uploadProvider.updateVal('Title', $event.target.value);
        this.isValidForm = this.uploadProvider.isValidForm();
        this.cdr.markForCheck();
    }

    // private checkChannels() {
    //     // if (this.uploadProvider.channelSelected) {
    //     //     return;
    //     // }
    //     const chEl: IMFXControlsLookupsSelect2Component = this.controlChannels;
    //     if (chEl.getData().length === 1) {
    //         chEl.setSelectedByIds([chEl.getData()[0].id]);
    //         this.uploadProvider.firstSelectedChannel = chEl.getSelectedObject();
    //     } else {
    //         chEl.clearSelected();
    //         this.uploadProvider.firstSelectedChannel = undefined;
    //     }
    // }

    // private setOptionsForPresets(data) {
    //     // workflow control
    //     const presets = this.controlWorkflows.toArray()[0].turnArrayOfObjectToStandart(
    //         data,
    //         {
    //             key: 'Id',
    //             key: 'Id',
    //             text: 'Name',
    //             selected: 'Selected'
    //         });
    //     this.controlWorkflows.toArray().forEach((controlWf: IMFXControlsSelect2Component) => {
    //         controlWf.setData(presets, true);
    //     });

    /**
     * Remove item from selected files
     */
    protected removeModel(um: UploadModel) {
        this.uploadProvider.removeModel(um);
        this.isValidForm = this.uploadProvider.isValidForm();
        this.cdr.markForCheck();
    }

    protected upload() {
        if ((this.xmlTreeGroupSettings && this.uploadProvider.isVisibleVersionName()) || this.xmlTreePresets) {
            forkJoin([
                this.isValidSchema(/* this.xmlTreeGroupSettings */ 'xmlTreeGroupSettings'),
                // this.isValidSchema(this.xmlTreePresets)
            ]).subscribe((res: [
                XmlTreeValidationResult[] /* , XmlTreeValidationResult[]*/
            ]) => {
                let commonValid: boolean = true;
                let xmlPresetValid = true;
                res.forEach((r: XmlTreeValidationResult[]) => {
                    if (!this._postValidateSchemaProcess(r)) {
                        commonValid = false;
                    }
                });

                if (this.xmlTreePresets) {
                    xmlPresetValid = this.xmlTreePresets.isValid();
                }
                if (commonValid && xmlPresetValid) {
                    this._processUpload();
                }
            });
        } else {
            this._processUpload();
        }
    }

    protected onCancel() {
        this.modalRef.hide();
    }

    protected afterInit(data: { ugs: UploadGroupSettings }) {
        // this.checkChannels();
        this.changeAssociateMode(this.uploadProvider.associateUploadMode);
        this.bindListeners();
        const service: InterfaceUploadService = this.uploadProvider.getService(this.uploadProvider.getUploadMethod());
        this.uploadProvider.getUploadModelsByStates('not_ready').filter((um: UploadModel) => {
            return um.method === this.uploadMethod;
        }).forEach((um: UploadModel) => {
            um = service.bindDefaultDataToModels(um, data);
        });

        this.uploadProvider.selectFirstUploadModel(false);
        if (this.uploadProvider.selectedUploadModel) {
            this.fillControls(this.uploadProvider.selectedUploadModel, this.uploadProvider.uploadGroupSettings);
        } else {
            this.fillControls(null, this.uploadProvider.uploadGroupSettings);
        }
        this.isValidForm = this.uploadProvider.isValidForm();
        this.cdr.markForCheck();
        this.modalRef.hideOverlay();
        this.isReady = true;
    }

    protected unbindListeners() {
        if (this.controlChannelsSbs) {
            this.controlChannelsSbs.unsubscribe()
        }
    }

    protected bindListeners() {
        this.unbindListeners();
        // set Owner for everyone who without Owner
        this.controlChannelsSbs = this.controlChannels.onSelect.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            const selectedChannel: Select2ItemType = this.controlChannels.getSelectedObject();
            // set first selected channel as default for every models
            this.uploadProvider.getUploadModelsByStates('not_ready').forEach((um: UploadModel) => {
                if (!um.meta.Owner || !um.meta.Owner.id) {
                    um.meta.Owner = {
                        id: selectedChannel.id.toString(),
                        text: selectedChannel.text
                    }
                }
            })
        });

        // etc
    }

    private _postValidateSchemaProcess(res: XmlTreeValidationResult[]): boolean {
        let isValid: boolean = true;
        $.each(res, (k: number, obj: XmlTreeValidationResult) => {
            if (!obj.result) {
                this.onSelectUploadModel(obj.model);
                if (obj.ref) {
                    obj.ref.isValid();
                }

                isValid = false;
                return false;
            }
        });

        return isValid;
    }

    private _processUpload() {
        this.updateCurrentMedia();

        if (this.hasPermissionByName('preset-workflow')) {
            this.fillSchema();
        }

        this.uploadProvider.upload();
        this.modalRef.hide();
    }

    private updateCurrentMedia() {
        if(!this.uploadProvider.selectedUploadModel) {
            return;
        }
        const prevUmIndex: number = this.uploadProvider.uploadModels.findIndex(
            (umItem: UploadModel) => umItem.getUniqValue() === this.uploadProvider.selectedUploadModel.getUniqValue()
        );
        const prevUm: UploadModel = (this.uploadProvider.uploadModels[prevUmIndex]);
        if (prevUm) {
            if (this.xmlTreeGroupSettings) {
                const xmlObj = this.xmlTreeGroupSettings.getXmlModel(false);
                if (xmlObj && this.uploadProvider.isVisibleVersionName()) {
                    prevUm.meta.XmlDocument = xmlObj.XmlModel;
                }
            }

            if (this.xmlTreePresets) {
                const presetObj = this.xmlTreePresets.getXmlModel(false);
                if (presetObj) {
                    prevUm.meta.xmlDocAndSchema = presetObj.XmlModel;
                }
            }

            this.uploadProvider.uploadModels[prevUmIndex] = prevUm;
        }

    }

    private isValidSchema(/*ref: IMFXMLTreeComponent*/refStr: string): Observable<XmlTreeValidationResult[]> {
        this.onSelectUploadModel(this.uploadProvider.selectedUploadModel); // save xml model to um
        const ums: UploadModel[] = this.uploadProvider.getUploadModelsByStates('not_ready');
        const validatorStopper$: Subject<void> = new Subject();
        const source = from(ums);
        return source
            .pipe(takeUntil(validatorStopper$))
            .pipe(
                tap((um: UploadModel) => {
                    this.onSelectUploadModel(um);
                    if (this[refStr]) {
                        this[refStr].applyChanges();
                        if (this[refStr] && !(<ViewRef>this[refStr].cdr).destroyed) {
                            this[refStr].cdr.detectChanges();
                        }
                    }

                    if (this[refStr] && !(<ViewRef>this[refStr].cdr).destroyed) {
                        this[refStr].cdr.detectChanges();
                    }

                }))
            // .pipe(concatMap(item => of(item).pipe(delay(100))))
            .pipe(
                concatMap((um: UploadModel) => {
                    const isValid = !this[refStr] ? true : this[refStr].isValid();
                    return of({
                        model: um,
                        result: isValid,
                        ref: this[refStr]
                    } as XmlTreeValidationResult)
                }))
            .pipe(
                tap((res: XmlTreeValidationResult) => {
                    if (!res.result) { validatorStopper$.next(); }
                })
            )
            .pipe(
                reduce((acc, val) => {
                    acc.push(val);
                    return acc;
                }, [])
            )
    }

    private fillAFD(um, v: UploadMetaDataTypes) {
        if (!um) {
            return;
        }
        if (v == 'AspectRatio') {
            let sourceData = this.controlAFD.getSourceData();
            if (um.meta.AspectRatio == {} || !um.meta.AspectRatio || um.meta.AspectRatio.id == -1) {
                um.meta.AspectRatio = {};
                this.controlAFD.reloadData().subscribe(() => {
                    this.controlAFD.clearSelect();
                    um.meta.AFD = null;
                });
            } else {
                let afds = sourceData.filter((el) => {
                    return el.AspectRatioName == um.meta.AspectRatio.text;
                });
                if (afds[0] && afds[0].AspectRatioName != um.meta.AspectRatio.text || um.meta.AspectRatio.id == -1) {
                    um.meta.AFD = null;
                    this.controlAFD.clearSelect();
                }

                const afds_s2: Select2ItemType[] = this.controlAFD.turnArrayOfObjectToStandart(afds, {
                    key: 'ID',
                    text: 'Name'
                });
                this.controlAFD.setData(afds_s2);
                // this.controlAFD.reloadData().subscribe((res: any) =>{
                if (um.meta.AFD && um.meta.AFD.id != null) {
                    this.controlAFD.setSelected([um.meta.AFD.id]);
                    this.cdr.markForCheck();
                } else {
                    this.controlAFD.clearSelected();
                }
                // });
            }

            if (um.meta.AspectRatio && um.meta.AspectRatio.id != undefined) {
                this.controlAspectRatio.setSelectedByIds([um.meta.AspectRatio.id]);
            } else {
                this.controlAspectRatio.clearSelected();
            }
        } else if (v == 'AFD') {
            if (!um.meta.AFD) {
                return;
            }
            let sourceData = this.controlAFD.getSourceData();
            let afd = sourceData.filter((el) => {
                return el.ID == um.meta.AFD.id;
            })[0];
            if (afd) {
                this.afdIcon = afd.Image;
            } else {
                this.afdIcon = null;
            }
        }
        this.cdr.markForCheck();
    }

    private getPromises(): any[] {
        const promises: any = [
            this.controlMediaTypes.onReady,
            this.controlAspectRatio.onReady,
            this.controlTvStandards.onReady,
            this.controlItemTypes.onReady,
            this.controlUsageTypes.onReady,
            this.controlChannels.onReady,
            this.viewsService.getViews('VersionGrid'),
            this.uploadProvider.getUploadSettings(false)
            // this.controlWorkflows.toArray()[0].onReady,
        ];



        return promises;
    }

    private showListOfMedias(medias: any[] = []) {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.same_filename,
            IMFXListOfSameFilesComponent, {
                size: 'xxl',
                title: 'same_media_files.title',
                position: 'center',
                footerRef: 'modalFooterTemplate',
                dialogStyles: {
                    'top': '45px'
                }
            },
            {
                medias: medias,
            });
        modal.load().then((compRef: ComponentRef<IMFXListOfSameFilesComponent>) => {
            // const comp: IMFXListOfSameFilesComponent = compRef.instance;
        });
    }

    private changeFlagToGroupFiles($event) {
        this.uploadProvider.groupFilesForOneWf = $event.target.checked;
        this.onChangeWorkflowNotes();
    }
}
