import {UploadAssociateMode, UploadMethod} from "../upload";
import {IMFXXHRType, UploadMetaFileType, UploadModelStates, UploadWorkerData, UploadWorkerModelParams} from "../types";
import {UploadServiceErrorResponse, UploadServiceSuccessResponse} from "../services/interface.upload.service";
import {IMFXFBNode} from "../../controls/file-browser/remote-file-browser";
import {Select2ItemType} from "../../controls/select2/types";
import {Guid} from "../../../utils/imfx.guid";
import {PresetType} from "../../order-presets-grouped/types";
import {Subject} from "rxjs";


export class UploadModel {
    public state: UploadModelStates = 'not_ready';
    public percentValue: number; // for native
    public chunkingCalculatingPercent: number; // for native chunking
    public chunkingUploadPercent: number; // for native chunking
    public _lastChunkingUploadPercent: number // for native chunking, percent for last uploaded chunk
    public file: File;
    public file_meta: UploadMetaFileType;
    public xhr: IMFXXHRType;
    public xhrs: IMFXXHRType[];
    public method: UploadMethod = 'native.chunk';
    public medias: any;
    public meta: UploadMetaDataModel = new UploadMetaDataModel();
    public response: UploadServiceErrorResponse | UploadServiceSuccessResponse;
    public associateUploadMode: UploadAssociateMode;
    public groupId: string | null = null;
    public groupWfAsked: boolean = false;
    public isValidation = false;
    // aspera
    public transfer_uuid: string;
    public user_id: string;
    public cookie: string;
    public isUploaded: boolean = false
    node: IMFXFBNode;

    constructor(opts: {
        file?: File,
        method?: UploadMethod,
        id?: number,
        file_meta?: UploadMetaFileType,
        user_id?: string,
        percentValue?: number,
        chunkingUploadPercent?: number,
        chunkingCalculatingPercent?: number,
    } = {}) {
        this.file = opts.file;
        this.file_meta = opts.file_meta;
        this.method = opts.method;
        this._id = opts.id;
        this.user_id = opts.user_id;
        this.percentValue = opts.percentValue;
        this.chunkingUploadPercent = opts.chunkingUploadPercent;
        this.chunkingCalculatingPercent = opts.chunkingCalculatingPercent;
    }

    private _id: number;

