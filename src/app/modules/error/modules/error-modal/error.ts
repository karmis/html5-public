import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { IMFXModalComponent } from '../../../imfx-modal/imfx-modal';
import { ProfileService } from '../../../../services/profile/profile.service';
import * as FileSaver from "file-saver";
import { SessionStorageService, LocalStorageService } from "ngx-webstorage";
import { ErrorInterface } from '../../models/interface.error';
import { ClipboardProvider } from '../../../../providers/common/clipboard.provider';
import {NetworkError} from "../../models/network.error";

export interface ErrorReportModel {
    title: string,
    message: string,
    stack: string
    version: string,
    timestamp: string,
    ref: string,
    userId: string,
    apiUrl: string,
    appInfo: any,
    userAgent: string
}

@Component({
    selector: 'error-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ]
})
export class ErrorModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    protected _errorAsString: string;
    protected shownStack: boolean = true;
    protected modalRef: IMFXModalComponent;
    protected _errors: ErrorInterface[] = [];
    protected _title: string = '';
    protected isDebug: boolean = false;
    private _description: string = '';
    // private data;
    // private key = "isDebugMode";

    constructor(private injector: Injector,
                public cdr: ChangeDetectorRef,
                // private settingsGroupsService: SettingsGroupsService,
                private sessionStorage: SessionStorageService,
                private localStorage: LocalStorageService,
                public clipboardProvider: ClipboardProvider,
                // private debounceProvider: DebounceProvider,
                // private emp: ErrorManagerProvider,
                // private notificationRef: NotificationService,
                private profileService: ProfileService) {
        this.modalRef = injector.get('modalRef');
        // this.initErrorSettings();
    }

    detectChanges() {
        this.cdr.detectChanges();
    }


    download() {
        let date = new Date();
        let cDateStr = date.toString();
        let dateStr = date.getFullYear() + '-' +
            date.getMonth() + '-' + date.getDate() + '-' +
            cDateStr.substr(cDateStr.indexOf('GMT') + 4, 4);
        FileSaver.saveAs(new Blob([this._errorAsString], {type: 'json'}),
            'error' + '_' + dateStr + '.' + 'json');
    }

    ngAfterViewInit() {
        this.cdr.markForCheck();
        this.detectChanges();
    }

    // changeDebugMode($event) {
    //     this.isDebug = $event.target.checked;
    //     this.debounceProvider.debounce(() => {
    //         this.saveErrorConfig();
    //         this.emp.isEnabled = this.isDebug;
    //     }, 350);
    // }

    // saveErrorConfig() {
    //     console.log('Start save');
    //     if (this.getSetting(this.key)) {
    //         this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.key)[0].DATA = JSON.stringify(this.isDebug);
    //     } else {
    //         this.data.TM_SETTINGS_KEYS.push({
    //             "KEY": this.key,
    //             "DATA": JSON.stringify(this.isDebug),
    //         });
    //     }
    //
    //     this.settingsGroupsService.saveSettingsGroup(this.data).subscribe((res: any) => {
    //         console.log('Start saved');
    //         this.notificationRef.notifyShow(
    //             1,
    //             this.isDebug ? 'Debug mode enabled' : 'Debug mode disabled');
    //     });
    // }
    //
    // getSetting(key) {
    //     if (this.data.TM_SETTINGS_KEYS) {
    //         return this.data.TM_SETTINGS_KEYS.filter(el => el.KEY === key)[0];
    //     }
    // }
    //
    // initErrorSettings() {
    //     this.settingsGroupsService.getSettingsGroupById(0, true).subscribe((res: any) => {
    //         if (res) {
    //             this.data = {
    //                 "ID": res.ID,
    //                 "NAME": res.NAME,
    //                 "DESCRIPTION": res.DESCRIPTION,
    //                 "TM_SETTINGS_KEYS": res.TM_SETTINGS_KEYS.map(el => {
    //                     el.EntityKey = null;
    //                     el.TM_SETTINGS_GROUPS = null;
    //                     el.TM_SETTINGS_GROUPSReference = null;
    //                     return el;
    //                 })
    //             };
    //             let debugData = this.getSetting(this.key);
    //             if (debugData) {
    //                 this.isDebug = <boolean>JSON.parse(debugData.DATA);
    //                 this.cdr.detectChanges();
    //             }
    //         }
    //     });
    // }

    getErrorModels(): ErrorReportModel[] {
        let models: ErrorReportModel[] = [];
        $.each(this._errors, (k, iError: ErrorInterface) => {
            let title = iError instanceof  NetworkError ? iError.getTitle() + ' ( traceId: '+(iError as NetworkError).getTraceId()+') ': iError.getTitle();
            models.push({
                title: title,
                message: this._description,
                version: (<any>window).IMFX_VERSION,
                apiUrl: (<any>window).IMFX_API_URL,
                ref: location.href,
                userId: this.profileService.userData?this.profileService.userData.UserID:'anon',
                timestamp: (new Date()).toString(),
                stack: iError.getText('text', 'full', 10),
                appInfo: this.sessionStorage.retrieve('appinfo'),
                userAgent: navigator.userAgent
            });
        });

        return models;
    }

    addError(error: ErrorInterface) {
        this.cdr.detach();
        this._errors.push(error);
        this._errorAsString = this.getErrorModelAsString();
        // $.each(this._errors, (k, iError: ErrorInterface) => {
        //     this._errorAsString += iError.getText('text', 'full', 10);
        // });
        if (this._errors.length === 1) {
            this._title = this._errors[0].getTitle();
        }

        this.cdr.reattach();
        setTimeout(() => {
            this.cdr.detectChanges();
        });
    }

    protected hasFullStorageError(): boolean {
        return this._errors.some(el => {
            return el.originalError
                && el.originalError instanceof DOMException
                && el.originalError.message
                && el.originalError.message.indexOf(`Failed to execute 'setItem' on 'Storage'`) > -1
        });
    }

    protected copyStorage() {
        //@ts-ignore
        const strategyS = this.sessionStorage.strategy as any;
        const storageS = {
            storage: strategyS.storage,
            caches: strategyS.cache.caches
        };

        //@ts-ignore
        const strategyL = this.localStorage.strategy as any;
        const storageL = {
            storage: strategyL.storage,
            caches: strategyL.cache.caches
        };

        this.clipboardProvider.copy(JSON.stringify({storageSessionStrategy: storageS, storageLocalStrategy: storageL}, null, '\t'));
    }

    protected setDescription($event) {
        this.cdr.detach();
        this._description = $event.target.value;
        this._errorAsString = this.getErrorModelAsString();
        this.cdr.reattach();
        this.detectChanges();
    }

    protected copyError() {
        this.clipboardProvider.copy(this.getErrorModelAsString());
    }

    private getErrorModelAsString() {
        return JSON.stringify(this.getErrorModels(), null, 4);
    }
}
