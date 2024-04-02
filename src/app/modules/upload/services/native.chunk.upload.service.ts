import { NativeUploadService } from "./native.upload.service";
import { EventEmitter, Injectable, Injector } from "@angular/core";
import { HttpService } from "../../../services/http/http.service";
import { LocalStorageService } from "ngx-webstorage";
import { ProfileService } from "../../../services/profile/profile.service";
import { NotificationService } from "../../notification/services/notification.service";
import { ErrorManagerProvider } from "../../error/providers/error.manager.provider";
import { UploadModel } from "../models/models";
import { forkJoin, Observable, Subject, Subscriber } from "rxjs";
import { UploadServiceErrorResponse, UploadServiceSuccessResponse } from "./interface.upload.service";
import {
    UploadResponseModel,
    UploadSplicedChunkItem,
    UploadSplicedChunksStorage,
    UploadWorkerData,
    UploadWorkerModelParams
} from "../types";
import { mergeMap, scan, takeUntil } from "rxjs/operators";
import sha256WorkerUrl from 'worker-plugin/loader!./../../../workers/sha256/sha256.worker.js';
import {HttpHeaders, HttpResponse, HttpXhrBackend} from "@angular/common/http";
import { ConfigService } from "../../../services/config/config.service";
import { UploadService } from "./upload.service";
import { WorkerProvider } from "../../../providers/worker/worker.provider";

const {MerkleTree} = require('merkletreejs');
const SHA256 = require("crypto-js/sha256");

@Injectable()
export class NativeChunkUploadService extends NativeUploadService {
    public queueUploadStorageKey: string = 'upload_native_chunking_queue';
    public groupMapStoragePrefix: string = 'upload_native_chunking_group_map_storage';
    public onRetry: EventEmitter<any> = new EventEmitter<any>();
    public onPause: EventEmitter<any> = new EventEmitter<any>();
    public onRemove: EventEmitter<any> = new EventEmitter<any>();
    public onLoad: EventEmitter<{}> = new EventEmitter<{}>();
    public onDestroy: EventEmitter<{}> = new EventEmitter<{}>();
    public onLogout: EventEmitter<{}> = new EventEmitter<{}>();
    public onStartUpload: EventEmitter<void> = new EventEmitter<void>();
    public uploadQueues: Subject<UploadWorkerData>[] = []; // for chunking
    private readonly chunkUploadSize: number = 10 * 1024 * 1024; // 1mb // dont change! // 1000000
    private readonly chunkHashSize: number = 1 * 1024 * 1024; // 1mb // dont change!
    private readonly maxParallelQueries = 5; // https://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser
    private queue: Subject<UploadWorkerData[]> = new Subject();
    private destroyed$: Subject<void> = new Subject();
    private sha256Workers: { [key: string]: Worker } = {};
    private hashCounter: UploadWorkerData[] = [];
    private chunkingUploadPercentTmp: { [key: string]: number } = {};
    private lastSuccessUMs: { [key: string]: UploadModel } = {};
    private splicedChunks: UploadSplicedChunksStorage = {};
    private splicedChunksOverflowed: boolean = false;
    private maxCountChunksForTread = 2;

    // private _percentAcc: { [key: string]: { [key: string]: { event: ProgressEvent, finished: boolean } } } = {};

