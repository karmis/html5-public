import {UploadService} from "./upload.service";
import {EventEmitter, Injectable, Injector} from "@angular/core";
import {
    InterfaceUploadService,
    UploadServiceErrorResponse,
    UploadServiceSuccessResponse
} from "./interface.upload.service";
import {forkJoin, Observable, Subscriber, Subscription} from "rxjs";
import {HttpService} from "../../../services/http/http.service";
import {UploadMetaDataModel, UploadModel} from "../models/models";
import {UploadAssociateMode, UploadComponent} from "../upload";
import {UploadMetaFileType, UploadMethodSettings} from "../types";
import {NotificationService} from "../../notification/services/notification.service";
import {map, takeUntil, takeWhile} from "rxjs/operators";
import {ProfileService, ProfileUserData} from "../../../services/profile/profile.service";
import {SlickGridProvider} from "../../search/slick-grid/providers/slick.grid.provider";
import {SlickGridRowData} from "../../search/slick-grid/types";
import {LocalStorageService} from "ngx-webstorage";
import {HttpErrorResponse} from '@angular/common/http';
import { XmlDocumentAssignType } from 'app/views/media-associate/comps/attach-confirm/attach-confirm-modal.component';

declare var AW4: any;

export type UploadAsperaResponseType = { um: UploadModel, response: UploadServiceErrorResponse | UploadServiceSuccessResponse };

@Injectable(/*{providedIn: 'root'}*/)
export class AsperaUploadService extends UploadService implements InterfaceUploadService {
    public onTransferReceived: EventEmitter<any> = new EventEmitter<any>();
    public onAsperaReady: EventEmitter<any> = new EventEmitter<any>();
    public onRetry: EventEmitter<any> = new EventEmitter<any>();
    public onPause: EventEmitter<any> = new EventEmitter<any>();
    public onRemove: EventEmitter<any> = new EventEmitter<any>();
    public onLoad: EventEmitter<{}> = new EventEmitter<{}>();
    public onDestroy: EventEmitter<{}> = new EventEmitter<{}>();
    public onLogout: EventEmitter<{}> = new EventEmitter<{}>();
    public onStartUpload: EventEmitter<void> = new EventEmitter<void>();
    public queueUploadStorageKey: string = 'upload_aspera_queue';
    public groupMapStoragePrefix: string = 'upload_aspera_group_map_storage';
    private readonly CONNECT_INSTALLER = "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
    private readonly CONNECT_MIN_VERSION = "3.6.0";
    private transferData = [];
    private uploadHost;
    private uploadUser;
    private uploadPassword;
    private destinationRoot;
    private sshPort;
    private asperaWeb: any;
    private prefixSpecsStorage: string = 'upload_aspera_specs';
    // private obsRemote: Observable<any>[] = [];
    private isLoaded = {};
    private isReady = false;
    private trRecSbs: Subscription; // complete it
    private _uploadSbs: Subscription; // complete it
    private obsRemote: Subscription;
    private queueToRemoteUpload: number[] = [];
    private iterationToken: number = null;
    private externalContext: any = null;
    private subFolderDestination = '';

