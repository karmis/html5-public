/**
 * Created by Sergey Trizna on 29.03.2017.
 */
import {
    ComponentRef,
    ErrorHandler,
    Inject,
    Injectable
} from "@angular/core";
import { RuntimeError } from "./models/runtime.error";
import { StringProivder } from "../../providers/common/string.provider";
import { SessionStorageService } from "ngx-webstorage";
import { ErrorManagerProvider } from "./providers/error.manager.provider";
import { NotificationService } from "../notification/services/notification.service";
import { NetworkError } from './models/network.error';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { ErrorModalComponent } from './modules/error-modal/error';
import { IMFXModalEvent } from '../imfx-modal/types';
import { IMFXModalProvider } from '../imfx-modal/proivders/provider';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from './models/interface.error';
import { ErrorRefreshModalComponent } from './modules/error-refresh/error';
import {lazyModules} from "../../app.routes";

@Injectable()
export class ErrorManager extends ErrorHandler {
    private errorModalCTX: ErrorModalComponent;
    private errModal: IMFXModalComponent;
    private errorModalPromise: Promise<any>;
    private modalOpening: boolean = false;
    private stackUnshownErrors: ErrorInterface[] = [];

    constructor(
        private storageService: SessionStorageService,
        private stringProvider: StringProivder,
        private modalProvider: IMFXModalProvider,
        private translate: TranslateService,
        public emp: ErrorManagerProvider,
        @Inject(NotificationService) private notificationRef: NotificationService
    ) {
        super();
        Promise.resolve().then(() => {
            if ((<any>window).IMFX_VERSION !== 'dev_version') {
                this.emp.isEnabled = this.storageService.retrieve('config.user.group.preferences.isdebugmode');
            }
        });

        this.emp.onErrorThrown.subscribe((errorObj: { error: ErrorInterface }) => {
            this.throwError(errorObj.error);
        });
    }

    handleRuntimeError(error, silent = false) {
        const errorModel = new RuntimeError();
        errorModel.setOriginalError(error);
        !silent && console.error(error);

        this.throwError(errorModel);
    }

    handleError(error: any): void {
        this.handleRuntimeError(error);
    }

    handleNetworkError(error) {
        const errorModel = new NetworkError();
        errorModel.setOriginalError(error);
        console.error(error);

        this.throwError(errorModel);
    }

    handleXHRNetworkError(error: XMLHttpRequest) {
        const errorModel = new NetworkError();
        errorModel.mode = 'xhr';
        errorModel.setOriginalError(error);
        console.error(error);

        this.throwError(errorModel);
    }

    throwError(error: ErrorInterface) {
        // see to emp.regexpForSpecialHandler
        const specialHandler = this.emp.errorHasSpecialHandler(error);
        if (specialHandler !== false) {
            this[(<string>specialHandler)](error);
            return;
        }

        if (!this.emp.isEnabled) {
            console.log('ErrorManager disabled');
            return;
        }

        if (this.emp.errorIsPrevented(error) === true) {
            return;
        }

        if (this.emp.errorIsSpecialEndpoint(error) === true) {
            return;
        }

        // check for network errors
        if (error instanceof NetworkError) {
            // check for incorrect password
            (<NetworkError | false>error) = this.checkForIncorrectPassword(error);
            if ((<NetworkError | false>error) === false) {
                return;
            }
        }

        if (error instanceof RuntimeError) {
            // check for runtime errors
            // ...
        }


        this.showErrorModal(error);
        // this.emp.onErrorThrown.emit({error: error});
    }