    get id(): number {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name(): string {
        const name = this.file ? this.file.name : this.file_meta.name;
        if (!name) {
            return '';
        }
        return $.trim(name);
    }

    get size(): number {
        return this.file ? this.file.size : this.file_meta.size;
    }

    private _path: string;

    get path(): string {
        return this._path;
    }

    set path(value: string) {
        this._path = value;
    }

    private _deviceId: string;

    get deviceId(): string {
        return this._deviceId;
    }

    set deviceId(value: string) {
        this._deviceId = value;
    }

    private _subFolder: string;

    get subFolder(): string {
        return this._subFolder;
    }

    set subFolder(value: string) {
        this._subFolder = value;
    }

    getNameFromPath() {
        const name = this.file ? this.file.name : this.file_meta.name;
        if (!name) {
            return '';
        }
        const ss: string[] = name.split('\\');
        if (ss.length > 1) {
            return ss.pop();
        } else {
            return '';
        }
    }

    getFileExtension(): string {
        const ss: string[] = this.name.split('.');
        if (ss.length > 1) {
            return this.name.split('.').pop();
        } else {
            return '';
        }
    }

    getFilenameWithoutExtension(): string {
        if (!this.name) {
            return '';
        }
        const ss = this.name.split('.');
        if (ss.length > 1) {
            return ss.slice(0, -1).join('.');
        } else {
            return this.name;
        }
    }

    getFormattedSize(): string {
        if (this.size === undefined) {
            return '';
        }
        return (this.size / 1024 / 1024).toFixed(2) + ' MB';
    }

    getEncodedFilename(): string {
        return encodeURIComponent(this.name);
    }

    getFormattedPercentValue(): number {
        let res: number = 0;
        if(this.method === 'native') {
            res = this.percentValue ? Math.ceil((this.percentValue) * 100) : 0;
        } else {
            res = this.chunkingUploadPercent ? parseInt(this.chunkingUploadPercent.toFixed(0)) : 0;
        }
        return res;
    }

    getPercentagePercentValue(): number {
        return this.percentValue ? this.percentValue * 100 : 0;
    }

    fillModel(json: { [key: string]: any }): UploadModel {
        Object.keys(json).map((k: string) => {
            if (k === 'meta') {
                this[k] = (new UploadMetaDataModel()).fillModel(json[k]);
            } else {
                this[k] = json[k];
            }
        });

        return this;
    }

    changeStateByResponse(_resp: UploadServiceErrorResponse | UploadServiceSuccessResponse = null) {
        const resp = _resp ? this.response = _resp : this.response;
        this.response = resp;
        if (!resp) {
            this.state = 'error';
            throw Error('Failed to create media after upload.');
        }
        if ((resp as UploadServiceErrorResponse).error) {
            this.state = 'error';
        } else if ((resp as UploadServiceSuccessResponse).MediaId) {
            const ss_resp = (resp as UploadServiceSuccessResponse);
            if (ss_resp.WorkflowResult) {
                if (!ss_resp.WorkflowResult.ErrorCode || ss_resp.WorkflowResult.ErrorCode == '0') {
                    this.state = 'success';
                } else {
                    this.state = 'warning';
                }
            } else {
                this.state = 'success';
            }
        } else {
            if (this.state !== 'aborted') {
                this.state = 'error';
            }
        }

    }

    getStatusMessage(): string {
        let msg = '';
        if (this.state === 'error' && this.response) {
            msg = (this.response as UploadServiceErrorResponse).error;
        } else if (this.state === 'warning') {
            const resp: UploadServiceSuccessResponse = (this.response as UploadServiceSuccessResponse);
            if (resp.WorkflowResult.Error) {
                msg = resp.WorkflowResult.Error + '(' + resp.WorkflowResult.ErrorCode + ')';
            } else if (resp.WorkflowResult.ErrorDesc || resp.WorkflowResult.ErrorDesc == '') {
                if (resp.WorkflowResult.ErrorDesc) {
                    msg = resp.WorkflowResult.ErrorDesc;
                } else {
                    msg = '[' + resp.WorkflowResult.JobStatus + '/' + resp.WorkflowResult.JobStatusType + ']';
                }
            }

        } else if (this.state === 'aborted') {
            msg = 'Aborted';
        } else if (this.state === 'success') {
            msg = 'Success';
        } else if (this.state === 'calculating') {
            msg = 'Calculating'
        } else if (this.state === 'restored') {
            msg = 'Restored';
        } else if (this.state === 'paused') {
            msg = 'Paused';
        } else if (this.state === 'progress') {
            msg = 'In Progress:' + this.getFormattedPercentValue() + '%';
        } else if (this.state === 'completing') {
            msg = 'Completing...';
        }

        return msg;
    }

    getFileType(): string {
        return this.file_meta.type;
    }

    // todo separate for every class of UploadInterface
    isValid(mode: UploadAssociateMode, step: number = 0): { [key: string]: UploadModel } {
        const errs: { [key: string]: UploadModel } = {};
        // if(!this.file){
        //     errs['file_empty'] = this;
        // }
        let valid = true;
        if (mode === 'title') {
            if (!this.meta.Title) {
                errs['title_empty'] = this;
                valid = false;
            }
            if (!this.meta.Owner || !this.meta.Owner.id) {
                errs['owner_empty'] = this;
                valid = false;
            }
        } else if (mode === 'version') {
            if (!this.meta.version || !this.meta.version.id) {
                errs['version_empty'] = this;
                valid = false;
            }
        }
        this.isValidation = valid;

        // if(step === 1){
        //     if(!this.meta.Usage || !this.meta.Usage.id){
        //         errs['usage_empty'] = this;
        //     }
        //     if(!this.meta.WorkflowPresetId){
        //         errs['wf_empty'] = this;
        //     }
        //     if(!this.meta.MiType || this.meta.MiType.id) {
        //         errs['mi_empty'] = this;
        //     }
        //     if(!this.meta.MediaFormat || !this.meta.MediaFormat.id) {
        //         errs['mf_empty'] = this;
        //     }
        // }

        return errs;
    }

    // todo move to remote.upload model
    getPath(): string {
        return this.node ? this.node.getPath() : this._path;
    }

    private _uniqValue = Guid.newGuid();
    getUniqValue(postfix?: string|number) {
        // userID, modelId, uniqId
        let str =  this.user_id + '|' + this.id + '|' + this._uniqValue;
        if(postfix) {
            str = str + '|' + postfix;
        }

        return str;
    }

    resetPercents() {
        this.percentValue = 0;
        this.chunkingCalculatingPercent = 0;
        this.chunkingUploadPercent = 0;
        this._lastChunkingUploadPercent = 0;
    }

}

export class UploadMetaDataModel {
    get XmlDocument(): any {
        return this._XmlDocument;
    }

    set XmlDocument(value: any) {
        this._XmlDocument = value;
    }
    public MediaFormat: Select2ItemType;
    public Owner: Select2ItemType;
    public Filename: string;
    public isLocal: boolean;
    public WorkflowPresetId: Select2ItemType;
    public MiType: Select2ItemType;
    public Usage: Select2ItemType;
    public TvStandard: Select2ItemType;
    public AspectRatio: Select2ItemType;
    public Notes: string;
    public WorkflowNotes: string;
    public Title: string;
    public medias: string[];
    public path: string;
    public version: Select2ItemType;
    public AFD: Select2ItemType;
    public preset: PresetType;
    public xmlDocAndSchema: any;
    public chunkingData: UploadWorkerModelParams = {
        chunks_in_progress: {},

    } as UploadWorkerModelParams; // for chunking
    public chunking_final_roots: {[key:number]: string} = {};
    private _XmlDocument: any = null;
    //  remote upload
    // todo to separate model
    DeviceId: string;
    SubFolder: string;

    endpoint: string;


    // public mediaFileType: MediaFileType;

    fillModel(json): UploadMetaDataModel {
        Object.keys(json).map((k: string) => {
            this[k] = json[k];
        });

        return this;
    }
}
