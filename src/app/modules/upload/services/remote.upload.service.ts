
import {map} from 'rxjs/operators';
import {UploadService} from "./upload.service";
import {EventEmitter, Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs";
import {
    InterfaceUploadService,
    UploadServiceErrorResponse,
    UploadServiceSuccessResponse
} from "./interface.upload.service";
import {UploadMetaDataModel, UploadModel} from "../models/models";
import {IMFXFBNode} from "../../controls/file-browser/remote-file-browser";
import {UploadAssociateMode} from "../upload";
import {HttpService} from "../../../services/http/http.service";
import {ServerStorageService} from "../../../services/storage/server.storage.service";
import {UploadRemoveFileType} from "../types";
import {NotificationService} from "../../notification/services/notification.service";
import {ProfileService, ProfileUserData} from "../../../services/profile/profile.service";
import { HttpErrorResponse } from '@angular/common/http';
import {LocalStorageService} from "ngx-webstorage";
import {XmlDocumentAssignType} from "../../../views/media-associate/comps/attach-confirm/attach-confirm-modal.component";

@Injectable(/*{providedIn: 'root'}*/)
export class RemoteUploadService extends UploadService implements InterfaceUploadService {
    public queueUploadStorageKey: string = 'upload_remote_queue';
    onPause: EventEmitter<{ um: UploadModel }> = new EventEmitter<{ um: UploadModel }>();
    onRemove: EventEmitter<{ um: UploadModel }> = new EventEmitter<{ um: UploadModel }>();
    onRetry: EventEmitter<{ um: UploadModel }> = new EventEmitter<{ um: UploadModel }>();
    onLoad: EventEmitter<{}> = new EventEmitter<{}>();
    onLogout: EventEmitter<{}> = new EventEmitter<{}>();
    public onDestroy: EventEmitter<{}> = new EventEmitter<{}>();
    private lastTriedForUploadModel: UploadModel;

    constructor(public httpService: HttpService,
                public injector: Injector,
                public localStorage: LocalStorageService,
                public profileService: ProfileService,
                private notificationRef: NotificationService,
                ) {
        super(httpService, injector, localStorage, profileService);
        // this.profileService.onGetUserData.subscribe((data: ProfileUserData) => {
        //     this.queueUploadStorageKey = this.queueUploadStorageKey + '|' + data.UserID;
        //     this.groupMapStoragePrefix = this.groupMapStoragePrefix + '|' + data.UserID;
        // })
        this.onRemove
        // .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
            .subscribe((data: { um: UploadModel }) => {
                this.providerContext.removeModel(data.um);
            });

        this.onRetry.subscribe((data: {um: UploadModel}) => {
            this.processUpload(data.um);
        })
    }

    getModels(data: IMFXFBNode[] = []): UploadModel[] {
        return data.map((node: IMFXFBNode, k: number) => {
            let um: UploadModel = new UploadModel({
                id: this.providerContext.uploadModels.length + k,
                method: 'remote',
                user_id: this.profileService.userData.UserID,
                file_meta: {
                    type: '',
                    name: node.Finename,
                    size: node.Filesize,
                    lastModified: 0,
                },
            });

            um.node = node;
            // bind meta data to files
            um = this.bindDefaultDataToModels(um, node);
            return um;
        })
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

        this.processUpload();
    }

    public processUpload(um: UploadModel = null, retry: boolean = false) {
        const self: RemoteUploadService = this;
        // this._loadingModelId = um.id;
        if (!um) {
            const ums: UploadModel[] = this.providerContext.getUploadModelsByStates('waiting', 'restored');
            if (ums.length > 0) {
                um = ums[0];
            }
        }
        if (um) {
            if (um.state === 'waiting' || um.state === 'restored' || um.state === 'error') {
                um.state = 'progress';
                this._upload(um).subscribe(function () {
                    // um.state = 'success';
                    self.providerContext.baseUploadMenuRef.notifyUpload.emit({
                        model: um,
                        models: self.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error')
                    });
                    self.lastTriedForUploadModel = um;
                    this.unsubscribe();
                    self.providerContext.loadingModelId++;
                    self.processUpload();
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
                    self.providerContext.loadingModelId++;
                    self.lastTriedForUploadModel = um;
                    self.processUpload();
                    self.providerContext.baseUploadMenuRef.cdr.markForCheck();
                });
            } else {
                this.providerContext.loadingModelId++;
                self.processUpload();
            }
        } else {

            let deferred = this.providerContext.getUploadModelsByStates('waiting');
            if (deferred.length > 0) {
                this.providerContext.loadingModelId = 0;
                // this.lastTriedForUploadModel = um;
                this.processUpload();
            } else {
                if (retry === true && this.lastTriedForUploadModel) {
                    if (this.lastTriedForUploadModel.state === 'success') {
                        this.notificationRef.notifyShow(1, 'upload.remote_completed');
                    } else {
                        this.notificationRef.notifyShow(2, 'upload.error_remote');
                    }
                } else {
                    let withError = this.providerContext.getLastUploadModelsByStates('error', 'aborted');
                    if (withError.length !== 0) {
                        if (withError.length === this.providerContext.uploadModels.length) {
                            this.notificationRef.notifyShow(2, 'upload.error_remote');
                        } else {
                            this.notificationRef.notifyShow(2, 'upload.remote_completed_with_errors');
                        }
                    } else {
                        this.notificationRef.notifyShow(1, 'upload.remote_completed');
                    }
                }
            }

        }
    }


    _upload(um: UploadModel, index?: number): Observable<UploadServiceErrorResponse | UploadServiceSuccessResponse> {
        // todo RemoteUploadModel implemented UploadModelInterface (see IMFXRemoteUploadModel)
        const rum = {
            deviceId: um.node.getDeviceId(),
            filename: um.name,
            fileSize: um.size,
            isLocal: um.meta.isLocal,
            notes: um.meta.Notes,
            subFolder: um.node.getSubFolder(),
            isAccelerated:false,
            prodItemId: 0,

        };
        if (um.meta.MediaFormat && um.meta.MediaFormat.id !== undefined) {
            rum['mediaFormatId'] = um.meta.MediaFormat.id;
        }

        if (um.meta.MiType && um.meta.MiType.id !== undefined) {
            // rum['MiType'] = {Id: um.meta.MiType.id};
            rum['miType'] = um.meta.MiType.id;
        }

        if (um.meta.Usage && um.meta.Usage.id !== undefined) {
            rum['usage'] = um.meta.Usage.id;
        }

        if (um.meta.XmlDocument && this.providerContext.isVisibleVersionName()) {
            const prepared: XmlDocumentAssignType = {
                SchemaModel: {},
                XmlModel: um.meta.XmlDocument
            } as XmlDocumentAssignType
            rum['XmlDocument'] = JSON.parse(JSON.stringify(prepared, this.httpService.getCircularReplacer()));
        }

        if(um.groupId === null) {
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

            if (um.meta.Notes) {
                rum['notes'] = um.meta.Notes;
            }
        }

        if (um.meta.AspectRatio) {
            rum['aspectRatio'] = um.meta.AspectRatio.id;
        }

        if (um.meta.AFD && um.meta.AFD.id != undefined) {
            rum['afd'] = um.meta.AFD.id;
        }
        if (um.meta.TvStandard) {
            rum['tvStandard'] = um.meta.TvStandard.id;
        }

        if (um.associateUploadMode === 'title') {
            rum['title'] = um.meta.Title;
            if (um.meta.Owner && um.meta.Owner.id !== undefined) {
                rum['owner'] = um.meta.Owner.id;
            }
        } else {
            if (um.meta.version && um.meta.version.id !== undefined) {
                rum['versionId'] = um.meta.version.id.toString();
            }
        }

        return new Observable((observer: any) => {
            this.httpService.post(
                UploadService.remoteUploadEndpoint,
                JSON.stringify(rum)
                ).pipe(
                    map(res => res.body)
                ).subscribe((result) => {
                    if (result.StackTraceString) {
                        const e: UploadServiceErrorResponse = {status: 400, error: result.Message};
                        observer.error(e);
                        observer.complete();
                        um.changeStateByResponse(e);
                    } else {
                        observer.next(result);
                        um.changeStateByResponse(result);
                        if (um.groupId !== null) {
                            this.createWorkflow(um, observer);
                        }
                        observer.complete();
                    }
                }, (err: HttpErrorResponse) => {
                    let error = null;

                    if (err.error.Message) {
                        error = err.error.Message
                    }

                    if (err.error.Error) {
                        error = err.error.Error
                    }

                    const e: UploadServiceErrorResponse = {status: 500, error};
                    observer.error(e);
                    um.changeStateByResponse(e);
                }, () => {
                    observer.complete();
                });

        });
    }

    openDialog() {

    }

    public bindDefaultDataToModels(um: UploadModel, node: IMFXFBNode): UploadModel {
        // IMPORTANT!!!
        if (/*node !instanceof IMFXFBNode*/ !node || !node.getDeviceId) {
            node = null;
        }
        const us = this.providerContext.uploadGroupSettings;
        const umdm = new UploadMetaDataModel();
        const ext = um.getFileExtension();
        const psd = this.providerContext.preselectedData;
        const selectedVersion = this.providerContext.selectedVersion;
        const associateUploadMode: UploadAssociateMode = this.providerContext.associateUploadMode;

        if (!um.associateUploadMode) {
            um.associateUploadMode = associateUploadMode;
        }
        umdm.MediaFormat = this.providerContext.getFormatIdByExtension(ext);
        if (!us.defaultData) {
            us.defaultData = {};
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

        if (umdm.DeviceId === undefined && node) {
            umdm.DeviceId = node.getDeviceId().toString();
        }

        if (umdm.SubFolder === undefined && node) {
            umdm.SubFolder = node.getSubFolder();
        }

        if (umdm.path === undefined && node) {
            umdm.path = node.getPath();
        }


        umdm.Filename = um.name;
        umdm.isLocal = false;
        um.meta = umdm;

        return um;
    }

    public retrieveQueue(): Observable<UploadModel[]> {
        return new Observable((observer: any) => {
            observer.next([]);
            observer.complete();
        });
    }

    public storeQueue(): Observable<UploadModel[]> {
        return new Observable((observer: any) => {
            observer.next([]);
            observer.complete();
        });
    }

    public removeItemQueue(data: UploadRemoveFileType): Observable<void> {
        return new Observable((observer: any) => {
            observer.next();
            observer.complete();
        });
    }

    getAllFilesFromFolder(id, path) {
        return this.httpService.post('/api/v3/foldercontents/'+id,
            JSON.stringify({
                "Path": path
            })
        ).pipe(
            map(res => res.body)
        )
    }
}
