/**
 * Created by Sergey Trizna on 31.08.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    HostListener,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Router} from '@angular/router';
import {UploadProvider} from '../../../../modules/upload/providers/upload.provider';
import {appRouter} from '../../../../constants/appRouter';
import {UploadComponent, UploadMethod} from '../../../../modules/upload/upload';
import {IMFXModalComponent} from '../../../../modules/imfx-modal/imfx-modal';
import {IMFXModalProvider} from '../../../../modules/imfx-modal/proivders/provider';
import {IMFXModalAlertComponent} from "../../../../modules/imfx-modal/comps/alert/alert";
import {TranslateService} from "@ngx-translate/core";
import {IMFXModalEvent} from "../../../../modules/imfx-modal/types";
import {LoginProvider} from '../../../login/providers/login.provider';
import {UploadModel} from "../../../../modules/upload/models/models";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ClipboardProvider} from "../../../../providers/common/clipboard.provider";
import {SettingsGroupsService} from "../../../../services/system.config/settings.groups.service";
import {UploadGroupSettings} from "../../../../modules/upload/types";
import {InterfaceUploadService} from "../../../../modules/upload/services/interface.upload.service";
import {ProfileService} from "../../../../services/profile/profile.service";
import {SecurityService} from "../../../../services/security/security.service";
import {lazyModules} from "../../../../app.routes";

require('../../../../modules/upload/libs/filedrop/filedrop.ts');
export type UploadQueueFromPreferences = { [key: string]: UploadModel[] | string };
export type UploadNotifyType = { model: UploadModel | null, models: UploadModel[], queueFinished?: boolean }


@Component({
    selector: 'base-upload-menu',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})
export class BaseUploadMenuComponent {
    public destroyed$: Subject<void> = new Subject<void>();
    public readonly notifyUpload: EventEmitter<UploadNotifyType> = new EventEmitter<UploadNotifyType>();
    protected ddMode: boolean|'skip'  = true;
    private Math: Math = Math;
    // @ViewChild('ddMenu', {static: false}) private ddMenu: any;
    @ViewChild('queueMenu', {static: false}) private queueMenu: any;
    @ViewChild('messageErrorText', {static: false}) private messageErrorText: any;
    @ViewChild('messageErrorWorkflowText', {static: false}) private messageErrorWorkflowText: any;
    private timeoutHandler;
    private skipUploadMode: boolean = false;
    private modal: IMFXModalComponent;
    private statusDescriptionHandler: IMFXModalComponent;
    private openedForm: string = null;

    constructor(protected uploadProvider: UploadProvider,
                private router: Router,
                private loginProvider: LoginProvider,
                private modalProvider: IMFXModalProvider,
                public cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private clipboardProvider: ClipboardProvider,
                public sgs: SettingsGroupsService,
                public profileService: ProfileService,
                private securityService: SecurityService
    ) {
        // set reference
        uploadProvider.baseUploadMenuRef = this;

        // get setups
        this.sgs.getSettingsUserById('uploadSettings').subscribe((res: any) => {
            if (res && res[0] && res[0].DATA) {
                this._ugs = JSON.parse(res[0].DATA) as UploadGroupSettings;
                const method: UploadMethod = this.uploadProvider.getUploadMethod();
                const service: InterfaceUploadService = this.uploadProvider.getService(method);

                // retrieve queue
                service.onLoad.emit();

                this.loginProvider.onLogout.subscribe(() => {
                    service.onLogout.emit({});
                })
            }
        });

        // on logout

    }

    private _ugs: UploadGroupSettings;

    get ugs(): UploadGroupSettings {
        return this._ugs;
    }

    set ugs(value: UploadGroupSettings) {
        this._ugs = value;
    }

    @HostListener('window:click', ['$event'])
    docClick(event) {
        if (
            $(event.target).closest('.dropdown-dragover-target').length === 0 &&
            $(event.target).hasClass('upload-icons') === false
        ) {
            this.closeQueueMenu('skip');
        } else {
            this.openQueueMenu();
        }
        this.cdr.markForCheck();
    }

    onOpenPopup() {
        this.ddMode = false;
        this.cdr.markForCheck();
    }

    removeModel(um) {
        const service: InterfaceUploadService = this.uploadProvider.getService();
        service.onRemove.emit({um: um});
        this.openQueueMenu();
        this.cdr.markForCheck();
        // const method: UploadMethod = this.uploadProvider.getUploadMethod();
        // if(method === 'native' || method === 'remote') {
        //     this.uploadProvider.removeModelFromQueue(um);
        //     if (this.uploadProvider.uploadModels.length > 0) {
        //         this.openQueueMenu();
        //     } else {
        //         this.closeQueueMenu();
        //         this.ddMode = true;
        //     }
        // }
        // else if(method === 'aspera'){
        //     this.uploadProvider.removeModelFromQueue(um);
        //     if (this.uploadProvider.uploadModels.length > 0) {
        //         this.openQueueMenu();
        //     } else {
        //         this.closeQueueMenu();
        //         this.ddMode = true;
        //     }
        //     const service: any = this.uploadProvider.getService(method);
        //     (service as AsperaUploadService).onDelete.emit({um: um});
        // }
    }

    retry(um: UploadModel) {
        const service: InterfaceUploadService = this.uploadProvider.getService();
        service.onRetry.emit({um: um});
        this.openQueueMenu();
        this.cdr.markForCheck();
        // // todo i think 'remote' is excess check
        // if(method === 'native' || method === 'remote') {
        //     um.state = 'waiting';
        //     if (this.uploadProvider.getUploadModelsByStates('progress').length === 0) {
        //         this.uploadProvider.processUpload(um, true);
        //     }
        // } else if(method === 'aspera'){
        //     this.uploadProvider.uploadModels.find((x)=>x.id == um.id).state = 'progress';
        //     const service: InterfaceUploadService = this.uploadProvider.getService(method);
        //     (service as AsperaUploadService).onRetry.emit({um: um});
        // }
    }

    pause(um: UploadModel) {
        const service: InterfaceUploadService = this.uploadProvider.getService();
        service.onPause.emit({um: um});
        this.openQueueMenu();
        this.cdr.markForCheck();
        // const method: UploadMethod = this.uploadProvider.getUploadMethod();
        // // todo i think 'remote' is excess check
        // if(method === 'native' || method === 'remote') {
        //     return;
        // } else if(method === 'aspera'){
        //     const service: InterfaceUploadService = this.uploadProvider.getService(method);
        //     this.uploadProvider.uploadModels.find((x)=>x.id == um.id).state = 'paused';
        //     (service as AsperaUploadService).onPause.emit({um: um});
        // }
    }

    showStatusDescription(uploadModel: UploadModel) {
        let title = '';
        let content = '';
        if (uploadModel.state === 'error') {
            title = uploadModel.method === 'remote'?'upload.remote_uploaded_error_title':'upload.uploaded_error_title';

            if(uploadModel.getStatusMessage()) {
                content = uploadModel.getStatusMessage();
            } else {
                content = this.translate.instant('upload.uploaded_error', {
                    fileName: uploadModel.name,
                    ext: uploadModel.getFileType(),
                    errorText: uploadModel.getStatusMessage() ? uploadModel.getStatusMessage() : ''
                });
                console.error('Not found property .file in upload model.' +
                    'What type of file did you tried upload? What was name of file?' +
                    'Upload model:' + (uploadModel));
                // throw Error('Not found property .file in upload model.' +
                //     'What type of file did you tried upload? What was name of file?' +
                //     'Upload model:' + JSON.stringify(uploadModel));
            }
        } else if (uploadModel.state === 'warning') {
            title = uploadModel.method === 'remote'?'upload.remote_uploaded_warning_title':'upload.uploaded_warning_title';
            content = this.translate.instant('upload.uploaded_warning', {
                fileName: uploadModel.name,
                ext: uploadModel.getFileType(),
                errorText: uploadModel.getStatusMessage()
            });
        } else if (uploadModel.state === 'paused') {
            title = uploadModel.method === 'remote'?'upload.uploaded_paused_title':'upload.uploaded_paused_title';
            content = this.translate.instant('upload.uploaded_paused', {
                fileName: uploadModel.name,
                ext: uploadModel.getFileType(),
                errorText: uploadModel.getStatusMessage()
            });
        } else if (uploadModel.state === 'progress') {
            title = uploadModel.method === 'remote'?'upload.remote_uploaded_progress_title':'upload.uploaded_progress_title';
            title = 'upload.uploaded_progress_title';
            content = this.translate.instant('upload.uploaded_progress', {
                fileName: uploadModel.name,
                ext: uploadModel.getFileType(),
                errorText: uploadModel.getStatusMessage()
            });
        } else if (uploadModel.state === 'completing') {
            title = uploadModel.method === 'remote'?'upload.remote_uploaded_completing_title':'upload.uploaded_completing_title';
            title = 'upload.uploaded_progress_title';
            content = this.translate.instant('upload.uploaded_completing', {
                fileName: uploadModel.name,
                ext: uploadModel.getFileType(),
                errorText: uploadModel.getStatusMessage()
            });
        } else {
            title = uploadModel.method === 'remote'?'upload.remote_uploaded_successful_title':'upload.uploaded_successful_title';
            // title = 'upload.uploaded_successful_title';
            content = this.translate.instant('upload.uploaded_successful', {
                fileName: uploadModel.name,
                ext: uploadModel.getFileType(),
            });
        }
        const modal: IMFXModalComponent = this.statusDescriptionHandler = this.modalProvider.show(
            IMFXModalAlertComponent,
            {
                title: title,
                footerRef: 'modalFooterTemplate'
            });
        // comp.setTitle(title);
        const comp: IMFXModalAlertComponent = modal.getContent();
        comp.setText(content);
        comp.setCopyButton(true);
        modal.modalEvents.pipe(takeUntil(this.destroyed$)).subscribe((e: IMFXModalEvent) => {
            if (e.name === 'ok') {
                modal.hide();
            }
        });
        // modal.load().then((compRef: ComponentRef<IMFXModalAlertComponent>) => {
        //
        // })
    }

    hideStatusDescription() {
        if (this.statusDescriptionHandler) {
            this.statusDescriptionHandler.hide();
            this.statusDescriptionHandler = null;
        }
    }

    // private ks:
    ngAfterViewInit() {
        let self = this;
        this.closeQueueMenu('skip');
        (<any>$(document)).filedrop({
            onDragLeave: function (event) {
                if (self.skipUploadMode) {
                    return;
                }
                // self.timeoutHandler = setTimeout(() => {
                //     self.closeQueueMenu();
                //     // for (var i = 0; i < self.timeoutHandler; i++) {
                //     //     clearTimeout(i);
                //     //     clearTimeout(self.timeoutHandler[i]);
                //     // }
                //     self.ddMode = false;
                //     // setTimeout(() => {
                //     //
                //     //     // self.cdr.detectChanges();
                //     // }, 1000);
                // }, 500);
            },
            onDragOver: function (event) {
                self.skipUploadMode = self.isPreventedDragDropEvent(event);
                if (self.skipUploadMode) {
                    return;
                }
                if (!self.uploadProvider.uploadModalIsOpen) {
                    self.openQueueMenu();
                }

                if ($(event.target).closest('.drop-file-block').length > 0) {
                    $('.drop-file-block').addClass('drop-area-border');
                } else {
                    $('.drop-file-block').removeClass('drop-area-border');
                }
                self.ddMode = true;
                self.cdr.detectChanges();
            },
            onDragStart: function (event) {
                self.skipUploadMode = self.isPreventedDragDropEvent(event);
            },
            callback: function (files, event) {
                if (self.uploadProvider.moduleContext &&
                    self.uploadProvider.getUploadMethod() === 'remote') {
                    return false;
                }

                if (!self.allowOpenModal(event) || self.skipUploadMode) {
                    self.closeQueueMenu();
                    return;
                }

                self.closeQueueMenu();
                // if(self.uploadProvider.uploadModalIsOpen) {
                //     return false;
                // }




                // if (!self.skipUploadMode) {
                //     self.closeQueueMenu();
                // }
                // if (self.skipUploadMode) {
                //     return;
                // }

                if (self.uploadProvider.getUploadMethod() !== 'aspera') {
                    if (self.uploadProvider.validateFiles(files)) {
                        if (!self.uploadProvider.uploadModalIsOpen) {
                            self.open(files);
                        } else {
                            self.uploadProvider.moduleContext.onSelectFiles(files);
                        }


                        // self.cdr.detectChanges();
                        // setTimeout(() => {
                        //
                        // });
                        //
                        // setTimeout(() => {
                        //
                        //
                        // }, 1000);
                    }
                }


                self.ddMode = true;
                self.skipUploadMode = false;
            }
        });
    }

    getModels(): UploadModel[] {
        return this.uploadProvider.getUploadModelsByNotStates('not_ready');
    }

    ngOnDestroy() {
        $(document).unbind('dragover dragleave drop');
        const service: InterfaceUploadService = this.uploadProvider.getService();
        service.onDestroy.emit({});
        this.uploadProvider.clearProperties();
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    open(files?: FileList): void {
        if (!this.securityService.hasPermissionByName('media_upload')) {
            console.warn('>>> Upload not allowed');
            return;
        }
        // this.uploadProvider.uploadModalIsOpen = true;
        if (!this.uploadProvider.uploadModalIsOpen) {
            const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.upload_modal, UploadComponent, {
                title: 'base.media_upload',
                size: 'xl',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            });

            modal.load().then((cr: ComponentRef<UploadComponent>) => {
                if (files) {
                    if (this.uploadProvider.getUploadMethod() !== 'aspera') {
                        modal.contentView.instance.onSelectFiles(files);
                    }
                }

                this.modal = modal;
            });
        } else {
            if (this.uploadProvider.moduleContext) {
                if (this.uploadProvider.getUploadMethod() !== 'aspera') {
                    this.uploadProvider.moduleContext.onSelectFiles(files);
                }
                // this.uploadProvider.moduleContext.onSelectFiles(files);
            }
        }


        // const msbs = modal.modalEvents.subscribe((e: IMFXModalEvent) => {
        //     if (e.name === 'hide' || e.name === 'autohide') {
        //         this.uploadProvider.uploadModalIsOpen = false;
        //         msbs.unsubscribe();
        //         // this.closeQueueMenu();
        //         // this.ddMode = false;
        //         // this.cdr.detectChanges();
        //     }
        //     // if (files && e.name === 'shown') {
        //     //     this.uploadProvider.moduleContext.onSelectFiles(files);
        //     // }
        //
        // });

    }

    protected copyError(uploadModel: UploadModel) {
        this.clipboardProvider.copy(uploadModel.getStatusMessage());
    }

    private isPreventedDragDropEvent(event): boolean {
        return (event.target.className.indexOf('dd-dots') > -1) || (event.target.className.indexOf('imfx-allow-dnd') > -1);
    }

    private allowOpenModal(event): boolean {
        const $event = $(event.target);
        // dd to popup dialog
        const ddpd = $event.closest('.no-uploads-in-progress').length > 0;
        // dd to upload modal
        const ddum = $event.closest('.select-files-block-handler').length > 0;
        // dd to version grid
        const ddvg = $event.closest('slick-grid.version-grid .slick-row').length > 0;
        if (ddvg) {
            this.uploadProvider.droppedToBlock = 'version-row';
        } else if (ddum) {
            this.uploadProvider.droppedToBlock = 'popup';
        } else if (ddvg) {
            this.uploadProvider.droppedToBlock = 'popup';
        } else {
            this.uploadProvider.droppedToBlock = null;
        }
        return ddpd || ddum || ddvg || false;
    }

    private closeQueueMenu(ddMode: boolean|'skip' = true) {
        if(this.queueMenu){
            $(this.queueMenu.nativeElement).removeClass('opened');
            this.ddMode = ddMode;
        }
    }

    private openQueueMenu() {
        $(this.queueMenu.nativeElement).addClass('opened');
    }

    private navFromUploadMenu(router, param) {
        if (router === '/workflow/detail') {
            return this.router.navigate(
                [
                    appRouter.workflow.detail.substr(
                        0,
                        appRouter.workflow.detail.lastIndexOf('/')
                    ),
                    param
                ]
            );
        } else if (router === '/media/detail') {
            return this.router.navigate(
                [
                    appRouter.media.detail.substr(
                        0,
                        appRouter.media.detail.lastIndexOf('/')
                    ),
                    param
                ]
            );
        }
    }

}