    constructor(public httpService: HttpService,
                public injector: Injector,
                public localStorage: LocalStorageService,
                public profileService: ProfileService,
                private notificationRef?: NotificationService) {
        super(httpService, injector, localStorage, profileService);
        // this.profileService.onGetUserData.subscribe((data: ProfileUserData) => {
        //     this.queueUploadStorageKey = this.queueUploadStorageKey + '|' + data.UserID;
        //     this.groupMapStoragePrefix = this.groupMapStoragePrefix + '|' + data.UserID;
        // })

        // on retry
        this.onRetry
            .subscribe((data: { um: UploadModel }) => {
                if (data.um.transfer_uuid && this.asperaWeb) {
                    this.processUpload(data.um, true);
                }
            });

        // on load app
        this.profileService.onGetUserData
            .subscribe(() => {
                forkJoin(
                    this.retrieveModelsOnLoad()
                ).subscribe(
                    (data: any[]) => {
                        const ums: UploadModel[] = data[0].restored;
                        if (ums.length > 0) {
                            // if (this.asperaWeb) {
                            //     this.asperaWeb.stop();
                            // }
                            let restored: boolean = false;
                            const asperareadySbs = this.onAsperaReady
                                .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
                                .subscribe(() => {
                                    if (asperareadySbs.unsubscribe) {
                                        asperareadySbs.unsubscribe();
                                    }
                                    // this.onAsperaReady.complete();
                                    // if (!restored) {
                                    restored = true;
                                    this._restoreData(ums);
                                    // }

                                });

                            // setTimeout(() => {
                            this.initAspera();
                            // })


                            // if(this.asperaWeb){
                            //     this._restoreData(ums);
                            // } else {
                            //     this.onAsperaReady.subscribe(() => {
                            //         this._restoreData(ums);
                            //     })
                            //     setTimeout(() => {
                            //         this.initAspera();
                            //     })
                            // }
                        } else {
                            if(this.providerContext.baseUploadMenuRef) {
                                const asperareadySbs = this.onAsperaReady
                                    .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
                                    .subscribe(() => {
                                        if (asperareadySbs.unsubscribe) {
                                            asperareadySbs.unsubscribe();
                                        }
                                        this.clearQueueInAsperaClient().subscribe(() => {

                                        });

                                    });
                                this.initAspera();
                            }

                        }
                    });
            });

        // on pause
        this.onPause
            .subscribe((data: { um: UploadModel }) => {
                if (data.um.transfer_uuid && this.asperaWeb) {
                    this.asperaWeb.stopTransfer(data.um.transfer_uuid, {
                        success: (result) => {
                            console.log("Paused transfer id : " + data.um.id + " " + JSON.stringify(result, null, 4));
                            data.um.state = "paused";
                            this.providerContext.baseUploadMenuRef.cdr.detectChanges();
                        }
                    });
                }
            });

        // on remove
        this.onRemove
            .subscribe((data: { um: UploadModel }) => {
                const um: UploadModel = data.um;
                if (um && um.id !== undefined) {
                    this.removeItemQueue(um).subscribe(() => {
                        console.log('Queue item deleted');
                    });

                    this.providerContext.removeModel(um);

                    if (this.asperaWeb && um.transfer_uuid) {
                        this.asperaWeb.removeTransfer(um.transfer_uuid, {
                            success: (result) => {
                                console.log("Removed transfer id : " + um.transfer_uuid + " " + JSON.stringify(result, null, 4));
                                this.providerContext.baseUploadMenuRef.cdr.detectChanges();
                            }
                        });
                    }
                }
            });

        // on destroy
        this.onDestroy
            .subscribe(() => {
                this.queueToRemoteUpload = [];
                this.onTransferReceived.complete();
                $('script[src*="asperaweb-4.min.js"]').remove();
                $('script[src*="connectinstaller-4.min.js"]').remove();
                this.isLoaded = {};
                this.onAsperaReady = new EventEmitter<any>();
                this.onTransferReceived = new EventEmitter<any>();
                this.clearQueueInAsperaClient(this.providerContext.getUploadModelsByStates(
                    'waiting', 'paused', 'progress', 'calculating', 'restored', 'aborted', 'warning', 'success', 'error'
                )).subscribe(() => {
                    if (this.asperaWeb) {
                        this.asperaWeb.stop();
                        this.asperaWeb = undefined;
                    }

                    // this.onRemove.complete()
                    // this.onAsperaReady.complete();
                    // this.onPause.complete();
                    // this.asperaWeb.stop();
                })
            });
    }

    getModels(files: File[]): UploadModel[] {
        return files.map((file: File, k: number) => {
            let um: UploadModel = new UploadModel({
                file: file,
                file_meta: this.fileToJSON(file),
                method: 'aspera',
                id: this.providerContext.uploadModels.length + k,
                user_id: this.profileService.userData.UserID
            });

            um = this.bindDefaultDataToModels(um);
            return um;
        });
    }

