import { UploadService } from "./upload.service";
import { Observable, Subscriber, Subscription } from "rxjs";
import { ConfigService } from "../../../services/config/config.service";
import { ComponentRef, EventEmitter, Injectable, Injector } from "@angular/core";
import {
    InterfaceUploadService,
    UploadServiceErrorResponse,
    UploadServiceSuccessResponse
} from "./interface.upload.service";
import { UploadMetaDataModel, UploadModel } from "../models/models";
import { UploadAssociateMode } from "../upload";
import { UploadMetaFileType, UploadRemoveFileType, UploadResponseModel } from "../types";
import { HttpService } from "../../../services/http/http.service";
import { NotificationService } from "../../notification/services/notification.service";
import { IMFXModalProvider } from "../../imfx-modal/proivders/provider";
import { IMFXModalComponent } from "../../imfx-modal/imfx-modal";
import { IMFXRequireFileComp } from "../modules/require-file-modal/comp";
import { IMFXModalEvent } from "../../imfx-modal/types";
import { ProfileService } from "../../../services/profile/profile.service";
import { LocalStorageService } from "ngx-webstorage";
import { lazyModules } from "../../../app.routes";
import { ErrorManager } from "../../error/error.manager";
import { ErrorManagerProvider } from "../../error/providers/error.manager.provider";
import * as _ from 'lodash';
import { XmlDocumentAssignType } from '../../../views/media-associate/comps/attach-confirm/attach-confirm-modal.component';
// import 'blob-polyfill/Blob';
// const FormData = require('formdata-polyfill');

// const SparkMD5 = require('spark-md5');
export let NativeUploadXHRStatusText: string | 'status_aborted' = '';

@Injectable(/*{providedIn: 'root'}*/)
export class NativeUploadService extends UploadService implements InterfaceUploadService {
    public queueUploadStorageKey: string = 'upload_native_queue';
    public groupMapStoragePrefix = 'upload_native_group_map_storage';
    onPause: EventEmitter<{ um: UploadModel }> = new EventEmitter<{ um: UploadModel }>();
    onRemove: EventEmitter<{ um: UploadModel }> = new EventEmitter<{ um: UploadModel }>();
    onRetry: EventEmitter<{ um: UploadModel }> = new EventEmitter<{ um: UploadModel }>();
    onLoad: EventEmitter<{}> = new EventEmitter<{}>();
    onLogout: EventEmitter<{}> = new EventEmitter<{}>();
    onDestroy: EventEmitter<{}> = new EventEmitter<{}>();
    public lastTriedForUploadModel: UploadModel;

    constructor(public httpService: HttpService,
                public injector: Injector,
                public localStorage: LocalStorageService,
                public profileService: ProfileService,
                public notificationRef?: NotificationService,
                public emp?: ErrorManagerProvider) {
        super(httpService, injector, localStorage, profileService);
        // this.profileService.onGetUserData.subscribe((data: ProfileUserData) => {
        //     this.queueUploadStorageKey = this.queueUploadStorageKey + '|' + data.UserID;
        //     this.groupMapStoragePrefix = this.groupMapStoragePrefix + '|' + data.UserID;
        // })
        // on remove
        this.onRemove
            // .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
            .subscribe((data: { um: UploadModel }) => {
                const um: UploadModel = data.um;
                this.removeItemQueue({
                    name: um.name,
                    size: um.size
                }).subscribe(() => {
                    console.log('Queue item deleted');
                });
                // reset xhr
                um.state = 'aborted';
                if (um.xhr && um.xhr.abort) {
                    um.xhr.imfx_status_text = 'status_aborted';
                    um.xhr.abort();
                }

                this.providerContext.removeModel(um);
                // this.upload();
            });

        // on retry
        this.onRetry
            // .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
            .subscribe((data: { um: UploadModel }) => {
                this.processUpload(data.um);
            });

        // on load app
        this.profileService.onGetUserData
            // .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
            .subscribe(() => {
                this.retrieveModelsOnLoad().subscribe(() => {
                    // debugger;
                });
            })

        // this.onDestroy
    }

    getModels(files: File[]): UploadModel[] {
        return files.map((file: File, k: number) => {
            let um = new UploadModel({
                file: file,
                file_meta: this.fileToJSON(file),
                method: this.providerContext.kindOfNativeUploadMethod(),
                id: this.providerContext.uploadModels.length + k,
                user_id: this.profileService.userData.UserID,
                percentValue: 0,
                chunkingUploadPercent: 0,
                chunkingCalculatingPercent: 0,
            });

            // bind meta data to files
            um = this.bindDefaultDataToModels(um);
            return um;
        });
    }

