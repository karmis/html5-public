/**
 * Created by Sergey Trizna on 31.08.2017.
 */
import {Select2ItemType, Select2ListTypes} from '../controls/select2/types';
import {UploadModel} from "./models/models";
import {UploadAssociateMode, UploadCustomMetaDataAssociateMode} from "./upload";

export type AvailableMediaTypeByExtensionListTypes = {
    [key: string]: MediaFileListTypes
};

export type AvailableMediaTypeByExtensionAsSelect2ListTypes = {
    [key: string]: Select2ListTypes
};

export type MediaFileListTypes = Array<MediaFileType>;

export type MediaFileTypes = {
    [key: number]: MediaFileType
};

export type MediaFileType = {
    Id?: number,
    MediaType?: number,
    Name?: string,
    Extensions?: string,
    Code?: string,
    DisablePlayback?: boolean,
    IconId?: number,
    MediaViewer?: boolean,
    ShowHdSdIcon?: boolean,
    SystemType?: number
};
export type UploadModelStates =
    'not_ready' |
    'waiting'
    | 'progress'
    | 'paused'
    | 'success'
    | 'error'
    | 'aborted'
    | 'calculating'
    | 'warning'
    | 'restored'
    | 'completing'


export type UploadResponseModel = {
    'WorkflowResult'?: UploadResponseWorkflowModel,
    'MediaId': number,
    'Message'?: string
};

export type UploadResponseWorkflowModel = {
    'JobRef'?: any,
    'JobId'?: number,
    'JobStatus'?: any,
    'ExternalId'?: any,
    'ID'?: number,
    'RuleResult'?: any,
    'Result'?: boolean,
    'Error'?: any,
    'ErrorCode'?: any
    'ErrorDesc'?:string,
    'JobStatusType'?:'Ok'|string
};

export type UploadModelsList = { [key: number]: UploadModel, length: number };

export type UploadResponseError = { status: number, error: string };
export type UploadRemoveFileType = { name: string, size: number };
export type UploadDefaultViewSetup = {
    isTvStandard?: boolean;
    isAspectRatio?: boolean;
    uploadTypesSettings?
    // WorkflowPresetId?: number;
    // MiType?: number;
    // Usage?: {
    //     Name: string;
    //     ID: number;
    // },
}

export type UploadGroupSettings = {
    isTvStandard?: boolean;
    isAspectRatio?: boolean;
    isApplyAll?: boolean;
    mode?: UploadAssociateMode,
    uploadTypesSettings?: UploadDefaultMethodSettings
    schema?: {Id: number};
    customMetadataMode?: UploadCustomMetaDataAssociateMode;
    defaultData: {
        WorkflowPresetId?: Select2ItemType|null;
        MiType?: Select2ItemType|null;
        Usage?: Select2ItemType|null;
    };
    versionNameList?: string[]
}

export type UploadMethodSettings = {
    id: number,
    name: 'Native' | 'Aspera',
    deviceId: string;
};

export type UploadDefaultMethodSettings = {
    currentSettingsId: number,
    settings: UploadMethodSettings[]
}

export type UploadMetaDataTypes =
    'Usage'
    | 'MiType'
    | 'AspectRatio'
    | 'WorkflowPresetId'
    | 'TvStandard'
    | 'VersionId'
    | 'Notes'
    | 'WorkflowNotes'
    | 'Title'
    | 'MediaFormat'
    | 'Owner'
    | 'Filename'
    | 'Devices' // todo different type for remote.upload
    | 'AFD'
    ;
export type UploadMetaFileType = {
    lastModified: number,
    lastModifiedDate?: Date,
    name: string,
    size: number,
    type: string
}
export type NativeUploadXHRStatusText = string|'status_aborted'
export type IMFXXHRType = XMLHttpRequest & {imfx_status_text?: NativeUploadXHRStatusText;}


export type UploadWorkerData = {
    percent: number;
    for?: 'chunk' | 'file',
    // hash?: string,
    // chunk?: ArrayBuffer,
    chunk_id?: number,
    chunk_total?: number,
    // hashes_all?: [],
    root?: string,
    upload_offset_from?: number,
    upload_offset_to?: number,
    chunk_size?: number,
    uploadId?: string,
    hash_1mb: number,
    chunk_size_for_hash: number,
    size: number,
    do_upload: boolean,
    chunks_in_progress: { [key: string]: UploadChunkProgressType },
    reader: FileReader
    tmp?: string
}

export type UploadChunkProgressType = { loaded: number, total: number, finished: boolean };

export type UploadWorkerModelParams = UploadWorkerData /*& {file: File}*/;
export type UploadSplicedChunkItem = {chunk: ArrayBuffer, chunk_id: number};
export type UploadSplicedChunksStorage = { [key: string]: UploadSplicedChunkItem[] };