    private showErrorModal(error: ErrorInterface) {
        if (!this.emp.modalOpened && !this.modalOpening) {
            this.modalOpening = true;
            this.errModal = this.modalProvider.showByPath(
                lazyModules.error_modal,
                ErrorModalComponent,
                {
                    type: 'error',
                    isCloseCross: true,
                    title: this.translate.instant('error_modal.title'),
                    footerRef: 'modalFooterTemplate',
                    size: 'md',
                    keyboard: true
                });
            this.errorModalPromise = this.errModal.load();
            this.errorModalPromise.then((modal: ComponentRef<ErrorModalComponent>) => {
                this.emp.modalOpened = true;
                this.modalOpening = false;
                this.errorModalCTX = modal.instance;
                this.errorModalCTX.addError(error);

                this.errModal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name === 'hide' || e.name === 'autohide') {
                        this.emp.modalOpened = false;
                        this.errorModalCTX = undefined;
                    }
                });
            });
        } else if (!this.modalOpening && this.emp.modalOpened) {
            this.errorModalCTX.addError(error);
        } else {
            this.stackUnshownErrors.push(error);
            this.errorModalPromise.then((modal: ComponentRef<ErrorModalComponent>) => {
                this.emp.modalOpened = true;
                this.modalOpening = false;
                this.errorModalCTX = modal.instance;
                this.errorModalCTX.cdr.detach();
                $.each(this.stackUnshownErrors, (k, unShownError) => {
                    this.errorModalCTX.addError(unShownError);
                });
                this.errorModalCTX.cdr.reattach();
                this.errorModalCTX.cdr.detectChanges();
                this.stackUnshownErrors = [];
            });
        }
    }

    // see to emp.regexpForSpecialHandler
    needToRefreshBuild(): void {
        if (!this.emp.isEnabled) {
            console.log('ErrorManager disabled');
            return;
        }

        if (this.emp.modalRefreshErrorOpened === true) {
            return;
        }
        this.emp.modalRefreshErrorOpened = true;
        const modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.error_refresh_modal,
            ErrorRefreshModalComponent,
            {
                type: 'error',
                isCloseCross: false,
                title: this.translate.instant('error_refresh_modal.title'),
                footer: false,
                size: 'md',
                keyboard: false
            });

        modal.load().then((ref: ComponentRef<ErrorRefreshModalComponent>) => {
            const inst: ErrorRefreshModalComponent = ref.instance;
            inst.detectChanges();
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'hide' || e.name === 'autohide') {
                    this.emp.modalRefreshErrorOpened = false;
                }
            });
        });
    }

    private needToShowNotification(error: ErrorInterface) {
        this.notificationRef.notifyShow(2, error.getTitle());
    }

    private checkForIncorrectPassword(error: NetworkError): NetworkError | false {
        if (
            error &&
            error.originalError &&
            error.originalError.status == 400
            &&
            ((error.originalError.message).indexOf("The user name or password is incorrect") > -1 ||
            (error.originalError.error.Message).indexOf("The user name or password is incorrect") > -1)
        ) {
            return false;
        }

        let errorFiltered = this.stringProvider.replaceStringByArray(
            error.getText('text', 'small'), [
                "(username=|password=)[a-zA-Z0-9\_\*\\.\\-\!\]+"
            ], [
                '>>hidden<<'
            ]);

        error.setText(errorFiltered);

        return error;
    }

    private showNotification(errorFiltered): void {
        this.notificationRef.notifyShow(2, errorFiltered);
    }

    // private createIssue(error: RuntimeError | NetworkError) {
    //     let text = error.getText('text');
    //     console.log(this.httpService);
    //     /*debugger*/
    //     let url = "http://yt.tmd.tv/rest/issue?project=ProjectX&summary='Issue created automated;'&description=test";
    //     let request = new Request({
    //         method: RequestMethod.Put,
    //         url: url,
    //         body: {},
    //         withCredentials: true
    //     });
    //     request.headers = new HttpHeaders();
    //     request.headers.set('Content-Type', 'application/x-www-form-urlencoded');
    //
    //     this.http.request(request).subscribe((res: any) => {
    //         /*debugger*/
    //     });
    //     // this.httpService.put("", {})
    // }
}