    constructor(public httpService: HttpService,
                public injector: Injector,
                public localStorage: LocalStorageService,
                public profileService: ProfileService,
                private workerProvider: WorkerProvider,
                public notificationRef?: NotificationService,
                public emp?: ErrorManagerProvider,
                private backend?: HttpXhrBackend) {
        super(httpService, injector, localStorage, profileService);
        // on pause
        this.onPause
            .subscribe((data: { um: UploadModel }) => {
                // data.um.state = 'paused';
                // check in out the uploadPause method and `data.for === 'paused'` case in _execUpload method;
                const um: UploadModel = data.um;
                um.meta.chunkingData.chunk_id = um.meta.chunkingData.chunk_id || 0;
                // um.meta.chunkingData.offset = um.meta.chunkingData.offset>=this.chunkUploadSize?um.meta.chunkingData.offset -=this.chunkUploadSize:um.meta.chunkingData.offset;
                if (this.uploadQueues[um.getUniqValue()]) {
                    this.uploadQueues[um.getUniqValue()].complete();
                }
                this.uploadQueues[um.getUniqValue()] = new Subject();
                um.state = 'paused'; // important thing!
                // um.meta.chunkingData.hashes_chunk = [];
                // this.providerContext.getUploadModelByUniqId(um.getUniqValue())
                this.killWorker(um);
                if (um.xhr && um.xhr.abort) {
                    // um.xhr.imfx_status_text = 'status_aborted';
                    um.xhr.abort();
                }
                this.processUpload();
                // this.storeQueue().subscribe(() => {
                // });

            });

        // on retry
        this.onRetry
            .subscribe((data: { um: UploadModel }) => {
                const um = data.um;
                this.uploadQueues[um.getUniqValue()] = new Subject();
                // data.um.resetPercents();
                um.chunkingUploadPercent = 0;
                if ((!um.file || typeof um.file === 'string') && this.providerContext.isNativeUpload(um.method)) {
                    this._requestFileFromOS(um);
                } else {
                    this.processUpload(data.um, true);
                }
            });

        // on remove
        this.onRemove
            .subscribe((data: { um: UploadModel }) => {
                const um: UploadModel = data.um;
                if (um.state === 'progress' || um.state === 'calculating') {
                    this.uploadCancel(data.um).subscribe(() => {
                        this.removeModel(data.um);
                    })
                } else {
                    this.removeModel(data.um);
                }
            });

        // on load app
        this.profileService.onGetUserData
            .subscribe(() => {
                this.retrieveModelsOnLoad().subscribe(() => {
                    // debugger;
                });
            });

        this.onDestroy
            .subscribe(() => {
                this.providerContext.getUploadModelsByStates(
                    'waiting', 'paused', 'progress', 'calculating', 'restored', 'aborted',
                ).forEach((um: UploadModel) => {
                    um.state = 'paused';
                    // um.meta.chunkingData.root = [];
                    if (um.xhr && um.xhr.abort) {
                        //um.xhr.imfx_status_text = 'status_aborted';
                        um.xhr.abort();
                    }
                })

                // this.storeQueue().subscribe(() => {
                // });
            })
    }

