/**
 * Created by Sergey Trizna on 28.06.2017.
 */
import {EventEmitter, Injectable, Injector} from '@angular/core';
import {HttpService} from '../../../services/http/http.service';
import {Observable, Subject, Subscriber, Subscription} from 'rxjs';
import {UploadProvider} from '../providers/upload.provider';
import {map, takeLast} from 'rxjs/operators';
import {UploadModel} from "../models/models";
import {BasketService} from "../../../services/basket/basket.service";
import {UploadRemoveFileType, UploadResponseWorkflowModel} from "../types";
import {
    InterfaceUploadService,
    UploadServiceErrorResponse,
    UploadServiceSuccessResponse
} from "./interface.upload.service";
import {LocalStorageService} from "ngx-webstorage";
import {ProfileService, ProfileUserData} from "../../../services/profile/profile.service";


/**
 * Upload service
 */
@Injectable(/*{providedIn: 'root'}*/)
export class UploadService implements InterfaceUploadService {
    static fsUploadEndpoint: string = '/api/upload/file';
    static remoteUploadEndpoint: string = '/api/v3/loginfile';
    static fsChunkUploadEndpoint: string = '/api/v3/upload/multi-part';
    public onRetry: EventEmitter<any> = new EventEmitter<any>();
    public onPause: EventEmitter<any> = new EventEmitter<any>();
    public onRemove: EventEmitter<any> = new EventEmitter<any>();
    public onLoad: EventEmitter<{}> = new EventEmitter<{}>();
    public onDestroy: EventEmitter<{}> = new EventEmitter<{}>();
    public onLogout: EventEmitter<{}> = new EventEmitter<{}>();
    public onStartUpload: EventEmitter<void> = new EventEmitter<void>();
    public providerContext: UploadProvider;
    public cancelLoadListSubject: Subject<void> = new Subject<void>();
    public queueUploadStorageKey: string;
    public groupMapStoragePrefix = null;
    private groupMapForWf: { [key: string]: number[] } = {};
    private flagRepeatProt: boolean = false;

    constructor(public httpService: HttpService, public injector: Injector, public localStorage: LocalStorageService, public profileService: ProfileService) {
        // this.profileService.onGetUserData.subscribe((data: ProfileUserData) => {
        //     this.queueUploadStorageKey = this.queueUploadStorageKey + '|' + data.UserID;
        //     this.groupMapStoragePrefix = this.groupMapStoragePrefix + '|' + data.UserID;
        // })
    }

    getListOfFilesByDeviceId(deviceId: number, dir: string = null): Observable<any> {
        let _dir = dir ? dir + '' : '';
        _dir = _dir[0] === '/' ? _dir.substr(1) : _dir;
        return this.httpService
            .post(
                '/api/v3/filebrowser/' + deviceId,
                JSON.stringify({'Path': _dir})
            ).pipe(map((res: any) => res.body))
            .pipe(takeLast(1));
    }

    checkNames(names: string[] = []): Observable<any> {
        return new Observable((observer: any) => {
            this.httpService
                .post('/api/v3/checkFilesExist', JSON.stringify(names)).pipe(
                map((res: any) => res.body))
                .subscribe((mediaItems) => {
                    observer.next(mediaItems);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                })
        })
    }

