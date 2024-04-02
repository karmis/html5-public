/**
 * Created by Sergey Trizna on 04.05.2017.
 */
import { ComponentRef, EventEmitter, Injectable, Injector } from "@angular/core";
import { forkJoin, Observable, Subscription } from "rxjs";
import { UploadService } from "../services/upload.service";

import {
    AvailableMediaTypeByExtensionAsSelect2ListTypes,
    AvailableMediaTypeByExtensionListTypes,
    MediaFileListTypes,
    MediaFileType,
    MediaFileTypes,
    UploadDefaultMethodSettings,
    UploadGroupSettings,
    UploadMetaDataTypes,
    UploadMethodSettings,
    UploadModelStates
} from "../types";
import {UploadAssociateMode, UploadComponent, UploadCustomMetaDataAssociateMode, UploadMethod} from "../upload";
import { BasketService } from "../../../services/basket/basket.service";
import { Select2ItemType, Select2ListTypes } from "../../controls/select2/types";
import { NotificationService } from "../../notification/services/notification.service";
import { ArrayProvider } from "../../../providers/common/array.provider";
import { IMFXModalComponent } from "../../imfx-modal/imfx-modal";
import { BaseUploadMenuComponent } from "../../../views/base/components/base.upload/base.upload.component";
import * as $ from "jquery";
import { IMFXFBNode } from '../../controls/file-browser/remote-file-browser';
import { IMFXModalProvider } from "../../imfx-modal/proivders/provider";

import { InterfaceUploadService } from "../services/interface.upload.service";
import { AsperaUploadService } from "../services/aspera.upload.service";
import { NativeUploadService } from "../services/native.upload.service";
import { RemoteUploadService } from "../services/remote.upload.service";
import { UploadModel } from '../models/models';
import { VersionsInsideUploadComponent } from '../modules/versions/versions.component';
import { lazyModules } from "../../../app.routes";
import { ErrorModalComponent } from "../../error/modules/error-modal/error";
import { Guid } from "../../../utils/imfx.guid";
import { PresetType } from "../../order-presets-grouped/types";
import { NativeChunkUploadService } from "../services/native.chunk.upload.service";
import { XMLService } from '../../../services/xml/xml.service';
import { ViewColumnsType } from '../../search/views/types';


// const FormData = require('formdata-polyfill');
// export type CustomFileType = File & { medias?: any[], owner: Select2ItemType, endpoint: string };