    public processUpload(um: UploadModel = null, retry: boolean = false) {
        let ums: UploadModel[] = [];
        const self: NativeChunkUploadService = this;
        const countUMsInProgress: number = this.providerContext.getUploadModelsByStates('progress').length;
        const count = this.workerProvider.getMaxWorkers() - countUMsInProgress;
        if (count > 0) {
            ums = this.providerContext.getCountUploadModelsByStates(count, 'waiting');
        }
        if (um && (um.state === 'error' || um.state === 'aborted' || um.state === 'paused')) {
            if (ums.length >= count) {
                ums[0] = um;
            } else {
                ums.unshift(um);
            }
        }
        if (ums.length > 0) {
            ums.forEach((um: UploadModel) => {
                if (um) {
                    um.state = 'progress';
                    //const file = um.file;
                    // if ((!file || typeof file === 'string') && this.providerContext.isNativeUpload(um.method)) {
                    //     this._requestFileFromOS(um);
                    //     return;
                    // } else {
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
                    // }
                } else {
                    self.lastTriedForUploadModel = um;
                    self.processUpload(null, false);
                }
            })
        } else {
            const withProgress = this.providerContext.getUploadModelsByStates('calculating', 'progress');
            if (retry === true && this.lastTriedForUploadModel && withProgress.length === 0) {
                if (this.lastTriedForUploadModel.state === 'success') {
                    this.notificationRef.notifyShow(1, 'upload.completed');
                } else {
                    this.notificationRef.notifyShow(2, 'upload.aborted');
                }
            } else {
                if (withProgress.length === 0) {
                    const withError = this.providerContext.getLastUploadModelsByStates('error');
                    const withAbort = this.providerContext.getLastUploadModelsByStates('aborted');
                    const withPause = this.providerContext.getLastUploadModelsByStates('paused');
                    if (withError.length !== 0 || withAbort.length !== 0) {
                        if (withError.length === this.providerContext.uploadModels.length) {
                            this.notificationRef.notifyShow(2, 'upload.error');
                        } else if (withAbort.length !== 0) {
                            this.notificationRef.notifyShow(2, 'upload.aborted');
                        } else if(withPause.length === 0) {
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

    removeModel(um: UploadModel) {
        this.removeItemQueue({
            name: um.name,
            size: um.size
        }).subscribe(() => {
            console.log('Queue item deleted');
        });
        // reset xhr
        um.state = 'aborted';
        if (um.xhr && um.xhr.abort) {
            um.xhr.abort();
        }

        this.providerContext.removeModel(um);
    }

    upload(): void {
        super.upload();
    }

    protected _execUpload(data, um: UploadModel): Observable<UploadServiceSuccessResponse | UploadServiceErrorResponse> {
        return new Observable((observer: Subscriber<UploadServiceSuccessResponse | UploadServiceErrorResponse>) => {
            // debugger
            // this.updateStatus(um, 'Uploading');
            // debugger
            this.chunkingUploadPercentTmp[um.getUniqValue()] = um.chunkingUploadPercent;
            this.uploadInit(um).subscribe((uploadId: string) => {
                if (!um.meta.chunkingData) {
                    um.meta.chunkingData = {uploadId: null} as UploadWorkerModelParams;
                }
                um.meta.chunkingData.uploadId = uploadId;
                // this.onGetUploadId.emit(um);
                this.chuncking(um);
                // TODO save it to presets here ... subscribe({ ...
                this.uploadQueues[um.getUniqValue()]
                    // concatMap
                    .pipe(mergeMap((data: UploadWorkerData[]) => this.uploadChunk(data[0], um), this.maxParallelQueries))
                    // .pipe(toArray())
                    // .pipe(delay(500))
                    // .pipe(takeUntil(this.destroyed$))
                    //.pipe(takeWhile(() => um.state === 'progress' || um.state === 'calculating'))
                    .subscribe(() => {
                        // const uploadedUM: UploadModel = um;
                        if (um.meta.chunking_final_roots && Object.keys(um.meta.chunking_final_roots).length === (um.meta.chunkingData.chunk_total)) {
                            this.chunkingUploadPercentTmp[um.getUniqValue()] = 0;
                            // um.meta.chunkingData.uploadedData = [];
                            if (this.uploadQueues[um.getUniqValue()]) {
                                this.uploadQueues[um.getUniqValue()].complete();
                            }

                            this.uploadFinalize(uploadId, um).subscribe((finalizeResp: UploadServiceSuccessResponse | UploadServiceErrorResponse) => {
                                // on finish for all for this model
                                um.state = 'success';
                                um.isUploaded = true;
                                this.lastTriedForUploadModel = um;
                                this.providerContext.baseUploadMenuRef.notifyUpload.emit({
                                    queueFinished: false,
                                    model: um,
                                    models: [] // this.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error', 'completing', 'updating')
                                });
                                this.killWorker(um);
                                observer.next(finalizeResp);
                                observer.complete()
                                // this.processUpload();
                            }, (error) => {
                                console.error(error);
                                if (um.state !== 'aborted') {
                                    um.state = 'error';
                                }
                                um.isUploaded = false;
                                this.providerContext.baseUploadMenuRef.notifyUpload.emit({
                                    queueFinished: false,
                                    model: um,
                                    models: [] // self.providerContext.getUploadModelsByStates('success', 'warning', 'aborted', 'error', 'completing')
                                });
                                // self.providerContext.loadingModelId++;
                                this.lastTriedForUploadModel = um;
                                um.meta.chunkingData = {} as UploadWorkerModelParams;
                                this.killWorker(um);
                                observer.error(error);
                                observer.complete()
                            });
                        }
                    }, (error) => {
                        //this.processUpload();
                        this.parseResponseFail(um, error, observer);
                        console.log(error);
                    }, () => {
                        if (this.uploadQueues[um.getUniqValue()]) {
                            this.uploadQueues[um.getUniqValue()].complete();
                        }
                        this.uploadQueues[um.getUniqValue()] = new Subject();
                    });
            }, (err) => {
                this.parseResponseFail(um,
                    {status: err.status, error: err.error.Error} as UploadServiceErrorResponse,
                    observer);
            })
        });
    }

    private uploadFinalize(uploadId, um: UploadModel): Observable<UploadServiceSuccessResponse | UploadServiceErrorResponse> {
        return new Observable((observer: Subscriber<UploadServiceSuccessResponse | UploadServiceErrorResponse>) => {
            // um.state = 'updating';
            const roots: string[] = Object.keys(um.meta.chunking_final_roots).map((rootKey: string) => {
                return um.meta.chunking_final_roots[rootKey];
            });
            const tree = new MerkleTree(roots, SHA256); /*c6ca/um.roots*/
            um.meta.chunkingData.root = tree.getRoot().toString('hex');
            this.storeQueue().subscribe(() => {
                this.httpService.post(
                    '/api/v3/upload/multi-part/' + uploadId + '/' + um.meta.chunkingData.root,
                    {}, { headers: new HttpHeaders({ Timeout: `${300000}` }) })
                    .subscribe((resp: HttpResponse<UploadResponseModel>) => {
                        this.uploadQueues[um.getUniqValue()] = null;
                        delete this.uploadQueues[um.getUniqValue()];
                        this.killWorker(um);
                        um.resetPercents();
                        observer.next(resp.body);
                        observer.complete();
                        // this._execUploadSuccess(um, observer, resp.body);
                    }, (err) => {
                        this.uploadQueues[um.getUniqValue()] = null;
                        delete this.uploadQueues[um.getUniqValue()];
                        this.killWorker(um);
                        const error: UploadServiceErrorResponse = {
                            status: 0,
                            error: err.error ? err.error.Error : err
                        };
                        observer.error(error);
                        observer.complete();
                        // this.parseResponseFail(um, error, observer);
                        // this._execUploadError(um, observer, error)

                        um.resetPercents();
                        this.uploadQueues[um.getUniqValue()] = null;
                        delete this.uploadQueues[um.getUniqValue()];
                        um.meta.chunking_final_roots = {};
                        um.state = 'error';


                        // this.parseResponseFail(um,
                        //     {status: err.status, error: err.error} as UploadServiceErrorResponse,
                        //     observer);
                    });
            });
        });
    }

    // private getChunk(data: UploadWorkerData, um: UploadModel): UploadSplicedChunkItem {
    //     if (this.splicedChunks[um.getUniqValue()]) {
    //         return this.splicedChunks[um.getUniqValue()].find((item: UploadSplicedChunkItem) => {
    //             return item && item.chunk_id === data.chunk_id
    //         });
    //     }
    // }

    private setChunk(data: UploadWorkerData, um: UploadModel) {
        if (!this.splicedChunks) {
            this.splicedChunks = {};
        }
        if (!this.splicedChunks[um.getUniqValue()]) {
            this.splicedChunks[um.getUniqValue()] = [];
        }
        // if (!data.chunk) {
        //     return;
        // }
        // this.splicedChunks[um.getUniqValue()].push({chunk: data.chunk, chunk_id: data.chunk_id});
        // data.chunk = undefined;
        // delete data.chunk;
        this.uploadQueues[um.getUniqValue()].next([data]);
        console.log('>>>', data.chunk_id);
        // overflow protection
        // if (this.splicedChunks[um.getUniqValue()].length >= this.maxCountChunksForTread) {
        //    this.killWorker(um);
        // }
    }

    private removeChunk(data: UploadWorkerData, um: UploadModel) {
        if (this.splicedChunks[um.getUniqValue()]) {
            this.splicedChunks[um.getUniqValue()] = this.splicedChunks[um.getUniqValue()].filter((item: UploadSplicedChunkItem) => {
                return item && item.chunk_id !== data.chunk_id
            });
        }
    }

    private chuncking(um: UploadModel) {
        this.uploadQueues[um.getUniqValue()] = new Subject();
        this.uploadQueues[um.getUniqValue()].pipe(scan((acc: UploadWorkerData[], curr: UploadWorkerData[]) => {
            return acc.concat(curr);
        }));
        this.rebirthWorker(um);
    }

    private addListenerToWorker(um: UploadModel) {
        this.sha256Workers[um.getUniqValue()].onmessage = (event: MessageEvent) => {
            if (um.state === 'calculating' || um.state === 'progress') {
                const data: UploadWorkerData = event.data;
                if (data.for === 'chunk') {
                    if (data.do_upload === true) {
                        this.setChunk(data, um);
                    }
                    // update percentage of calculating progress
                    um.chunkingCalculatingPercent = data.percent;
                    // console.log('calculating progress', um.chunkingCalculatingPercent);
                    // console.log('upload progress', um.chunkingUploadPercent);
                    this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                } else {
                    this.setChunk(data, um);
                }

                if (Object.keys(um.meta.chunking_final_roots).length === data.chunk_total) {
                    this.killWorker(um);
                    um.state = 'progress';
                    console.log('finish for chunking', data);
                }
            }
        };
    }

    private uploadInit(um: UploadModel): Observable<string> {
        return new Observable((observer) => {
            this.prepareUpload(um).subscribe((data: any) => {
                delete data['fileToUpload']; // important!
                if (um.meta.chunkingData && um.meta.chunkingData.uploadId) {
                    observer.next(um.meta.chunkingData.uploadId); // id of upload
                    observer.complete();
                } else {
                    this.httpService.post('/api/v3/upload/multi-part', data).subscribe((resp: any) => {
                        observer.next(resp.body as string); // id of upload
                        observer.complete();
                    }, (error) => {
                        observer.error(error);
                        observer.complete();
                    });
                }
            });
        });
    }

    private killWorker(um) {
        if (this.sha256Workers[um.getUniqValue()]) {
            this.sha256Workers[um.getUniqValue()].terminate();
            this.sha256Workers[um.getUniqValue()] = undefined;
            delete this.sha256Workers[um.getUniqValue()];
        }
    }

    private rebirthWorker(um: UploadModel) {
        if (this.sha256Workers[um.getUniqValue()]) {
            return;
        }
        // um.state = '';
        this.sha256Workers[um.getUniqValue()] = new Worker(sha256WorkerUrl, {type: "module"});
        this.addListenerToWorker(um);
        if (!um.meta.chunkingData.chunks_in_progress) {
            um.meta.chunkingData.chunks_in_progress = {};
        }

        // find min uploaded chunk to start upload from it
        const inProgress = um.meta.chunkingData.chunks_in_progress;
        const chunkKeys: string[] = Object.keys(um.meta.chunkingData.chunks_in_progress);
        if (chunkKeys && chunkKeys.length > 0) {
            let res: number = 0;
            let minUploadedChunk: number[] = chunkKeys.map((chunk_id: string) => {
                return parseInt(chunk_id);
            }).filter((chunk_id: number) => {
                return !inProgress[chunk_id].finished;
            });
            if (minUploadedChunk && minUploadedChunk.length > 0) {
                res = minUploadedChunk.reduce((a: number, b: number) => Math.min(a, b));
            }
            this._rebirthWorkerProcess(um, res);
        } else {
            this._rebirthWorkerProcess(um);
        }
    }

    private _rebirthWorkerProcess(um: UploadModel, fromChunkId: number = undefined) {
        um.meta.chunkingData.chunk_size = this.chunkUploadSize;
        um.meta.chunkingData.chunk_total = Math.ceil(um.file.size / this.chunkUploadSize);
        um.meta.chunkingData.chunk_size_for_hash = this.chunkHashSize;
        um.meta.chunkingData.chunk_id = fromChunkId || 0;
        this.sha256Workers[um.getUniqValue()].postMessage({
            chunkingData: um.meta.chunkingData,
            file: um.file,
        });
    }

    private uploadChunk(data: UploadWorkerData, um: UploadModel): Observable<void> {
        return new Observable((observer) => {
                if (um.state === 'calculating' || um.state === 'progress') { // if in progress
                    // if (!um.meta.chunkingData.uploadedData) {
                    //     um.meta.chunkingData.uploadedData = {};
                    // }
                    if (data && data.for === 'file') { // have been calculated all hashes for file
                        // store
                        // um.meta.chunkingData = data;
                        // um.meta.chunkingData.uploadedData.push(data);
                        this.storeQueue().subscribe(() => {
                            observer.next();
                            observer.complete();
                        });
                    } else { // has been calculated one more hash for chunk of file
                        const reader = new FileReader();
                        reader.onloadend = (e) => {
                            if (reader.readyState === FileReader.DONE) {
                                let chunk = reader.result;

                                this.storeQueue().subscribe(() => {
                                    if (!um.meta.chunking_final_roots[data.chunk_id]) {
                                        this._uploadChunkProcess(um, data, chunk, observer);
                                    } else {
                                        this._updatePercentOfModel(um, data, 100);
                                        um.meta.chunkingData.chunk_id += 1;
                                        observer.next();
                                        observer.complete();
                                    }
                                });
                            } // read done
                        };
                        // read chunk
                        const blob = um.file.slice(data.upload_offset_from, data.upload_offset_to);
                        reader.readAsArrayBuffer(blob);
                    }
                }
            }
        );
    }

    private _uploadChunkProcess(um, data, chunk, observer) {
        const url = ConfigService.getAppApiUrl() + UploadService.fsChunkUploadEndpoint + "/" + um.meta.chunkingData.uploadId + "/part/" + data.chunk_id + "/" + data.root;
        if (!um.xhrs) {
            um.xhrs = [];
        }
        um.xhrs[data.chunk_id] = $.ajaxSettings.xhr();
        var req = $.ajax({
            url: url,
            type: 'POST',
            data: chunk,
            cache: false,
            contentType: 'json',
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
            },
            xhr: () => {
                // Upload progress
                // https://stackoverflow.com/a/47337711/1528019
                um.xhrs[data.chunk_id].upload.addEventListener('progress', (event: ProgressEvent) => {
                    if (event.lengthComputable) {
                        const inProgress = um.meta.chunkingData.chunks_in_progress;
                        if (um.state === 'calculating' || um.state === 'progress') {
                            inProgress[data.chunk_id] = {loaded: event.loaded, total: event.total};
                            this._updatePercentOfModel(um, data);
                        } else {
                            if (um.xhrs && um.xhrs[data.chunk_id]) {
                                um.xhrs[data.chunk_id].abort();
                                delete um.xhrs[data.chunk_id];
                            }
                        }
                    }
                }, false);
                return um.xhrs[data.chunk_id];
            }
        }).done(() => {
            delete um.xhrs[data.chunk_id];
            chunk = undefined;
            this.removeChunk(data, um);
            req = undefined;
            const cip: any[] = um.meta.chunkingData.chunks_in_progress;
            // store
            if (cip && cip[data.chunk_id]) {
                cip[data.chunk_id].finished = true;
                this.chunkingUploadPercentTmp[um.getUniqValue()] = um.chunkingUploadPercent;
                um._lastChunkingUploadPercent = um.chunkingUploadPercent;
                um.meta.chunking_final_roots[data.chunk_id] = data.root;
                um.meta.chunkingData = $.extend(true, um.meta.chunkingData, data);
                this.lastSuccessUMs[um.getUniqValue()] = um;
                this.storeQueue().subscribe(() => {
                    um.meta.chunkingData.chunk_id += 1;
                    observer.next();
                    observer.complete();
                });
            }
        }).fail((erXhr, status, error) => {
            this.removeChunk(data, um);
            // data = undefined;
            req = undefined;
            this.killWorker(um);
            if (um.state !== 'paused') {
                um.resetPercents();
                um.state = 'error';
                // um.meta.chunkingData.chunk_id -= 1;
                um.response = {status: 0, Message: error || 'Upload was aborted', error: error};
                this.storeQueue().subscribe(() => {
                    // data = undefined;
                    observer.next();
                    observer.complete();
                });
                // this.storeQueue().subscribe(() => {
                //
                // });


            } else {
                // this.storeQueue().subscribe(() => {
                //     observer.next();
                //     observer.complete();
                // });
                observer.complete();
            }
            // observer.error({xhr: erXhr, status: status, error: error});
        });
    }

    private _updatePercentOfModel(um: UploadModel, data: UploadWorkerData, percentUploadForChunk?: number) {
        let preSum = 0;
        if (percentUploadForChunk) {
            preSum = percentUploadForChunk / data.chunk_total;
            if((um.chunkingUploadPercent + preSum) > 100) {
                debugger
            } else {
                um.chunkingUploadPercent += preSum;
            }
        } else {
            Object.keys(um.meta.chunkingData.chunks_in_progress).forEach((key) => {
                if (um.meta.chunkingData.chunks_in_progress[key]) {
                    const d = um.meta.chunkingData.chunks_in_progress[key];
                    preSum += (((d.loaded / d.total) / data.chunk_total) * 100);
                }
            });
            if (um.chunkingUploadPercent < preSum && preSum <= 100) {
                um.chunkingUploadPercent = preSum
            }
            if (this.providerContext.baseUploadMenuRef) {
                this.providerContext.baseUploadMenuRef.cdr.markForCheck();
            }
        }
    }

    private uploadCancel(um: UploadModel): Observable<{ um: UploadModel }> {
        return new Observable((observer) => {
            this.killWorker(um);
            this.chunkingUploadPercentTmp[um.getUniqValue()] = 0;
            if (this.uploadQueues[um.getUniqValue()]) {
                this.uploadQueues[um.getUniqValue()].complete();
                this.uploadQueues[um.getUniqValue()] = undefined;
                delete this.uploadQueues[um.getUniqValue()];
                um.state = 'aborted';
                this.processUpload();
                forkJoin([this.storeQueue(), this.httpService.delete("/api/v3/upload/multi-part/" + um.meta.chunkingData.uploadId)]).subscribe(() => {
                    observer.next({um: um});
                    this.providerContext.baseUploadMenuRef.cdr.detectChanges();
                }, (err) => {
                    observer.next({um: um});
                    console.log(err);
                    this.providerContext.baseUploadMenuRef.cdr.detectChanges();
                });
            } else {
                observer.next({um: um});
            }
            //this.uploadQueues[um.getUniqValue()] = new Subject();
            // this.destroyed$.next();
            // this.destroyed$.complete();

        });
    }

    // createWorkflow(um: UploadModel, observer: Subscriber<any>) {
    //     this.providerContext.getUploadModelsByStates('success', 'restored', 'waiting', 'calculating', 'progress').filter(function(_um){
    //         return um.groupId === _um.groupId &&
    //             _um.groupWfAsked === false &&
    //             !_um.response
    //     });
    //     super.createWorkflow(um, observer);
    // }
}