    bindDefaultDataToModels(um: UploadModel, data = {}): UploadModel {
        const us = this.providerContext.uploadGroupSettings;
        const umdm = new UploadMetaDataModel();
        const ext = um.getFileExtension();
        const psd = this.providerContext.preselectedData;
        const selectedVersion = this.providerContext.selectedVersion;
        const associateUploadMode: UploadAssociateMode = this.providerContext.associateUploadMode;
        if (!us.defaultData) {
            us.defaultData = {};
        }
        if (!um.associateUploadMode) {
            um.associateUploadMode = associateUploadMode;
        }
        if ((!umdm.WorkflowPresetId || umdm.WorkflowPresetId.id === undefined) && us.defaultData.WorkflowPresetId) {
            umdm.WorkflowPresetId = us.defaultData.WorkflowPresetId;
        }
        if ((!umdm.MiType || umdm.MiType.id === undefined) && us.defaultData.MiType) {
            umdm.MiType = us.defaultData.MiType;
        }

        if ((!umdm.Usage || umdm.Usage.id === undefined) && us.defaultData.Usage) {
            umdm.Usage = us.defaultData.Usage;
        }

        if ((!umdm.version || umdm.version.id === undefined) && selectedVersion) {
            umdm.version = selectedVersion;
        }

        if ((!umdm.Owner || umdm.Owner.id === undefined) && (psd.Owner && psd.Owner.id)) {
            umdm.Owner = psd.Owner;
        }

        if (!umdm.Title) {
            umdm.Title = um.getFilenameWithoutExtension();
        }

        if (!umdm.MediaFormat || umdm.MediaFormat.id === undefined) {
            umdm.MediaFormat = this.providerContext.getFormatIdByExtension(um.getFileExtension());
        }

        umdm.Filename = um.name;
        umdm.isLocal = true;
        um.meta = umdm;

        return um;
    }


    storeQueue(): Observable<Subscription> {
        return new Observable((observer) => {
            const key: string = this.queueUploadStorageKey + '|' + this.profileService.userData.UserID;
            this.retrieveQueue().subscribe(() => {
                const models: UploadModel[] = this.providerContext.getUploadModelsByStates('waiting', 'paused', 'progress', 'calculating', 'restored', 'aborted');
                const modelsForStore = [...models].map((um: UploadModel) => {
                    um.meta.medias = null; // todo circular deps
                    delete um.meta.medias;
                    const _um: UploadModel = _.cloneDeep(um)
                    _um.xhr = null;
                    _um.file = null;
                    _um.node = null; // todo remote.model
                    // _um.meta.XmlDocument = null
                    delete _um.xhr;
                    delete _um.file;
                    delete _um.node;
                    return _um as UploadModel;
                });

                const unCircledUm: UploadModel[] = modelsForStore.map((circledUm: UploadModel) => {
                    if (circledUm.meta.XmlDocument) {
                        circledUm.meta.XmlDocument = JSON.parse(JSON.stringify(circledUm.meta.XmlDocument, this.httpService.getCircularReplacer()));
                    }
                    if (circledUm.meta.xmlDocAndSchema) {
                        circledUm.meta.xmlDocAndSchema = JSON.parse(JSON.stringify(circledUm.meta.xmlDocAndSchema, this.httpService.getCircularReplacer()));
                    }
                    return circledUm;
                });
                this.localStorage.store(key, unCircledUm);
                observer.next();
                observer.complete();
            });
        });
    }

    removeItemQueue(data: UploadRemoveFileType): Observable<void> {
        return new Observable((observer) => {
            const key: string = this.queueUploadStorageKey + '|' + this.profileService.userData.UserID;
            this.retrieveQueue().subscribe((ums_json: { [key: string]: any } /*UploadModel[] strurcture as JSON*/) => {
                const ums: UploadModel[] = ums_json.map((um_json) => {
                    return (new UploadModel()).fillModel(um_json);
                });

                const newQueue = ums.filter((um: UploadModel) => {
                    return um && um.name != data.name && um.size != data.size;
                });
                this.localStorage.store(key, newQueue);
                observer.next();
                observer.complete();
            });
        });
    }

