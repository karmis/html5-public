import {IMFXRemoteUploadModel} from "../../upload-remote/remote.upload";
import {Observable} from "rxjs";
import {UploadProvider} from "../providers/upload.provider";
import {HttpService} from "../../../services/http/http.service";
import {UploadRemoveFileType, UploadResponseModel} from "../types";
import {UploadModel} from "../models/models";
import {EventEmitter} from "@angular/core";

export type UploadServiceErrorResponse = {
    status: number,
    error: string
}
export type UploadServiceSuccessResponse = UploadResponseModel

export interface InterfaceUploadService {
    queueUploadStorageKey:string;
    groupMapStoragePrefix: string;
    onStartUpload?: EventEmitter<void>;
    onFinishUpload?: EventEmitter<void>;
    providerContext: UploadProvider;
    httpService?:HttpService;
    // config?: {[key:string]: any};
    upload(): void;
    getModels(data: any): UploadModel[];
    bindDefaultDataToModels(model: UploadModel, data:any)
    retrieveQueue();
    storeQueue();
    removeItemQueue(data: UploadRemoveFileType): Observable<void>;
    onPause: EventEmitter<{um: UploadModel}>;
    onRemove: EventEmitter<{um: UploadModel}>;
    onRetry: EventEmitter<{um: UploadModel}>;
    onDestroy: EventEmitter<{}>;
    onLogout: EventEmitter<{}>;
    onLoad: EventEmitter<{}>;


    openDialog(opts?)
}