// export type
@Injectable(/*{providedIn: 'root'}*/)
export class UploadProvider {
    public baseUploadMenuRef: BaseUploadMenuComponent;
    public moduleContext: UploadComponent;
    public uploadModalIsOpen: boolean = false;
    public tooHeavyFiles: boolean = false;
    public onStartUpload: EventEmitter<{
        lastAddedUploadModels: UploadModel[],
        allUploadModels: UploadModel[]
    }> = new EventEmitter<{
        lastAddedUploadModels: UploadModel[],
        allUploadModels: UploadModel[]
    }>();
    public availableExtensions: MediaFileTypes = {};
    public availableExtensionsSelect2: Select2ItemType[];
    public droppedToBlock: 'version-row' | 'popup' | null = null;
    // }
    public groupFilesForOneWf: boolean = true;
    public onReady: EventEmitter<void> = new EventEmitter();
    public readonly queueUploadStorageKey: string = 'upload_queue';
    public versionModalRef: IMFXModalComponent;
    // public readonly chunking = {
    //     chunk_size: 2097152, // 2mb
    //
    public forcedUploadMode: UploadAssociateMode;
    public preselectedData: { Owner: Select2ItemType | null } = {Owner: null};
    public onSelectFiles: EventEmitter<{ models: UploadModel[] }> = new EventEmitter<{ models: UploadModel[] }>();
    public onDestroy: EventEmitter<void> = new EventEmitter<void>();
    public mediaTabIsDisabled: boolean = false;
    public selectedPreset: PresetType;
    public isEnabledGroupFilesForOneWf: boolean = true;
    public selectedSchemaModel: any = {};
    public selectedXmlModel: any = {};
    public columns: ViewColumnsType = {};
    public isHideXML: boolean = false;
    private maxFileNameLength: number = 100;
    private availableMediaTypesByExtension: AvailableMediaTypeByExtensionListTypes = {};
    private availableMediaTypesAsSelect2ItemByExtension: AvailableMediaTypeByExtensionAsSelect2ListTypes = {};
    // private regExpValid: RegExp = /^[wáéíóäëiöúàèìùаАбБвВгГдДеЕёЁжЖзЗиИйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяЯ0-9a-zA-Z_\(\)\-\.\`\,\[\]\s\{\}\~!@#$^+=¬£%]*$/;
    private regExpValid: RegExp = /[^.\\/:*?\"<>|\u0000-\u001F\-=!~¬£$%]?[^\\/:*?\"<>|\u0000-\u001F\-=!~¬£$%]*/; /// add - =-!~¬£$%
    private lastTriedForUploadModel: UploadModel;

    constructor(public uploadService: UploadService,
                public basketService: BasketService,
                private notificationRef: NotificationService,
                private arrayProvider: ArrayProvider,
                private injector: Injector,
                private xmlService: XMLService) {
        this.uploadService.providerContext = this;
    }

    // public versionsModal: any;
    private _selectedVersion: Select2ItemType = {id: 0, text: ''};

    get selectedVersion(): Select2ItemType {
        return this._selectedVersion;
    }

    private _associateUploadMode: UploadAssociateMode;
    private _customMetadataMode: UploadCustomMetaDataAssociateMode = 'media';
    get customMetadataMode(): UploadCustomMetaDataAssociateMode {
        return this._customMetadataMode;
    }

    get associateUploadMode(): "title" | "version" {
        return this._associateUploadMode;
    }

    private _loadingModelId: number = 0;

    get loadingModelId(): number {
        return this._loadingModelId;
    }

    set loadingModelId(value: number) {
        this._loadingModelId = value;
    }

    private _lastAddedUploadModels: UploadModel[] = [];

    get lastAddedUploadModels(): UploadModel[] {
        return this._lastAddedUploadModels;
    }

    private _availableAllExt: boolean = false;

    get availableAllExt(): boolean {
        return this._availableAllExt;
    }

    private _availableAllExtObj: MediaFileType = {};

    get availableAllExtObj(): any {
        return this._availableAllExtObj;
    }

    public _uploadModels: UploadModel[] = [];

    get uploadModels(): UploadModel[] {
        return this._uploadModels;
    }

    private _uploadGroupSettings: UploadGroupSettings = {mode: 'title', defaultData: {}};

    get uploadGroupSettings(): UploadGroupSettings {
        return this._uploadGroupSettings;
    }

    set uploadGroupSettings(value: UploadGroupSettings) {
        this._uploadGroupSettings = value;
    }

    private _selectedUploadModel: UploadModel = null;

    get selectedUploadModel(): UploadModel {
        return this._selectedUploadModel;
    }

    // todo common interface for File|IMFXFBNode

    set selectedUploadModel(value: UploadModel) {
        this._selectedUploadModel = value;
    }

    private _originalVersion: any = null;

    get originalVersion(): any {
        return this._originalVersion;
    }

    set originalVersion(value: any) {
        this._originalVersion = value;
    }

    private _selectedVersionDetail: any = null;

    get selectedVersionDetail(): any {
        return this._selectedVersionDetail;
    }

    setApplyAll() {
        if (this._uploadGroupSettings.isApplyAll !== undefined)
            this.groupFilesForOneWf = this._uploadGroupSettings.isApplyAll;
    }

    public init(promises: Subscription[] = []): Observable<{ ugs: UploadGroupSettings }> {
        return new Observable((observer) => {
            this.moduleContext.xmlEmpty = true;
            if (!promises.length) {
                observer.next({ugs: this._uploadGroupSettings});
                this.uploadModalIsOpen = true;
                observer.complete();
                return;
            }

            // loaded already
            if (
                this._uploadGroupSettings.uploadTypesSettings &&
                this.uploadModalIsOpen === true &&
                Object.keys(this.availableExtensions).length > 0
            ) {
                if (this.forcedUploadMode) {
                    this._associateUploadMode = this.forcedUploadMode;
                }
                this.uploadModalIsOpen = true;
                this.loadSchema();
                observer.next({ugs: this._uploadGroupSettings});
                observer.complete();
                this.onReady.emit();
                this.onReady.complete();
            } else {
                this.uploadModalIsOpen = true;
                // not loaded
                const sbs = forkJoin(
                    promises
                ).subscribe((res: any[]) => {
                    return new Promise((resolve, reject) => {
                        if (!res || res.length === 0) {
                            sbs.unsubscribe();
                            reject();
                            return;
                        }
                        // const data = {presets: res[6]};
                        // available extensions
                        this.availableExtensions = res && res[0] && res[0].res ? res[0].res : {};
                        this.availableExtensionsSelect2 = res && res[0] && res[0].select2Res ? res[0].select2Res : {};

                        // setting of upload
                        if (res[7] && res[7][0] && res[7][0].DATA) {
                            this._uploadGroupSettings = JSON.parse(res[7][0].DATA) as UploadGroupSettings;
                            this.setApplyAll()
                            if (this.baseUploadMenuRef && this.baseUploadMenuRef.ugs) {
                                this.baseUploadMenuRef.ugs = this._uploadGroupSettings;
                            }

                            if (this.forcedUploadMode) {
                                this._associateUploadMode = this.forcedUploadMode;
                            } else if (this._uploadGroupSettings.mode) {
                                this._associateUploadMode = this._uploadGroupSettings.mode;
                            } else {
                                this._associateUploadMode = this._uploadGroupSettings.mode = 'title';
                            }

                            if (this._uploadGroupSettings.customMetadataMode) {
                                this._customMetadataMode = this._uploadGroupSettings.customMetadataMode;
                            }

                            this.loadSchema();
                            observer.next({ugs: this._uploadGroupSettings});
                            observer.complete();
                            if (sbs && sbs.unsubscribe) {
                                sbs.unsubscribe();
                            }
                            resolve();
                        } else {
                            this._uploadGroupSettings = Object.assign({}, this._uploadGroupSettings, {
                                isTvStandard: true,
                                isAspectRatio: true
                            });
                            this.setApplyAll();
                        }

                        if (res[6] && res[6].ViewColumns) {
                            this.columns = res[6].ViewColumns
                        }

                        this.onReady.emit();
                        this.onReady.complete();
                        observer.next({ugs: this._uploadGroupSettings});
                        observer.complete();
                        sbs.unsubscribe();
                        resolve();
                    });
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            }

        });
    }

    public changeAssociateMode(mode: UploadAssociateMode) {
        if (this.mediaTabIsDisabled && mode === "title") {
            return;
        }
        this.getUploadModelsByStates('not_ready').forEach((um: UploadModel) => {
            um.associateUploadMode = mode;
        });
        this._associateUploadMode = mode;
        if (this.moduleContext && this.moduleContext.cdr) {
            this.moduleContext.cdr.markForCheck();
        }
    }

    // todo common interface for UploadModel
    public select(files: File[] | IMFXFBNode[], method: UploadMethod = 'native.chunk'): void {
        const uniqueFiles: File[] = [];
        const uniqueFilesNames: string[] = [];
        // uniq name of file
        $.each(files, (j, newFile: File) => {
            let isUniqueFile: boolean = true;
            const newFileName: string = $.trim(newFile.name);
            // not empty name
            if (!newFileName) {
                this.notificationRef.notifyShow(2, "upload.empty_name");
                return true;
            }
            // valid name
            if (this.isNativeUpload(this.getUploadMethod()) && !this.regExpValid.test(newFileName)) {
                this.notificationRef.notifyShow(2, "upload.invalid_name");
                // continue
                return true;
            }

            if (this.isNativeUpload(this.getUploadMethod()) && newFileName.length >= this.maxFileNameLength) {
                this.notificationRef.notifyShow(2, "upload.too_long_name");
                // continue
                return true;
            }

            $.each(this.getUploadModelsByStates('not_ready'), (i, um: UploadModel) => {
                if (um.name === newFileName) {
                    isUniqueFile = false;
                }
            });
            if (isUniqueFile) {
                uniqueFiles.push(newFile);
                uniqueFilesNames.push(newFileName);
            }
        });

        const service: InterfaceUploadService = this.getService(method);
        const _uniqueFilesNames: string[] = uniqueFilesNames.concat(this.getUploadModelsByStates('not_ready').map((um: UploadModel) => {
            return um.name;
        }) || []);
        this._uploadModels = this._uploadModels.concat(service.getModels(uniqueFiles));
        this.fillUpLastUploadsModels();
        this.selectFirstUploadModel();


        this.onSelectFiles.emit({models: this._uploadModels});

        // get duplicates of filenames
        if (_uniqueFilesNames.length > 0) {
            this.checkFileNames(_uniqueFilesNames).subscribe(() => {
                this.moduleContext.cdr.markForCheck();
            });
        }

        // return {
        //     models: this._uploadModels,
        //     names: _uniqueFilesNames
        // }
    }

    public fillUpLastUploadsModels() {
        this._lastAddedUploadModels = [...this._uploadModels.filter((um) => um.state === 'not_ready' || um.state === 'restored')];
    }

    public getUploadSettings(withCache: boolean = false) {
        return this.baseUploadMenuRef.sgs.getSettingsUserById(this.getUploadMethod() === "remote"?'remoteUploadSettings':'uploadSettings', withCache);
    }

    public setVersion(version: Select2ItemType, origData) {
        this._selectedVersion = version;
        this._selectedVersionDetail = origData;
        // this.selectedVersionDetailSub.next(origData);
        this.getUploadModelsByStates('not_ready').forEach((um: UploadModel) => {
            if (!um.meta.version || !um.meta.version.id) {
                um.meta.version = version;
            }
        });

        const VERSION = origData.row ? origData.row.VERSION : this.selectedVersionDetail['VERSION'];
        this.getUploadSettings(true).subscribe((uploadSettings: any) => {
            const ugs: UploadGroupSettings = JSON.parse(uploadSettings[0].DATA) as UploadGroupSettings;
            if (ugs.versionNameList && ugs.versionNameList.length) {
                // @ts-ignore
                const found = ugs.versionNameList.find(name => name.toLowerCase() === VERSION.toLowerCase());
                this.isHideXML = found === undefined;
            } else {
                this.isHideXML = false;
            }
        })

    }

    public isNativeUpload(uploadMethod: UploadMethod): boolean {
        return (['native', "native.chunk", "default"] as UploadMethod[]).indexOf(uploadMethod) > -1;
    }

    public checkFileNames(names: string[]): Observable<void> {
        return new Observable((observer) => {
            this.uploadService.checkNames(names).subscribe((mediaItems: any[]/*MediaItem[]*/ = []) => {
                if (mediaItems.length > 0) {
                    $.each(mediaItems, (i, mediaItem: any /*MediaItem[]*/) => {
                        $.each(this.uploadModels, (j, um: UploadModel) => {
                            if (um.name === mediaItem.FILENAME) {
                                if (!um.meta.medias) {
                                    um.meta.medias = [];
                                }
                                this.uploadModels[j].meta.medias.push(mediaItem);
                            }
                        })
                    });
                }
                observer.next();
                observer.complete();
            });
        })
    }

    showVersions() {
        const mp: IMFXModalProvider = this.injector.get(IMFXModalProvider);
        this.versionModalRef = mp.showByPath(lazyModules.upload_versions_modal, VersionsInsideUploadComponent, {
            name: 'upload-version-modal',
            title: 'upload.version_title',
            size: 'xxl',
            footer: 'cancel|ok'
        }, {});

        this.versionModalRef.load().then((modal: ComponentRef<ErrorModalComponent>) => {
            // debugger
        });
    }

    validateFiles(files) {
        let res = false;
        $.each(files, (k, file) => {
            // check name (english letters only for now)
            let name = $.trim(file.name);
            let reg = this.regExpValid;
            if (!name) {
                this.notificationRef.notifyShow(2, "upload.empty_name");
                // continue
                return true;
            }

            if (!reg.test(name)) {
                this.notificationRef.notifyShow(2, "upload.invalid_name");
                // continue
                return true;
            }

            res = true;
        });

        return res;
    }

    public getFormatIdByExtension(ext): Select2ItemType {
        let fileMediaTypes: MediaFileListTypes | true = this.getMediaTypesByExt(ext);
        let formatId: Select2ItemType = null;
        if (
            fileMediaTypes === undefined ||
            (fileMediaTypes && (<MediaFileListTypes>fileMediaTypes).length === 0)
        ) {
            if (this._availableAllExt === true) {
                formatId = {
                    id: this._availableAllExtObj.Id,
                    text: this._availableAllExtObj.Name
                }
            } else {
                this.notificationRef.notifyShow(2, "upload.error_ext");
                return;
            }
        } else {
            formatId = {
                id: fileMediaTypes[0].Id,
                text: fileMediaTypes[0].Name
            };
        }

        return formatId;
    }

    public bindMediaTypesToExtension() {
        $.each(this.availableExtensions, (k: string, t: MediaFileType) => {
            if (!t.Extensions || t.Extensions === '') { // all extensions is available
                this._availableAllExt = true;
                this._availableAllExtObj = t;
                return true;
            }
            // if(!t.Extensions){
            //     return true
            // }
            $.each(t.Extensions.split('|'), (ex, ev) => {
                if (ev) {
                    if (!this.availableMediaTypesByExtension[ev]) {
                        this.availableMediaTypesByExtension[ev] = [];
                        this.availableMediaTypesByExtension[ev].push(t);
                        this.availableMediaTypesAsSelect2ItemByExtension[ev] = [];
                        this.availableMediaTypesAsSelect2ItemByExtension[ev].push({
                            id: t.Id,
                            text: t.Name
                        } as Select2ItemType);
                        console.log('ex:', ex, 'ev', ev, 'k', k, 't', t);
                    } else {
                        const double = this.availableMediaTypesByExtension[ev].filter((itemSource: MediaFileType) => {
                            return t.Id == itemSource.Id
                        });
                        if (!double || double.length == 0) {
                            this.availableMediaTypesByExtension[ev].push(t);
                            this.availableMediaTypesAsSelect2ItemByExtension[ev].push({
                                id: t.Id,
                                text: t.Name
                            } as Select2ItemType);
                        }
                    }

                    // let select2Type = this.moduleContext.controlMediaTypes.turnObjectToStandart(t, {
                    //     key: 'Id',
                    //     text: 'Name'
                    // });
                    // if (this.arrayProvider.getIndexArrayByProperty(
                    //     select2Type.id,
                    //     this.availableMediaTypesAsSelect2ItemByExtension[ev],
                    //     'id'
                    // ) === null) {
                    //     this.availableMediaTypesAsSelect2ItemByExtension[ev].push(select2Type);
                    // }
                }
            });
        });
    }

    public getMediaTypesAsSelect2ItemByExt(ex: string = ''): Select2ListTypes {
        this.bindMediaTypesToExtension();
        // console.log(this.availableMediaTypesAsSelect2ItemByExtension);
        return this.availableMediaTypesAsSelect2ItemByExtension[ex.toLowerCase()] || [];
    }

    public getMediaTypesByExt(ext: string = ''): MediaFileListTypes {
        this.bindMediaTypesToExtension();
        return this.availableMediaTypesByExtension[ext.toLowerCase()];
    }

    public getMetaData(field: UploadMetaDataTypes, propery = null) {
        const m: UploadModel = this.selectedUploadModel;
        return m.meta[field];
    }

    public removeModel(um: UploadModel) {
        this._uploadModels = this._uploadModels.filter((_um: UploadModel) => {
            return _um.getUniqValue() !== um.getUniqValue();
        });

        if (this.selectedUploadModel && um.getUniqValue() === this.selectedUploadModel.getUniqValue()) {
            this.selectFirstUploadModel();
        }
    }

    public selectFirstUploadModel(trigger: boolean = true) {
        const um = this.getUploadModelsByStates('not_ready')[0];
        if (!um) {
            this._selectedUploadModel = null;
        } else {
            this._selectedUploadModel = um;
            if (trigger && this.moduleContext) {
                this.moduleContext.onSelectUploadModel(this._selectedUploadModel);
            }
        }
    }

    public clearProperties() {
        // this.clearProperties();
        // this._selectedVersion = {};
        this.droppedToBlock = null;
        this.tooHeavyFiles = false;
        this.uploadModalIsOpen = false;
        // this.formData = [];
        // this.currentFiles = [];
        // this.fileNodes = [];
        // this.moduleContext.modalRef.hide();
        // this.moduleContext.uploadMode = false;
        // this.channelSelected = false;
        // this.firstSelectedChannel = undefined;
        // this._uploadModels = [];
        // this.moduleContext.controlChannels.clearSelected();
        this._selectedVersion = null;
        this.forcedUploadMode = null;
        this._associateUploadMode = 'title';
        this._selectedUploadModel = null;
        this._loadingModelId = 0;
        this.onDestroy.emit();
        // this.onDestroy.complete();
        this.onReady = new EventEmitter();
        this.mediaTabIsDisabled = false;
        // this.onDestroy = new EventEmitter();
        // this.moduleContext.modalRef.hide();
        this.selectedPreset = null;
        this.isEnabledGroupFilesForOneWf = true;
        this._selectedVersionDetail = null;
        this.originalVersion = null;
        // clear all not_ready models
        this._uploadModels = this._uploadModels.filter((um: UploadModel) => {
            return um.state !== 'not_ready';
        })
        this.selectedSchemaModel = {};
        this.selectedXmlModel = null;
    }

    public onSelectVersion(version: Select2ItemType, origData: any = null) {
        this._selectedVersion = version;
        this.originalVersion = origData;
        this.setVersion(version, origData);
        this.moduleContext.isValidForm = this.isValidForm();
        this.moduleContext.cdr.markForCheck()
    }

    // todo to component
    isValidForm(withNotice: boolean = false) {
        let res: boolean = true;
        const ums: UploadModel[] = this.getUploadModelsByStates('not_ready');
        if (ums.length === 0) {
            return false;
        }
        if (this._associateUploadMode === 'title') {
            $(this.moduleContext.controlChannels.compRef).parent().removeClass('is-error');
            $(this.moduleContext.controlTitle).removeClass('is-error');
            if (this.moduleContext.controlWorkflow) {
                $(this.moduleContext.controlWorkflow.inputDivElRef).parent().removeClass('is-error');
            }


            if (ums.length > 0) {
                $.each(ums, (k, um: UploadModel) => {
                    const errors = um.isValid(this.associateUploadMode, this.moduleContext.currentStep);
                    if (Object.keys(errors).length > 0) {
                        res = false;
                        // owner
                        if (errors['owner_empty']) {
                            $(this.moduleContext.controlChannels.compRef).parent().addClass('is-error');
                        }
                        // if (errors['wf_empty']) {
                        //     $(this.moduleContext.controlWorkflow.compRef).parent().addClass('is-error');
                        // }
                        //
                        // // title
                        // if (errors['title_empty']) {
                        //     $(this.moduleContext.controlTitle).addClass('is-error');
                        // }

                        return false
                    }
                });

                if (!res) {
                    return false;
                }
            }
        } else if (this._associateUploadMode === 'version') {
            if (!this._selectedVersion || $.isEmptyObject(this._selectedVersion) || (this._selectedVersion.id === 0 && this._selectedVersion.text == '')) {
                return false;
            }
        }

        // if(this.getUploadMethod() !== 'aspera') {
        if (this._availableAllExt === false &&
            this.moduleContext.controlMediaTypes.getSelectedId() === null) {
            return false;
        }
        // }

        if (this.uploadModels.length === 0) {
            return false;
        }


        if (this.moduleContext.currentStep === 1) {
            if (this.moduleContext.controlItemTypes && !this.moduleContext.controlItemTypes.getSelectedId()) {
                res = false;
            }
        }

        if (this.moduleContext) {
            this.moduleContext.isValidForm = res;
            this.moduleContext.cdr.markForCheck();
        }

        return res;
    }

    isValidSubmit() {
        let isValid = true;
        // if (this._associateUploadMode === 'title') {
        const ums: UploadModel[] = this.getUploadModelsByStates('not_ready');
        ums.find(el => {
            if (!el.meta.MiType) {
                isValid = false;
                return
            } else if (Object.keys(el.meta.MiType).length === 0) {
                isValid = false;
                return
            }
            if (!el.meta.MediaFormat) {
                isValid = false;
                return
            } else if (Object.keys(el.meta.MediaFormat).length === 0) {
                isValid = false;
                return
            }
        });
        return ums.length === 0 ? false : isValid
    }

    isValidField(filed, uploadModel: UploadModel = null) {
        if (uploadModel) {
            if (!uploadModel.meta[filed]) {
                return false
            } else if (Object.keys(uploadModel.meta[filed]).length === 0) {
                return false
            }
        } else if (this.selectedUploadModel) {
            if (!this.selectedUploadModel.meta[filed]) {
                return false
            } else if (Object.keys(this.selectedUploadModel.meta[filed]).length === 0) {
                return false
            }
        }
        return true

    }

    upload(): void {
        if (this.groupFilesForOneWf) {
            const grId = Guid.newGuid();
            this.getUploadModelsByStates('not_ready').forEach((um: UploadModel) => {
                um.groupId = grId;
            });
        }

        this.getService(this.getUploadMethod()).upload();
    }

    getUploadModelsByStates(...args: UploadModelStates[]): Array<UploadModel> {
        return this.uploadModels.filter((um: UploadModel, i) => {
            let sol = false;
            $.each(args, (k, st) => {
                if (um.state === st) {
                    sol = true;
                    return false;
                }
            });

            return sol;
        });
    }

    getCountUploadModelsByStates(number, ...args: UploadModelStates[]): UploadModel[] {
        let count = 0;
        const res: UploadModel[] = [];
        $.each(this.uploadModels, (k: number, um: UploadModel) => {
            if (count === number) {
                return false;
            }
            $.each(args, (k, st) => {
                if (um.state === st) {
                    res.push(um);
                    count += 1;
                    return false;
                }
            });
        });

        return res;
    }

    getUploadModelsByNotStates(...args: UploadModelStates[]): Array<UploadModel> {
        return this.uploadModels.filter((um: UploadModel, i) => {
            let sol = false;
            $.each(args, (k, st) => {
                if (um.state !== st) {
                    sol = true;
                    return false;
                }
            });

            return sol;
        });
    }

    getLastAddedFiles(): File[] {
        return this._lastAddedUploadModels.map((um: UploadModel) => um.file);
    }

    getLastUploadModelsByStates(...args: UploadModelStates[]): Array<UploadModel> {
        return this._lastAddedUploadModels.filter((um: UploadModel, i) => {
            let sol = false;
            $.each(args, (k, st) => {
                if (um.state === st) {
                    sol = true;
                    return false;
                }
            });

            return sol;
        });
    }

    getUploadMethodSettings(): UploadMethodSettings | null {
        if(this.baseUploadMenuRef && this.baseUploadMenuRef.ugs) {
            const udms: UploadDefaultMethodSettings = this.baseUploadMenuRef.ugs.uploadTypesSettings;
            return udms.settings.find((s: UploadMethodSettings) => s.id === udms.currentSettingsId);
        }
        return null;
    }

    getUploadMethod(): UploadMethod {
        return this._getUploadMethod()

    }

    getUploadModelByUniqId(id: string): UploadModel {
        return this._uploadModels.find((um: UploadModel) => {
            return um.getUniqValue() === id;
        })
    }

    fetchUploadMethod(): Observable<UploadMethod> {
        return new Observable((observer) => {
            // if(!this.baseUploadMenuRef)
            if (this.baseUploadMenuRef && this.baseUploadMenuRef.sgs) {
                this.getUploadSettings(false).subscribe((res: any) => {
                    if (res && res[0]) {
                        this._uploadGroupSettings = JSON.parse(res[0].DATA) as UploadGroupSettings;
                        this.setApplyAll();
                        observer.next(this._getUploadMethod());
                    } else {
                        observer.next(this.kindOfNativeUploadMethod());
                    }
                });
            } else {
                observer.next(this.kindOfNativeUploadMethod());
            }
        });
    }

    removeCompleted() {
        let self = this;
        let completed = this.getUploadModelsByStates('success', 'warning');
        $.each(completed, (ci, co) => {
            $.each(self.uploadModels, (qi, qo) => {
                if (!co || !qo) {
                    return true;
                }
                if (
                    qo.name === co.name
                    &&
                    qo.size === co.size
                    &&
                    co.state === qo.state
                ) {
                    self.removeModel(qo);
                }
            });
        });

        this.getService(this.getUploadMethod()).storeQueue().subscribe(() => {
            console.log('queue updated');
        })
    }

    updateVal(field: UploadMetaDataTypes, item: Select2ItemType | null, updateAll: boolean = false) {
        const m: UploadModel = this.selectedUploadModel;
        if (!this.preselectedData[field]) {
            this.preselectedData[field] = item;
        }

        if (updateAll) {
            for (const um of this._uploadModels) {
                um.meta[field] = item;
                // todo to component
                this.moduleContext.isValidForm = this.isValidForm();
                this.moduleContext.cdr.markForCheck();
            }
        } else {
            if (m) {
                m.meta[field] = item;
                // todo to component
                this.moduleContext.isValidForm = this.isValidForm();
                this.moduleContext.cdr.markForCheck();
            }
        }
    }

    checkSize() {
        let commonSize = 0;
        $.each(this.getUploadModelsByStates('not_ready'), (k, um: UploadModel) => {
            commonSize += um.size;
        });
        // if (commonSize >= 100 * 1024 * 1024 && !this.tooHeavyFiles) {
        //     this.tooHeavyFiles = true;
        //     let alertModal: IMFXModalComponent = this.moduleContext.modalProvider.showByPath(lazyModules.alert_modal,
        //         IMFXModalAlertComponent, {
        //             title: 'modal.titles.warning',
        //             size: 'md',
        //             position: 'center',
        //             footer: 'ok'
        //         });
        //     alertModal.load().then(cr => {
        //         alertModal.modalEvents.subscribe((e: IMFXModalEvent) => {
        //             if (e.name === 'ok') {
        //                 alertModal.hide();
        //             }
        //         });
        //         (<IMFXModalAlertComponent>cr.instance).setText(this.moduleContext.translate.instant('upload.too_heavy_files'));
        //     });
        // }
    }

    public getService(method?: UploadMethod): InterfaceUploadService {
        if (!method) {
            method = this.getUploadMethod();
        }
        let serviceName;
        switch (method) {
            case 'aspera':
                serviceName = AsperaUploadService;
                break;
            case 'native':
                serviceName = NativeUploadService;
                break;
            case 'native.chunk':
                serviceName = NativeChunkUploadService;
                break;
            case 'remote':
                serviceName = RemoteUploadService;
                break;
            default:
                serviceName = NativeUploadService;
        }

        const s: InterfaceUploadService = this.injector.get(serviceName);
        s.providerContext = this;
        return s;
    }

    public disableMedia() {
        this.mediaTabIsDisabled = true;
    }

    public kindOfNativeUploadMethod(): UploadMethod {
        // return this.worker.getMaxWorkers()?'native.chunk':"native";
        return 'native.chunk';
    }

    public clearAll() {
        const s: InterfaceUploadService = this.getService(this.getUploadMethod());
        this.getUploadModelsByNotStates('calculating', 'progress', 'paused').forEach((um) => {
            this.removeModel(um);
            s.removeItemQueue({name: um.name, size: um.size}).subscribe(() => {
            });
        });
    }

    isVisibleVersionName() {
        let result = !this.isHideXML
        if (this.associateUploadMode === 'title') {
            result = true
        }
        return result

    }

    private loadSchema() {
        if (this._uploadGroupSettings.schema && this._uploadGroupSettings.schema.Id != undefined) {
            this.xmlService.getXmlData(this._uploadGroupSettings.schema.Id, false).subscribe((res: any) => {
                this.moduleContext.xmlEmpty = false;
                this.moduleContext.xmlSchema = res;
                this.onReady.emit();
                this.onReady.complete();
                this.selectFirstUploadModel(true);
                return;
            })
        } else {
            this.moduleContext.xmlEmpty = true;
        }
    }

    private _getUploadMethod(): UploadMethod {
        if (this.moduleContext && this.moduleContext.uploadMethod) {
            if (this.isNativeUpload(this.moduleContext.uploadMethod)) {
                const udms: UploadDefaultMethodSettings = this._uploadGroupSettings.uploadTypesSettings;
                if (udms) {
                    const ums: UploadMethodSettings = udms.settings.find((s: UploadMethodSettings) => s.id === udms.currentSettingsId);
                    if (ums && ums.name) {
                        const uploadMethod: UploadMethod = ums.name.toLowerCase() as UploadMethod;
                        return this.isNativeUpload(uploadMethod) ? this.kindOfNativeUploadMethod() : uploadMethod;
                    } else {
                        return this.kindOfNativeUploadMethod();
                    }
                } else {
                    return this.kindOfNativeUploadMethod();
                }
            } else {
                return this.moduleContext.uploadMethod;
            }
        } else if (this.baseUploadMenuRef && this.baseUploadMenuRef.ugs) {
            const udms: UploadDefaultMethodSettings = this.baseUploadMenuRef.ugs.uploadTypesSettings;
            if (udms && udms.settings) {
                const ums: UploadMethodSettings = udms.settings.find((s: UploadMethodSettings) => s.id === udms.currentSettingsId);
                if (ums && ums.name) {
                    const uploadMethod: UploadMethod = ums.name.toLowerCase() as UploadMethod;
                    return this.isNativeUpload(uploadMethod) ? this.kindOfNativeUploadMethod() : uploadMethod;
                } else {
                    return this.kindOfNativeUploadMethod();
                }
            } else {
                return this.kindOfNativeUploadMethod();
            }
        } else {
            return this.kindOfNativeUploadMethod();
        }
    }
}