    upload(): void {
        if (this.providerContext.uploadModels.length === 0) {
            this.notificationRef.notifyShow(1, 'upload.start');
        } else {
            this.notificationRef.notifyShow(1, 'upload.added_to_line');
        }

        this.providerContext._uploadModels = this.providerContext.uploadModels.map((um: UploadModel) => {
            if (um.state === 'not_ready') {
                um.state = 'waiting';
            }

            return um;
        });

        this.storeQueue().subscribe(() => {
            if (this.providerContext.getUploadModelsByStates('progress').length === 0) {
                this.processUpload();
            }
        });
    }

    public processUpload(um: UploadModel = null, retry: boolean = false) {
        const self: NativeUploadService = this;
        // const ums: UploadModel[] = this.providerContext.getUploadModelsByStates('waiting', 'restored');
        if (!um) {
            const ums: UploadModel[] = this.providerContext.getUploadModelsByStates('waiting', 'restored', 'paused');
            if (ums.length > 0) {
                um = ums[0];
            }
        }
        if (um) {
            if (um.state === 'waiting' || um.state === 'restored' || um.state === 'error' || um.state === 'paused') {
                um.state = 'progress';
                const file = um.file;
                if ((!file || typeof file === 'string') && this.providerContext.isNativeUpload(um.method)) {
                    this._requestFileFromOS(um);
                    return;
                } else {
                    this._upload(um).subscribe(function () {
                        // um.state = 'success';
                        self.lastTriedForUploadModel = um;
                        self.providerContext.baseUploadMenuRef.notifyUpload.emit({
                            model: um,
                            models: self.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error')
                        });
                        this.unsubscribe();
                        // self.providerContext.loadingModelId++;
                        self.processUpload(null, false);
                        self.providerContext.baseUploadMenuRef.cdr.markForCheck();

                    }, function (error) {
                        console.error(error);
                        if (um.state !== 'aborted') {
                            um.state = 'error';
                        }
                        self.providerContext.baseUploadMenuRef.notifyUpload.emit({
                            model: um,
                            models: self.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error')
                        });
                        this.unsubscribe();
                        // self.providerContext.loadingModelId++;
                        self.lastTriedForUploadModel = um;
                        self.processUpload(null, false);
                        self.providerContext.baseUploadMenuRef.cdr.markForCheck();
                    });
                }
            } else {
                self.lastTriedForUploadModel = um;
                self.processUpload(null, false);
            }
        } else {
            let deferred = this.providerContext.getUploadModelsByStates('waiting');
            if (deferred.length > 0) {
                this.providerContext.loadingModelId = 0;
                this.processUpload(um, retry);
            } else {
                if (retry === true && this.lastTriedForUploadModel) {
                    if (this.lastTriedForUploadModel.state === 'success') {
                        this.notificationRef.notifyShow(1, 'upload.completed');
                    } else {
                        this.notificationRef.notifyShow(2, 'upload.aborted');
                    }
                } else {
                    const withError = this.providerContext.getLastUploadModelsByStates('error');
                    const withAbort = this.providerContext.getLastUploadModelsByStates('aborted');
                    const withPause = this.providerContext.getLastUploadModelsByStates('paused');
                    if (withError.length !== 0 || withAbort.length !== 0) {
                        if (withError.length === this.providerContext.uploadModels.length) {
                            this.notificationRef.notifyShow(2, 'upload.error');
                        } else if (withAbort.length !== 0) {
                            this.notificationRef.notifyShow(2, 'upload.aborted');
                        } else {
                            this.notificationRef.notifyShow(2, 'upload.completed_with_errors');
                        }
                    } else {
                        if (withPause.length === 0) {
                            this.notificationRef.notifyShow(1, 'upload.completed');
                        }
                    }
                }
            }
        }
    }

    public _processUploadFile(um: UploadModel, fromRestore: boolean = false) {
        const self = this;
        um.state = 'progress';
        this._upload(um).subscribe(function (resp: UploadResponseModel | any) {
            this.unsubscribe();
            self.providerContext.loadingModelId++;
            self.providerContext.baseUploadMenuRef.cdr.markForCheck();
            self.processUpload();
        }, function () {
            if (um.state !== 'aborted') {
                um.state = 'error';
            }
            this.unsubscribe();
            self.providerContext.baseUploadMenuRef.cdr.markForCheck();
            self.providerContext.loadingModelId++;
            self.processUpload();
        });
    }