    openDialog(opts) {
        if (this.asperaWeb) {
            this._openDialog(opts);

        } else {
            this.initAspera();
            setTimeout(() => {
                this.onAsperaReady.subscribe(() => {
                    this._openDialog(opts);
                })
            })
        }
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
        if ((umdm.WorkflowPresetId && umdm.WorkflowPresetId.id === undefined) && us.defaultData.WorkflowPresetId) {
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
        let queue = [];
        if (retry === true) {
            queue = this.providerContext.getUploadModelsByStates('restored', 'error', 'paused');
            if (um) {
                queue = queue.filter((_um: UploadModel) => {
                    return um.id === _um.id;
                });
            }
        } else {
            queue = this.providerContext.getUploadModelsByStates('waiting', 'restored');
            if (um) {
                queue = queue.filter((_um: UploadModel) => {
                    return um.id === _um.id;
                });
            }
        }

        this._upload(queue, retry);
    }

    handleTransferEvents(event, transfersJsonObj) {
        switch (event) {
            case 'transfer':
                this.onTransferReceived.emit(transfersJsonObj);
                break;
        }
    }

    transfer(transferSpec, connectSettings) {
        this.asperaWeb.startTransfer(transferSpec, connectSettings, {
            error: (obj) => {
                console.log("Failed to start : " + JSON.stringify(obj, null, 4));
            },
            success: (result) => {
                if (result.transfer_specs && result.transfer_specs.length === 1 && result.transfer_specs[0].transfer_spec.paths.length === 1) {
                    this.providerContext.uploadModels.forEach((um: UploadModel) => {
                        // if (um.state === "waiting") {
                        if (um.name === result.transfer_specs[0].transfer_spec.paths[0].source) {
                            um.transfer_uuid = result.transfer_specs[0].uuid
                            // }
                        }
                    });

                    // store model with correct id
                    this.storeQueue().subscribe(() => {
                    });
                    console.log("Started transfer : " + JSON.stringify(transferSpec, null, 4));
                } else {
                    console.error('>>> transfer.success (wrong input data)');
                }

            }
        });
    }

    getTransferEvents(iterationToken?) {
        const callbacks = {
            success: (allXfers) => {
                if (typeof allXfers.error === 'undefined') {
                    let resultcount = allXfers.result_count;
                    let xfers = allXfers.transfers;
                    for (let i = 0; i < resultcount; i++) {
                        console.log(xfers[i].status);
                    }
                    this.iterationToken = allXfers.iterationToken;
                }
            },
            error: (err) => {
                debugger
            }
        };
        this.asperaWeb.getAllTransfers(callbacks, iterationToken);
    }

    private deviceId = null;
    initAspera(opts = {externalContext: null, rebindEvents: true}) {
        if (opts.externalContext) {
            this.externalContext = opts.externalContext;
        }
        if (this.asperaWeb) {
            if (opts.rebindEvents === true) {
                this.rebindEvents();
            }
            return;
        }
        const uploadMethodSettings: UploadMethodSettings = this.providerContext.getUploadMethodSettings();
        this.deviceId = uploadMethodSettings && uploadMethodSettings.deviceId !== undefined ? uploadMethodSettings.deviceId : null;
        if (this.deviceId === null) {
            // alert('Failed start Aspera service. Please, select device');
            return false
        } else {
            this.httpService.get('/api/v3/device/' + this.deviceId).pipe(map((res: any) => res.body)).subscribe((data: {
                Destination: any,
                Host: string,
                ID: number,
                Name: string,
                Pwd: string,
                User: string,
                SshPort: number
            }) => {
                this.uploadHost = data.Host;
                this.uploadUser = data.User;
                this.uploadPassword = data.Pwd;
                this.destinationRoot = data.Destination;
                this.sshPort = data.SshPort;
                let flag = this._loadLib('asperaweb', this.CONNECT_INSTALLER + '/asperaweb-4.min.js');
                if (flag) {
                    this._loadLib('connectinstaller', this.CONNECT_INSTALLER + '/connectinstaller-4.min.js');
                }

                if(this.providerContext.baseUploadMenuRef) {
                    this.receiverHolder = this.subscribeReceiver()
                        .pipe(
                            takeWhile(() => {
                                return this.providerContext.getUploadModelsByStates("progress", "calculating", "waiting", "success", "warning").length > 0
                            }))
                        .subscribe((data: UploadAsperaResponseType) => {
                            this.onCompleteLoadModel(data)
                        });
                }
            });
        }
    }


    storeQueue(): Observable<Subscription> {
        return new Observable((observer) => {
            this.retrieveQueue().subscribe((old_ums: UploadModel[]) => {
                const key:string = this.queueUploadStorageKey + '|' + this.profileService.userData.UserID;
                let modelsForStore: UploadModel[] = this.providerContext.getUploadModelsByStates(
                    'waiting', 'paused', 'progress', 'calculating', 'restored') /*'aborted', 'error', 'success', 'warning'*/
                    .map((um: UploadModel) => {
                        um.meta.medias = null; // todo circular deps
                        delete um.meta.medias;
                        const _um = JSON.parse(JSON.stringify(um));
                        _um.xhr = null;
                        _um.file = null;
                        _um.meta.node = null; // todo remote.model
                        delete _um.xhr;
                        delete _um.file;
                        delete _um.meta.node;
                        return _um as UploadModel;
                    });

                this.localStorage.store(key, modelsForStore);
                observer.next();
                observer.complete();
            });
        });
    }

    removeItemQueue(_um: UploadModel): Observable<void> {
        return new Observable((observer) => {
            const key:string = this.queueUploadStorageKey + '|' + this.profileService.userData.UserID;
            this.retrieveQueue().subscribe((ums_json: { [key: string]: any } /*UploadModel[] strurcture as JSON*/) => {
                const ums: UploadModel[] = ums_json.map((um_json) => {
                    return (new UploadModel()).fillModel(um_json);
                });

                const newQueue = ums.filter((um: UploadModel) => {
                    return um && um.name != _um.name && um.size != _um.size && _um.transfer_uuid === um.transfer_uuid;
                });
                this.localStorage.store(key, newQueue);
                observer.next();
                observer.complete();
            });
        });
    }

    private _restoreData(ums: UploadModel[] = []) {
        // reload or re-login
        // clear
        if (this.providerContext.uploadModels.length > 0) {
            this.clearQueueInAsperaClient(this.providerContext.uploadModels).subscribe(() => {
                // init upload
                // if (this.profileService.userData.UserID === ums[0].user_id) {
                // clear
                // this.clearQueueInAsperaClient(ums).subscribe(() => {
                // init upload
                // this.subscribeReceiver()
                //     .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
                //     .subscribe((data: UploadAsperaResponseType) => {
                //         this.onCompleteLoadModel(data);
                //     });
                this._upload(ums);
                // });
                // } else {
                //     // subscribe
                //
                // }
            });
        } else {
            this._upload(ums);
        }

        // if (this.profileService.userData.UserID === ums[0].user_id) {
        //
        // } else {
        //     this.subscribeReceiver()
        //         .pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$))
        //         .subscribe((data: UploadAsperaResponseType) => {
        //             this.onCompleteLoadModel(data);
        //         });
        // }
        console.log('restored data', ums);
    }

    private clearQueueInAsperaClient(ums: UploadModel[] = []): Observable<void> {
        return new Observable((observer) => {
            let i = 0;
            if (!ums || ums.length === 0) {
                observer.next();
                observer.complete();
                console.log("clearQueueInAsperaClient finished(empty) ");
            } else {
                ums.forEach((um) => {
                    // this.asperaWeb.stopTransfer(um.transfer_uuid, {
                    //     success: (result) => {
                    //         console.log("Paused transfer id : " + um.transfer_uuid + " " + JSON.stringify(result, null, 4));
                    if (!this.asperaWeb || um.transfer_uuid) {
                        observer.next();
                        observer.complete();
                    }
                    this.asperaWeb.removeTransfer(um.transfer_uuid, {
                        success: (result) => {
                            i++;
                            console.log("Removed transfer id : " + um.transfer_uuid + " " + JSON.stringify(result, null, 4));
                            if (i === ums.length) {
                                observer.next();
                                observer.complete();
                                console.log("clearQueueInAsperaClient finished ");
                            }
                        },
                        error: (err) => {
                            console.error(err);
                            observer.next();
                            observer.complete();
                        }
                    });
                    //     },
                    //     error: (err) => {
                    //         console.error(err);
                    //         observer.next();
                    //         observer.complete();
                    //     }
                    // });
                });
            }

            // setTimeout(() => {
            //     if(i !== ums.length) {
            //         observer.next();
            //         observer.complete();
            //         console.warn("clearQueueInAsperaClient not finished ");
            //     }
            // },5000);
        });
    }

    private onCompleteLoadModel(data: UploadAsperaResponseType) {
        // console.log(data);
        // if(this.receiverHolder) {
        //     this.receiverHolder.unsubscribe();
        // }
        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
        // debugger
    }

    private getUniqName(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    }

    private patchTransferSpec(deviceId, spec: any): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/asperadevice/' + deviceId + '/upload/transfertoken',
                        JSON.stringify(spec),
                        {withCredentials: true}
                    ).pipe(
                    map((res: any) => {
                        return res.body;
                    })).subscribe(
                    (rest) => {
                        observer.next(rest);
                    },
                    (error) => {
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    }
                );
            }
        );
    }

    private receiverHolder: Subscription;
    private _upload(ums: UploadModel[], retry: boolean = false): void {
           this.isReady = true;
            if (retry === false) {
                this.subFolderDestination = this.getUniqName();
                const transferSpec = {
                    "paths": [],
                    "http_fallback": false,
                    "ssh_port": this.sshPort,
                    "direction": "send",
                    "rate_policy": "fair",
                    "resume": "sparse_checksum",
                    "destination_root": this.destinationRoot + '/' + this.subFolderDestination,
                    "destination_subfolder": this.subFolderDestination,
                    "create_dir": true
                };

                $.each(ums, (k, um: UploadModel) => {
                    if (um.cookie) {
                        transferSpec["cookie"] = um.cookie;
                    } else {
                        um.cookie = um.getUniqValue();
                        transferSpec["cookie"] = um.cookie;
                    }
                    transferSpec.paths = [{"source": um.name}];

                    var transferSpecForPatch = {
                        "transfer_requests": [
                            {
                                "transfer_request": transferSpec
                            }
                        ]
                    }
                    this.patchTransferSpec(this.deviceId, transferSpecForPatch).subscribe((patchedSpec)=>{
                        if(patchedSpec["transfer_specs"] && patchedSpec["transfer_specs"].length > 0 &&
                            patchedSpec["transfer_specs"][0]["transfer_spec"]) {
                            patchedSpec["transfer_specs"][0]["transfer_spec"]["authentication"] = "token";
                            this.transfer(patchedSpec["transfer_specs"][0]["transfer_spec"], {
                                "allow_dialogs": "no"
                            });
                        }
                        else {
                            console.error("Something went wrong! Transfer spec wasn't patched properly!");
                        }
                    })
                });
            } else {
                ums.forEach((um: UploadModel) => {
                    this.asperaWeb.resumeTransfer(um.transfer_uuid, null, {
                        success: (result) => {
                            console.log("Resume transfer id : " + um.transfer_uuid + " " + JSON.stringify(result, null, 4));
                            this.providerContext.baseUploadMenuRef.cdr.detectChanges();
                        },
                        error: (obj) => {
                            const msg = "Error on resume transfer : " + um.transfer_uuid + " " + JSON.stringify(obj, null, 4);
                            um.changeStateByResponse({
                                error: msg,
                                status: 0
                            });
                            console.log(msg);
                        }
                    });
                });
            }


            // this.serverStorage.store(this.prefixSpecsStorage, JSON.stringify(transferSpec)).subscribe(() => {
            //     console.log('specs stored', transferSpec);
            // });


            // observer.next();serverStorage.store
            // observer.complete();
    }

    private subscribeReceiver(): Observable<UploadAsperaResponseType> {
        return new Observable((observer: Subscriber<UploadAsperaResponseType>) => {
            this.trRecSbs = this.onTransferReceived.pipe(takeUntil(this.providerContext.baseUploadMenuRef.destroyed$)).subscribe((res: any) => {
                // um.changeStateByResponse({status: 0, error: '123'});
                if (!this.providerContext._uploadModels.length) {
                    // console.warn('Empty list of upload models');
                    return;
                }
                if (res && res.result_count > 0) {
                    this.transferData = [];
                    $.each(res.transfers, (i, transfer) => {
                        if (this.providerContext.baseUploadMenuRef.profileService.userData.UserID != transfer.transfer_spec.cookie.split('|')[0]) {
                            return
                        }
                        // if(!transfer.files || transfer.files.length === 0) {
                        //     if(!transfer.transfer_spec || !transfer.transfer_spec.paths || transfer.transfer_spec.paths.length !== 1) {
                        //         console.error('Incorrect data from aspera receiver');
                        //         return true;
                        //     }
                        // }
                        let um: UploadModel = this.providerContext.uploadModels.find((um: UploadModel) => um.cookie == transfer.transfer_spec.cookie);
                        if (!um) {
                            um = this.providerContext.uploadModels.find((um: UploadModel) => um.transfer_uuid == transfer.uuid);
                        }
                        if (!um) {
                            um = this.providerContext.uploadModels.find((um: UploadModel) => (
                                um.name == transfer.explorer_path &&
                                // um.state !== 'error' &&
                                um.state !== 'success' &&
                                um.state !== 'warning'
                            ));
                        }
                        if (!um) {
                            // console.error('Cant get model in subscribe receiver');
                            // observer.error({
                            //     status: 0,
                            //     error: 'Cant get model in subscribe receiver'
                            // } as UploadServiceErrorResponse);
                            // trRecSbs.unsubscribe();
                            // observer.complete();
                            return true;
                        }

                        // finished already
                        // if (um.response && status.response.status) {
                        if (transfer.status === "removed") {
                            if (um.cookie === transfer.transfer_spec.cookie && um.transfer_uuid === transfer.uuid) {
                                this.providerContext.removeModel(um);
                                this.removeItemQueue(um).subscribe(
                                    () => {
                                        this.providerContext.baseUploadMenuRef.cdr.detectChanges();
                                    },
                                    () => {
                                    }
                                );
                            }

                            return true;
                        }

                        // return true;
                        //
                        // }

                        let info = transfer.current_file;
                        if (transfer.status === 'running') {
                            um.state = 'progress';
                        } else if (transfer.status === 'initiating') {
                            um.state = 'calculating';
                            um.percentValue = 1;
                        } else if (transfer.status === 'cancelled') {
                            um.state = 'paused';
                        } else if (transfer.status === 'completed') {
                            info = transfer.title;
                            um.percentValue = 1;
                            if (this.queueToRemoteUpload.indexOf(um.id) === -1) {
                                um.state = 'progress'; // it will be finished after successful response from remote.upload.service:upload()
                                this.queueToRemoteUpload.push(um.id);
                                console.log(transfer.status, um.id);

                                if (um.response && (um.response as UploadServiceErrorResponse).error) {
                                    return true;
                                }
                                this.obsRemote = this.remoteUpload(um, transfer)
                                    // .pipe(takeWhile(um => !!um.response))
                                    .subscribe((res: /*UploadServiceErrorResponse | UploadServiceSuccessResponse*/ any) => {
                                        um.changeStateByResponse(res);
                                        this.storeQueue().subscribe(() => {
                                            observer.next(res);
                                            //this.obsRemote.unsubscribe();
                                            this.queueToRemoteUpload.splice(this.queueToRemoteUpload.indexOf(um.id), 1);
                                            this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                                        });
                                        // trRecSbs.unsubscribe();
                                        // observer.complete();
                                    }, (error: UploadAsperaResponseType) => {
                                        um.changeStateByResponse(error.response);
                                        this.storeQueue().subscribe(() => {
                                            observer.next(error);
                                            //this.obsRemote.unsubscribe();
                                            this.queueToRemoteUpload.splice(this.queueToRemoteUpload.indexOf(um.id), 1);
                                            this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                                        });

                                        // trRecSbs.unsubscribe();
                                        // observer.complete();
                                    });
                            }

                            return true;
                        } else if (transfer.status === "failed") {
                            um.state = 'error';
                            const resp: UploadServiceErrorResponse = {
                                error: transfer.title + ": " + transfer.error_desc,
                                status: 0
                            };
                            observer.next({um: um, response: resp} as UploadAsperaResponseType);
                            // trRecSbs.unsubscribe();
                            // observer.complete();
                            um.changeStateByResponse(resp);
                        } else if (transfer.status === "removed") {
                            if (um.cookie === transfer.transfer_spec.cookie && um.transfer_uuid === transfer.uuid) {
                                this.providerContext.removeModel(um);
                                this.removeItemQueue(um).subscribe(
                                    () => {
                                        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                                    },
                                    () => {
                                    }
                                );
                            }
                        }
                        let textInfo = transfer.transfer_spec.direction + " - " + info;

                        // let jsonResult = JSON.stringify(transfer, null, 4);
                        // let someData = transfer.transfer_spec.tags.aspera.xfer_id;

                        this.transferData.push({
                            Progress: Math.floor(transfer.percentage * 100),
                            Info: textInfo,
                            Status: transfer.status
                        });

                        um.percentValue = transfer.percentage;
                        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                    });
                }
            });
        });

    }

    private _openDialog(opts) {
        this.asperaWeb.showSelectFileDialog({
            success: (!opts.withUpload ? opts.callback : (dataTransferObj) => {
                if (dataTransferObj.dataTransfer) {
                    this.providerContext.select(dataTransferObj.dataTransfer.files, 'aspera');
                }
            }),
            error: (err) => {
                console.error(err)
            }
        }, {
            allowMultipleSelection: true
        });
    }

    private remoteUpload(um: UploadModel, transfer: any): Observable<UploadAsperaResponseType> {
        console.log('>>> aspera subfolder', transfer.transfer_spec.destination_subfolder);
        const device: UploadMethodSettings = this.providerContext.getUploadMethodSettings();
        const deviceId = device ? device.deviceId : null;
        const rum = {
            deviceId: deviceId,
            filename: transfer.title,
            fileSize: um.size,
            isLocal: false,
            notes: um.meta.Notes || '',
            // SubFolder: this.destinationRoot,
            subFolder: transfer.transfer_spec.destination_subfolder,
            isAccelerated:false,
            prodItemId: 0,
        };

        if (um.meta.MediaFormat && um.meta.MediaFormat.id !== undefined) {
            rum['mediaFormatId'] = um.meta.MediaFormat.id;
        }

        // if (um.meta.WorkflowPresetId && um.meta.WorkflowPresetId.id !== undefined) {
        //     rum['workflowPresetId'] = um.meta.WorkflowPresetId.id;
        // }

        // rum['MiType'] = {Id: um.meta.MiType.id};
        if (um.meta.MiType && um.meta.MiType.id !== undefined) {
            rum['miType'] = um.meta.MiType.id;
        }

        if (um.meta.Usage && um.meta.Usage.id !== undefined) {
            rum['usage'] = um.meta.Usage.id
        }

        if (um.meta.XmlDocument) {
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
                rum['xmlDocAndSchema'] = um.meta.xmlDocAndSchema;
            }

            if (um.meta.xmlDocAndSchema) {
                if(um.meta.xmlDocAndSchema.SchemaModel) {
                    rum['xmlDocId'] = um.meta.xmlDocAndSchema.SchemaModel.SchemaDbId
                } else if (um.meta.xmlDocAndSchema.XmlModel) {
                    rum['xmlDocId'] = um.meta.xmlDocAndSchema.XmlModel.SchemaDbId
                } else {
                    delete rum['xmlDocId'];
                }
                // = JSON.stringify(um.meta.xmlDocAndSchema.SchemaModel.SchemaDbId);
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

        // if (um.meta.preset) {
        //     rum['preset'] = JSON.stringify(um.meta.preset);
        // }


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

        return new Observable((observer) => {
            this.httpService.post(
                UploadService.remoteUploadEndpoint,
                JSON.stringify(rum))
                .pipe(map(res => res.body))
                .subscribe((result) => {
                    console.log('>>> aspera success obj', result);
                    if (result.StackTraceString) {
                        console.log('>>> aspera success obj but StackTraceString', result);
                        observer.error({um: um, response: {status: 400, error: result.Message}});
                    } else {
                        observer.next(result);
                        console.log('>>> aspera success notify ok', result);
                        this.providerContext.baseUploadMenuRef.notifyUpload.emit({
                            model: um,
                            models: this.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error')
                        });

                        if (um.groupId !== null) {
                            this.createWorkflow(um, observer);
                        }
                    }
                }, (err: HttpErrorResponse) => {
                    console.log('>>> aspera error obj', err);
                    this.providerContext.baseUploadMenuRef.notifyUpload.emit({
                        model: um,
                        models: this.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error')
                    });
                    observer.error({um: um, response: {status: err.status, error: err.error.Error}});
                }, () => {
                    observer.complete();
                });

        });
    }

    private fileToJSON(file: File): UploadMetaFileType {
        return {
            'lastModified': file.lastModified,
            'name': file.name,
            'size': file.size,
            'type': file.type
        };
    }

    private _loadLib(name: string, url: string): boolean {
        if (!this.asperaWeb) {
            const node = document.createElement('script');
            node.src = url;
            node.type = 'text/javascript';
            node.async = true;
            node.onload = () => {
                this.isLoaded[name] = true;
                if (this.isLoaded['asperaweb'] && this.isLoaded['connectinstaller']) {
                    this.initAsperaConnect();
                }
            };
            document.getElementsByTagName('head')[0].appendChild(node);
            return true;
        } else {
            this.initAsperaConnect();
            return false;
        }
    }

    private initAsperaConnect() {
        this.asperaWeb = new AW4.Connect({
            sdkLocation: this.CONNECT_INSTALLER,
            minVersion: this.CONNECT_MIN_VERSION,
            dragDropEnabled: true
        });
        const asperaInstaller = new AW4.ConnectInstaller({sdkLocation: this.CONNECT_INSTALLER});

        const statusEventListener = function (eventType, data) {
            if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.INITIALIZING) {
                asperaInstaller.showLaunching();
            } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.FAILED) {
                asperaInstaller.showDownload();
            } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.OUTDATED) {
                asperaInstaller.showUpdate();
            } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.RUNNING) {
                asperaInstaller.connected();
            }
        };
        // this.asperaWeb.addEventListener(AW4.Connect.EVENT.STATUS, statusEventListener);
        // this.asperaWeb.addEventListener(AW4.Connect.EVENT.TRANSFER, (event, transfersJsonObj) => {
        //     this.handleTransferEvents(event, transfersJsonObj);
        // });

        this.rebindEvents();

        this.asperaWeb.initSession();

        this.getTransferEvents();
        this.onAsperaReady.emit();
        this.onAsperaReady.complete();
    }

    private rebindEvents() {
        this.asperaWeb.removeEventListener(AW4.Connect.EVENT.STATUS, () => {
            console.log('removed eventListener');
        });
        this.asperaWeb.addEventListener(AW4.Connect.EVENT.STATUS, (event, transfersJsonObj) => {
            // console.log(event, transfersJsonObj);
            this.handleTransferEvents(event, transfersJsonObj);
        });

        this.asperaWeb.removeEventListener(AW4.Connect.EVENT.TRANSFER, () => {
            console.log('removed eventListener');
        });
        this.asperaWeb.addEventListener(AW4.Connect.EVENT.TRANSFER, (event, transfersJsonObj) => {
            // console.log(event, transfersJsonObj);
            this.handleTransferEvents(event, transfersJsonObj);
        });

        this.asperaWeb.setDragDropTargets("#filedrop-for-aspera", {drop: true}, (data) => {
            this.multiDropHandler(data);
        });
        this.asperaWeb.setDragDropTargets("slick-grid.version-grid .slick-row", {drop: true}, (data) => {
            this.multiDropHandler(data, 'version');
        });

        // this.asperaWeb.setDragDropTargets('base-upload-menu no-uploads-in-progress')
    }

    private multiDropHandler(evt, type = null) {
        if (evt.files.dataTransfer) {
            if (!this.providerContext.uploadModalIsOpen) {
                if (this.providerContext.baseUploadMenuRef) {
                    this.providerContext.baseUploadMenuRef.open();
                    this.providerContext.uploadModalIsOpen = true;
                    this.providerContext.onReady.subscribe(() => {
                        this.providerContext.select(evt.files.dataTransfer.files, 'aspera');
                        if (type === 'version') {
                            this.providerContext.forcedUploadMode = 'version';
                            if (this.externalContext && this.externalContext.slickGridComp) {
                                const sgp: SlickGridProvider = this.externalContext.slickGridComp.provider;
                                // let
                                const uc: UploadComponent = this.providerContext.moduleContext;
                                const el = sgp.getRowElFromEvent(evt.event);
                                let row: SlickGridRowData = this.externalContext.slickGridComp.provider.getDataView().getItemById($(el).index());
                                if (!row) {
                                    row = this.externalContext.slickGridComp.provider.getSelectedRow();
                                }
                                if (row) {
                                    uc.setVersion({id: row.ID, text: row.FULLTITLE}, row);
                                    uc.changeAssociateMode(this.providerContext.forcedUploadMode);
                                    uc.disableMedia();
                                    sgp.setSelectedRow(row.$id);
                                } else {
                                    console.error('>>> cant get row')
                                }
                            }
                        }
                    });
                    return true;
                }
            } else {
                this.providerContext.select(evt.files.dataTransfer.files, 'aspera');
            }
        }
    }

}