    createWorkflow(um: UploadModel, observer: Subscriber<any>, stayedForUpload: UploadModel[] | null = null) {
        if(!um.meta.preset) {
            this.removeItemQueue({
                name: um.name,
                size: um.size
            }).subscribe(() => {
                console.log('Queue item deleted');
                observer.next();
                observer.complete();
            });
            console.log('Create workflow skipped');
            return;
        }
        const key:string = this.groupMapStoragePrefix + '|' + this.profileService.userData.UserID;
        this.groupMapForWf = this.localStorage.retrieve(key)||{};
        if (!this.groupMapForWf[um.groupId]) {
            this.groupMapForWf[um.groupId] = [];
        }
        if (!um.response || !um.response['MediaId']) {
            console.warn('>>> upload model did not finish the upload successfully');
            return;
        }
        this.groupMapForWf[um.groupId].push(um.response['MediaId']);
        stayedForUpload = stayedForUpload && stayedForUpload.length ?
            stayedForUpload :
            this.providerContext.getUploadModelsByStates('success', 'restored', 'waiting', 'calculating', 'progress').filter(
                (_um: UploadModel) => {
                    return um.groupId === _um.groupId &&
                        _um.groupWfAsked === false &&
                        !_um.response
                }) || [];

        if (stayedForUpload.length === 0 && !this.flagRepeatProt) {
            this.flagRepeatProt = true;
            this._createWorkflow(um).subscribe((resp: [UploadResponseWorkflowModel]) => {
                const data: UploadResponseWorkflowModel = resp[0];
                this.providerContext.getUploadModelsByStates('success', 'restored').forEach((_um: UploadModel) => {
                    if (um.groupId === _um.groupId &&
                        _um.response &&
                        _um.groupWfAsked === false) {
                        _um.groupWfAsked = true;
                        (_um.response as UploadServiceSuccessResponse).WorkflowResult = data;
                        if (!data.JobId) {
                            _um.state = 'warning';
                        }
                        delete this.groupMapForWf[um.groupId];
                        this.localStorage.store(key, this.groupMapForWf);
                        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                    }
                });
                this.flagRepeatProt = false;
                this.removeItemQueue({
                    name: um.name,
                    size: um.size
                }).subscribe(() => {
                    console.log('Queue item deleted');
                    observer.next(resp);
                    observer.complete();
                });
            }, (err: any) => {
                this.providerContext.getUploadModelsByStates('success', 'restored').forEach((_um: UploadModel) => {
                    if (um.groupId === _um.groupId &&
                        _um.response &&
                        _um.groupWfAsked === false) {
                        _um.groupWfAsked = true;
                        (_um.response as UploadServiceErrorResponse).error = err;
                        _um.state = 'warning';
                    }
                });
            });
        } else {
            this.localStorage.store(key, this.groupMapForWf);
        }
    }

    public _createWorkflow(um: UploadModel): Observable<UploadResponseWorkflowModel[]> {
        const basketService: BasketService = this.injector.get(BasketService);
        const items = um.groupId?this.groupMapForWf[um.groupId].map((id: number) => {
                return {ID: id, basket_item_type: 'Media'}
            }):[{ID: (um.response as UploadServiceSuccessResponse).MediaId, basket_item_type: 'Media'}];
        return basketService.placeOrderFast({
            preset: um.meta.preset,
            note: um.meta.WorkflowNotes || '',
            items: items,
            schemaId: um.meta.preset?um.meta.preset.SchemaId:null,
            xmlDocAndSchema: um.meta.xmlDocAndSchema,
            CompleteByDate: null,
            WorkflowPerItem: false
        })
    }

    removeItemQueue(data: UploadRemoveFileType): Observable<void> {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
        });
    }

    // calls from base.upload.comp
    public retrieveModelsOnLoad(): Observable<{ restored: UploadModel[] }> {
        return new Observable((observer) => {
            this.retrieveQueue().subscribe((ums_json: { [key: string]: any }[] /*UploadModel[] structure as JSON*/) => {
                const key:string = this.queueUploadStorageKey + '|' + this.profileService.userData.UserID;
                const ums: UploadModel[] = ums_json.filter((um_json) => {
                    // backward compatibility
                    return !um_json.formData;
                }).map((um_json) => {
                    return (new UploadModel()).fillModel(um_json);
                }).filter((um: UploadModel) => {
                    return um.user_id === this.profileService.userData.UserID
                });

                setTimeout(() => {
                    this.providerContext._uploadModels = ums;
                    this.groupMapForWf = this.localStorage.retrieve(key) || {};
                    this.providerContext.fillUpLastUploadsModels();
                    if (this.providerContext.baseUploadMenuRef) {
                        this.providerContext.baseUploadMenuRef.cdr.markForCheck();
                    }
                    observer.next({restored: ums});
                    observer.complete();
                })
            });
        });
    }

    retrieveQueue(): Observable<UploadModel[]> {
        return new Observable((observer) => {
            const key:string = this.queueUploadStorageKey + '|' + this.profileService.userData.UserID;
            let data: UploadModel[] = this.localStorage.retrieve(key);
            if (data) {
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                observer.next(data.map((m: UploadModel) => {
                    if (m.state === 'progress' || m.state === 'waiting' || m.state === 'calculating' || m.state === 'paused') {
                        m.state = 'restored';
                    }

                    return m;
                }));
                observer.complete();
            } else {
                observer.next([]);
                observer.complete();
            }
        });
    }

    bindDefaultDataToModels(model: UploadModel, data: any) {
    }

    getModels(data: any): UploadModel[] {
        return [];
    }

    openDialog(opts?) {
    }

    storeQueue() {
    }

    upload(): void {
    }
}