    _upload(um: UploadModel): Observable<UploadServiceErrorResponse | UploadServiceSuccessResponse> {
        return new Observable((observer: Subscriber<UploadServiceErrorResponse | UploadServiceSuccessResponse>) => {
            this.prepareUpload(um).subscribe((data) => {
                um.xhr = $.ajaxSettings.xhr();
                this._execUpload(data, um).subscribe(
                    (resp: UploadServiceSuccessResponse) => {
                        this._execUploadSuccess(um, observer, resp);
                    },
                    (error: UploadServiceErrorResponse) => {
                        this._execUploadError(um, observer, error);
                    });
            })
        });
    }

    openDialog() {

    }

    public _requestFileFromOS(um: UploadModel) {
        const mp: IMFXModalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = mp.showByPath(
            lazyModules.upload_require_file,
            IMFXRequireFileComp, {
                title: 'Select file for continue upload',
                size: 'sm',
                position: 'center',

            }, {
                um: um
            });
        modal.load().then((compRef: ComponentRef<IMFXRequireFileComp>) => {
            const comp: IMFXRequireFileComp = compRef.instance;
            comp.onSelectFile.subscribe((um: UploadModel) => {
                this._processUploadFile(um, true);
            });
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'hide') {
                    um.state = 'restored';
                    let _um: UploadModel;
                    let umChallengers = this.providerContext.getUploadModelsByStates('waiting');
                    if (umChallengers.length === 0) {
                        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                        return;
                    }
                    let umChallengerNext = umChallengers.filter(_um => um.id <= _um.id);
                    if (umChallengerNext.length > 0) {
                        _um = umChallengerNext[0];
                    } else {
                        _um = umChallengers[0];
                    }

                    this._processUploadFile(_um, false);
                }
            })
        });
    }

    protected _execUploadError(um: UploadModel, observer: Subscriber<UploadServiceErrorResponse>, error: UploadServiceErrorResponse) {
        um.changeStateByResponse(error);
        observer.error(error);
        observer.complete();
    }

    protected _execUploadSuccess(um: UploadModel, observer: Subscriber<UploadServiceSuccessResponse>, resp: UploadServiceSuccessResponse) {
        // change status of state
        um.changeStateByResponse(resp);

        if (um.groupId !== null) {
            this.createWorkflow(um, observer);
        } else {
            if (um.meta.preset) {
                this._createWorkflow(um).subscribe(([data]) => {
                    (um.response as UploadServiceSuccessResponse).WorkflowResult = data;
                    if (!data.JobId) {
                        um.state = 'warning';
                    }
                    this.removeItemQueue({
                        name: um.name,
                        size: um.size
                    }).subscribe(() => {
                        console.log('Queue item deleted');
                        observer.next(resp);
                        observer.complete();
                        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                    });
                })
            } else {
                observer.next(resp);
                observer.complete();
            }
        }

        this.removeItemQueue({
            name: um.name,
            size: um.size
        }).subscribe(() => {
            console.log('Queue item deleted');
            observer.next(resp);
            observer.complete();
        });

        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
    }

    protected prepareUpload(um: UploadModel): Observable<any> {
        return new Observable((observer) => {

            const rum = {
                Filename: um.name,
                FileSize: um.size,
                IsLocal: um.meta.isLocal.toString(),
                Notes: um.meta.Notes || '',
                // isAccelerated:false,
                // prodItemId: 0,
                fileToUpload: um.file
            };


            //     const data: FormData = new FormData;

            if (um.meta.MediaFormat && um.meta.MediaFormat.id !== undefined) {
                rum['MediaFormatId'] = um.meta.MediaFormat.id;
            }


            if (um.meta.MiType && um.meta.MiType.id !== undefined) {
                rum['MiType'] = um.meta.MiType.id;
            }

            if (um.meta.Usage && um.meta.Usage.id !== undefined) {
                rum['Usage'] = um.meta.Usage.id
            }

            if (um.meta.XmlDocument && this.providerContext.isVisibleVersionName()) {
                const prepared: XmlDocumentAssignType = {
                    SchemaModel: {},
                    XmlModel: um.meta.XmlDocument
                } as XmlDocumentAssignType
                rum['XmlDocument'] = JSON.parse(JSON.stringify(prepared, this.httpService.getCircularReplacer()));
            }

            if (um.groupId === null) {
                if (um.meta.WorkflowPresetId && um.meta.WorkflowPresetId.id !== undefined) {
                    rum['workflowPresetId'] = um.meta.WorkflowPresetId.id;
                }

                // if (um.meta.preset) {
                //     rum['preset'] = um.meta.preset;
                // }

                if (um.meta.xmlDocAndSchema) {
                    rum['xmlDocAndSchema'] = JSON.parse(JSON.stringify(um.meta.xmlDocAndSchema, this.httpService.getCircularReplacer()));
                }

                if (um.meta.xmlDocAndSchema) {
                    if (um.meta.xmlDocAndSchema.SchemaModel) {
                        rum['xmlDocId'] = um.meta.xmlDocAndSchema.SchemaModel.SchemaDbId
                    } else if (um.meta.xmlDocAndSchema.XmlModel) {
                        rum['xmlDocId'] = um.meta.xmlDocAndSchema.XmlModel.SchemaDbId
                    } else {
                        delete rum['xmlDocId'];
                    }
                }
            }

            if (um.meta.AspectRatio && um.meta.AspectRatio.id != undefined) {
                rum['aspectRatio'] = um.meta.AspectRatio.id;
            }

            if (um.meta.AFD && um.meta.AFD.id != undefined) {
                rum['afd'] = um.meta.AFD.id;
            }

            if (um.meta.TvStandard && um.meta.TvStandard.id != undefined) {
                rum['tvStandard'] = um.meta.TvStandard.id;
            }


            if (um.associateUploadMode === 'title') {
                rum['title'] = um.meta.Title.split('\\').pop();
                if (um.meta.Owner && um.meta.Owner.id !== undefined) {
                    rum['owner'] = um.meta.Owner.id;
                }
            } else {
                if (um.meta.version && um.meta.version.id !== undefined) {
                    rum['versionId'] = um.meta.version.id.toString();
                }
            }

            observer.next(rum);
            observer.complete();
        });
    }

    protected _execUpload(data, um: UploadModel): Observable<UploadServiceSuccessResponse | UploadServiceErrorResponse> {
        return new Observable((observer: Subscriber<UploadServiceSuccessResponse | UploadServiceErrorResponse>) => {
            const self = this;
            const url = ConfigService.getAppApiUrl() + UploadService.fsUploadEndpoint;
            $.ajax({
                url: url,
                type: 'POST',
                data: (data as any)._asNative(),
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: (request: any) => {
                    request.setRequestHeader('Accept', 'application/vnd.tmd.mediaflex.api+json;version=1');
                    if (this.httpService.getAuthMode() != "ActiveDirectory") {
                        console.log(this.httpService.getAuthMode());
                        request.setRequestHeader('Authorization', 'Bearer ' + this.httpService.getAccessToken());
                    }
                    request.setRequestHeader('Cache-Control', 'no-cache');
                    request.setRequestHeader('Cache-Control', 'no-store');
                    request.setRequestHeader('Pragma', 'no-cache');
                    // request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                },
                xhr: () => {
                    // Upload progress
                    um.xhr.upload.addEventListener('progress', function (evt) {
                        if (evt.lengthComputable) {
                            um.percentValue = evt.loaded / evt.total;
                            if (self.providerContext.baseUploadMenuRef) {
                                self.providerContext.baseUploadMenuRef.cdr.markForCheck();
                            }
                        }
                    }, false);
                    return um.xhr;
                }
            }).done((result) => {
                this.parseResponseDone(result, observer, um);

            }).fail((erXhr, status, error) => {
                if (um.state !== 'aborted') {
                    const m: ErrorManager = this.emp.getManager();
                    m.handleXHRNetworkError(um.xhr);
                }
                observer.error({xhr: erXhr, status: status, error: error});
            });
        })
    }

    protected parseResponseDone(result: any, observer: Subscriber<UploadServiceSuccessResponse | UploadServiceErrorResponse>, um: UploadModel): void {
        if (result.ExceptionMethod) {
            const m: ErrorManager = this.emp.getManager();
            m.handleXHRNetworkError(um.xhr);
            observer.error({status: 400, error: result.Message});
        } else {
            observer.next(result);
            observer.complete();
        }
    }

    protected parseResponseFail(um: UploadModel, error: UploadServiceErrorResponse, observer: Subscriber<UploadServiceSuccessResponse | UploadServiceErrorResponse>): void {
        const m: ErrorManager = this.emp.getManager();
        m.handleXHRNetworkError(um.xhr);
        observer.error(error);
        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
    }

    private fileToJSON(file: File): UploadMetaFileType {
        return {
            'lastModified': file.lastModified,
            // 'lastModifiedDate': file.lastModifiedDate,
            'name': file.name,
            'size': file.size,
            'type': file.type
        };
    }
}
