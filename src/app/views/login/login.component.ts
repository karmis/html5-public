import {ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation} from "@angular/core";
import { Location } from "@angular/common";
import { LoginService } from "../../services/login/login.service";
import { LoginProvider } from "./providers/login.provider";
import { ConfigService } from "../../services/config/config.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CapsLockProvider } from "../../providers/common/capslock.provider";
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { ProfileService } from "../../services/profile/profile.service";
import { CookieService } from "ng2-cookies";
import { ServerStorageService } from '../../services/storage/server.storage.service';
import {NotificationService} from "../../modules/notification/services/notification.service";
import {appRouter} from "../../constants/appRouter";
import {Icons} from "../../services/system.config/icons";
import {ThemesProvider} from "../../providers/design/themes.providers";
import {SplashProvider} from "../../providers/design/splash.provider";
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingIconsService } from "../system/config/comps/global.settings/comps/loading-icons/providers/loading-icons.service";

@Component({
    encapsulation: ViewEncapsulation.None,
    moduleId: 'login',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        CapsLockProvider,
        CookieService
    ]
})

export class LoginComponent {
    public loginForm: FormGroup;
    private appVersion: string;
    private serverVersion: string;
    private currentYear: number;
    private isError: Boolean = false;
    private isErrorMoreInfo: Boolean = false;
    private errorTextObj: {
        type: string,
        inTranslateList: boolean
    };
    private errorMoreInfoText: String;
    private disabledLoginBtn: boolean = false;
    private capsLockNotification: boolean = false;
    private changeExpired: Boolean = false;
    private loading: Boolean = false;
    private loadingOkta: Boolean = false;
    private loadingAD: Boolean = false;
    private autologin: boolean = false;
    private defaultPageSubscription;
    private loginMode: any = [];
    private mainLogo: any = {logo: '', url: ''};
    private bigLogo = null;
    private qrCodeElementType: 'url' | 'canvas' | 'img' = 'img';
    private qrCodeValue = "otpauth://totp/i-mediaflex?secret=";
    private qrCodeValueRaw = "";
    private state2fa;
    private code2fa;
    private message2fa;
    private termsAndConditionsText;
    private stateTac;
    private showTAC = false;
    private showQrCode = false;
    private showSmsField = false;

    constructor(private formBuilder: FormBuilder,
                private loginService: LoginService,
                private loginProvider: LoginProvider,
                private capsLockProvider: CapsLockProvider,
                private cdr: ChangeDetectorRef,
                private localStorage: LocalStorageService,
                private sessionStorage: SessionStorageService,
                private location: Location,
                private router: Router,
                private cookieService: CookieService,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private profileService: ProfileService,
                private notification: NotificationService,
                private splashProvider: SplashProvider,
                public storageService: ServerStorageService,
                private themesProvider: ThemesProvider,
                private loadingIconsService: LoadingIconsService
    ) {
        this.notification.notifyHide();
        //this.isExpired = true;
        // clear data about current session  (if the user was able to exit without /logout)
        if (this.loginProvider.loginService.isLoggedIn() === true) {
            this.splashProvider.ignoreInterceptorOnce = true;
            this.doLogin(true);
        } else {
            this.loginService.preloginData().subscribe((res: any) => {
                    if (res && res.authMode && res.authMode.length > 0) {
                        this.loginMode = res.authMode;
                        this.serverVersion = res.serverVersion;
                        this.loginProvider.serverVersion = this.serverVersion;
                        this.localStorage.clear('server_version');
                        this.localStorage.store('server_version', this.serverVersion);
                        this.localStorage.clear('utc_timezone_offset');
                        this.localStorage.store('utc_timezone_offset', res.utcTimezoneOffset);
                        this._getUserLogoUrl(res.branding);
                        this.route.queryParams.subscribe((res: any) => {
                            if (res['auto'] != undefined) {
                                this.autologin = true;
                                this.loginProvider.logout({redirectTo: 'login??auto'}, true);
                            }
                            else {
                                this.autologin = false;
                                var stateId = this.cookieService.get("stateId");
                                if (stateId && stateId.length > 0) {
                                    this.loginOcta(null, stateId);
                                }
                                else if (this.loginMode.length == 1 && this.checkLoginMode('Okta')) {
                                    setTimeout(() => {
                                        this.loginOcta(null);
                                    });
                                }
                                else if (this.checkLoginMode('ActiveDirectory')) {
                                    this.loginAD(null);
                                }
                                else {
                                    this.loginProvider.logout({redirectTo: ''});
                                }
                            }
                            this.MYngOnInit();
                            this.cdr.detectChanges();
                        });
                    }
                    else {
                        //Handle error
                        alert("App Info Not Allowed!");
                    }
                },
                (error: HttpErrorResponse) => {
                    this.cleanState();
                    this.isError = true;
                    this.disabledLoginBtn = false;
                    this.loginMode = "";
                    if (!error.statusText) {
                        this.errorTextObj = {
                            type: "login.error_network",
                            inTranslateList: true
                        };
                    } else {
                        let errDescr = error.error.error_description;

                        this.errorTextObj = this.getErrorTypeToTranslate(errDescr);

                        if (errDescr && errDescr.split('\n').length > 1) {
                            this.isErrorMoreInfo = true;
                            this.errorMoreInfoText = errDescr;
                        } else {
                            this.isErrorMoreInfo = false;
                            this.errorMoreInfoText = "";
                        }
                    }
                    this.loadingOkta = false;
                    this.loadingAD = false;
                    this.loading = false;
                    this.cdr.detectChanges();
                });
        }
    }

    MYngOnInit() {
        // login form
        this.appVersion = ConfigService.getAppVersion();
        this.currentYear = new Date().getFullYear();
        if (!this.checkLoginMode('ActiveDirectory') && this.checkLoginMode('Native')) {
            this.loginForm = this.formBuilder.group({
                username: ['', Validators.required], // tmddba
                password: ['', Validators.required], // *.tmd02
                rememberme: ['']
            });

            this.MYngAfterViewInit();
        }
    }

    private isExpired: Boolean = false;
    private isForcePassReset: Boolean = false;
    private changePassObject = {
        UserId: null,
        OldPassword : null,
        NewPassword : null
    };
    private changeInProgress = false;
    changePassword() {
        this.changeExpired = true;
    }

    backChangePassword() {
        if(this.changeInProgress)
            return;
        this.changePassObject = {
            UserId: null,
            OldPassword : null,
            NewPassword : null
        };
        this.changeExpired = false;
        this.isError = false;
        this.isExpired = false;
        this.isForcePassReset = false;
    }

    changePasswordApply() {
        if(this.changeInProgress)
            return;
        if(this.changePassObject.UserId && this.changePassObject.UserId.trim().length > 0 &&
            this.changePassObject.OldPassword && this.changePassObject.OldPassword.trim().length > 0 &&
            this.changePassObject.NewPassword && this.changePassObject.NewPassword.trim().length > 0) {
            this.changeInProgress = true;
            this.loginService.changePassword({
                UserId: this.changePassObject.UserId.toUpperCase(),
                OldPassword: this.changePassObject.OldPassword,
                NewPassword: this.changePassObject.NewPassword
            }).subscribe((res: any) => {
                    this.changeInProgress = false;
                    this.backChangePassword();
                    this.cdr.detectChanges();
                },
                (error: HttpErrorResponse) => {
                    this.isError = true;
                    this.isErrorMoreInfo = false;
                    this.disabledLoginBtn = false;
                    this.loadingOkta = false;
                    this.changeInProgress = false;

                    if (!error.statusText) {
                        this.errorTextObj = {
                            type: "login.error_network",
                            inTranslateList: true
                        };
                    } else {
                        let errDescr = error.error.Error;

                        this.errorTextObj = {
                            type: errDescr,
                            inTranslateList: false
                        };

                        if (errDescr && errDescr.split('\n').length > 1) {
                            this.isErrorMoreInfo = true;
                            this.errorMoreInfoText = errDescr;
                        } else {
                            this.isErrorMoreInfo = false;
                            this.errorMoreInfoText = "";
                        }
                    }
                    this.cdr.detectChanges();
                });
        }
        else {
            this.isError = true;
            this.isErrorMoreInfo = false;
            this.disabledLoginBtn = false;
            this.loadingOkta = false;
            this.errorTextObj = {
                type: "login.not_valid_change",
                inTranslateList: true
            };
            this.cdr.detectChanges();
        }
    }

    MYngAfterViewInit() {
        this.disabledLoginBtn = !!(this.loginForm.value.username && this.loginForm.value.password);
        this.capsLockProvider.initCapsLockListener();
        this.capsLockProvider.onCapsLockEnable.subscribe((data) => {
            this.capsLockNotification = data.state;
            this.cdr.markForCheck();
        });
    }

    doLogin(logged = false) {
        if(logged) {
            this.localStorage.clear('permissions');
            this.profileService.getUserProfile().subscribe(
                (profileResp) => {
                    this.doLoginResult();
                });
        }
        else {
            this.doLoginResult();
        }
    }

    doLoginResult() {
        this.loginService.userLogin.emit(true)
        let compRef = this;
        this.defaultPageSubscription = this.profileService.defaultPage.subscribe((page) => {
            let path = this.loginService.getTargetPath();
            if (path) {
                if (compRef.defaultPageSubscription) {
                    compRef.defaultPageSubscription.unsubscribe();
                }

                // setTimeout(() => {
                    if(path === 'simple' || path === 'consumer' || path === 'search'){
                        path = appRouter.consumer.search
                    }
                    this.router.navigate([path]);
                // });


                this.loginService.clearTargetPath();
            }
        });

        this.loginService.entrySessionStorage();
        this.profileService.retrieveDefaultPage();
    }

    loginOcta(event, stateId?: string) {
        if (this.loadingOkta) {
            return;
        }
        if (event) {
            event.preventDefault();
        }
        this.isExpired = false;
        this.isForcePassReset = false;
        this.disabledLoginBtn = true;
        this.loading = true;
        this.loadingOkta = true;
        // Request to login
        this.loginService.loginOkta(stateId, this.loginService.getTargetPath()).subscribe(
            (resp: any) => {
                if(resp && resp.authReps && resp.authReps.warning) {
                    this.notification.notifyShow(2, resp.authReps.warning, false, 3000, true);
                }
                {
                    if (resp && stateId && resp.redirect_url) {
                        this.cookieService.delete('stateId');
                        document.location.href = resp.redirect_url;
                    }
                    else if (resp && stateId && stateId.length > 0) {
                        this.cleanState();
                        this.isError = false;
                        this.isErrorMoreInfo = false;
                        this.disabledLoginBtn = false;
                        this.loadingOkta = false;
                        this.doLogin();
                        return;
                    }
                    else if (resp && resp.redirect_url) {
                        document.location.href = resp.redirect_url;
                    }
                    else {
                        this.cleanState();
                        this.isError = true;
                        this.isErrorMoreInfo = false;
                        this.disabledLoginBtn = false;
                        this.loadingOkta = false;
                        this.errorTextObj = {
                            type: "login.octa_network_error",
                            inTranslateList: true
                        };
                        this.cdr.detectChanges();
                    }
                }
            },
            (error: HttpErrorResponse) => {
                this.cleanState();
                this.isError = true;
                this.disabledLoginBtn = false;
                if (!error.statusText) {
                    this.errorTextObj = {
                        type: "login.error_network",
                        inTranslateList: true
                    };
                } else {
                    let errDescr = error.error.error_description;

                    this.errorTextObj = this.getErrorTypeToTranslate(errDescr);

                    if (errDescr && errDescr.split('\n').length > 1) {
                        this.isErrorMoreInfo = true;
                        this.errorMoreInfoText = errDescr;
                    } else {
                        this.isErrorMoreInfo = false;
                        this.errorMoreInfoText = "";
                    }
                }
                this.loadingOkta = false;
                this.loading = false;
                this.cdr.detectChanges();
            }
        );
    }

    loginAD(event, stateId?: string) {
        if (this.loadingAD) {
            return;
        }
        if (event) {
            event.preventDefault();
        }
        this.isExpired = false;
        this.isForcePassReset = false;
        this.disabledLoginBtn = true;
        this.loading = true;
        this.loadingAD = true;
        // Request to login
        this.loginService.loginAD().subscribe(
            (resp: any) => {
                if(resp && resp.authReps && resp.authReps.warning) {
                    this.notification.notifyShow(2, resp.authReps.warning, false, 3000, true);
                }
                {
                    if (resp) {
                        this.cleanState();
                        this.isError = false;
                        this.isErrorMoreInfo = false;
                        this.disabledLoginBtn = false;
                        this.loadingAD = false;
                        this.doLogin();
                        return;
                    }
                    else {
                        this.cleanState();
                        this.isError = true;
                        this.isErrorMoreInfo = false;
                        this.disabledLoginBtn = false;
                        this.loadingAD = false;
                        this.errorTextObj = {
                            type: "login.error_network",
                            inTranslateList: true
                        };
                        this.cdr.detectChanges();
                    }
                }
            },
            (error: any) => {
                this.cleanState();
                this.isError = true;
                this.disabledLoginBtn = false;
                if (!error.statusText) {
                    this.errorTextObj = {
                        type: "login.error_network",
                        inTranslateList: true
                    };
                } else if(error instanceof HttpErrorResponse) {
                    let errDescr = error.error.error_description;

                    this.errorTextObj = this.getErrorTypeToTranslate(errDescr);

                    if (errDescr && errDescr.split('\n').length > 1) {
                        this.isErrorMoreInfo = true;
                        this.errorMoreInfoText = errDescr;
                    } else {
                        this.isErrorMoreInfo = false;
                        this.errorMoreInfoText = "";
                    }
                }
                else {
                    this.errorTextObj = {
                        type: error.body,
                        inTranslateList: false
                    };

                    this.isErrorMoreInfo = false;
                    this.errorMoreInfoText = "";
                }
                this.loadingAD = false;
                this.loading = false;
                this.cdr.detectChanges();
            }
        );
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Login method
     * @param event - event onSubmit
     * @param data - data form login form
     * @param isValid - is validity
     * @returns {boolean}
     */
    private storedCredentials = {
        value: {
            username: null,
            password: null,
            rememberme: ""
        },
        valid: false,
    }
    login(event, data, isValid, afterCodeInput = false) {
        if(event)
            event.preventDefault();
        this.storedCredentials.valid = isValid;
        this.storedCredentials.value.password = data.password;
        this.storedCredentials.value.username = data.username;
        this.loginForm.setValue(this.storedCredentials.value);

        if (!isValid) {
            return;
        }
        this.showSmsField = false;
        this.showQrCode = false;
        this.qrCodeValue = "otpauth://totp/Auth:i-mediaflex?secret=";
        this.qrCodeValueRaw = "";
        this.isExpired = false;
        this.showTAC = false;
        this.isForcePassReset = false;
        this.disabledLoginBtn = true;
        this.loading = true;
        // Request to login
        return this.loginService.login(data.username, data.password, this.code2fa, this.state2fa, this.stateTac)
            .subscribe(
                (resp: any) => {
                    this.state2fa = null;
                    this.code2fa = null;
                    if(resp && resp.authReps && resp.authReps.warning) {
                        this.notification.notifyShow(2, resp.authReps.warning, false, 3000, true);
                    }
                    if(resp && resp.authReps && (resp.authReps.expired === true || resp.authReps.expired === "true")) {
                        this.loginProvider.isLogged = false;
                        this.loginService.clear();
                        this.isExpired = true;
                        this.isForcePassReset = false;
                        this.isError = true;
                        this.disabledLoginBtn = false;
                        this.errorTextObj = {
                            type: "login.password_expired",
                            inTranslateList: true
                        };
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                    else if(resp && resp.authReps && (resp.authReps.password_reset === true || resp.authReps.password_reset === "true")) {
                        this.loginProvider.isLogged = false;
                        this.loginService.clear();
                        this.cdr.detectChanges();
                        this.isExpired = false;
                        this.isForcePassReset = true;
                        this.isError = true;
                        this.disabledLoginBtn = false;
                        this.errorTextObj = {
                            type: "login.password_reset",
                            inTranslateList: true
                        };
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                    else {
                        this.isError = false;
                        this.isErrorMoreInfo = false;
                        this.disabledLoginBtn = false;
                        this.doLogin();
                        return;
                    }
                },
                (error: HttpErrorResponse) => {
                    this.state2fa = null;
                    this.code2fa = null;
                    this.isError = true;
                    if (!error.statusText) {
                        this.disabledLoginBtn = false;
                        this.errorTextObj = {
                            type: "login.error_network",
                            inTranslateList: true
                        };
                    } else {
                        this.disabledLoginBtn = false;
                        let err = error.error;//{error,error_description}
                        if(err.error == "2fa_register") {
                            this.isError = false;
                            this.state2fa = err.error_description.split('|')[1];
                            this.qrCodeValue += err.error_description.split('|')[0];
                            this.qrCodeValueRaw = err.error_description.split('|')[0];
                            this.showQrCode = true;
                            this.showSmsField = false;
                        }
                        else if(err.error == "2fa_fail") {
                            this.isError = false;
                            this.showQrCode = true;
                            this.showSmsField = true;
                            setTimeout(()=>{
                                this.codeInput.nativeElement.focus();
                            });
                            this.message2fa = err.error_description;
                        } else if (err.error == "tc_prompt") {
                            this.isError = false;
                            this.showTAC = true;
                            this.termsAndConditionsText = err.error_description;
                        }
                        else {
                            this.disabledLoginBtn = false;
                            let errDescr = err.error_description;

                            this.errorTextObj = this.getErrorTypeToTranslate(errDescr);

                            if (errDescr && errDescr.split('\n').length > 1) {
                                this.isErrorMoreInfo = true;
                                this.errorMoreInfoText = errDescr;
                            } else {
                                this.isErrorMoreInfo = false;
                                this.errorMoreInfoText = "";
                            }
                        }
                    }
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            );
    }

    onKeyUpCode(e) {
        if(e.keyCode == 13) {
            this.login(e, this.loginForm.value, this.loginForm.valid);
        }
    }

    backCode() {
        this.showSmsField = false;
        this.isErrorMoreInfo = false;
        this.showQrCode = false;
        this.isError = false;
        this.disabledLoginBtn = false;
        this.state2fa = null;
        this.code2fa = null;
        this.qrCodeValue = "otpauth://totp/Auth:i-mediaflex?secret=";
        this.qrCodeValueRaw = "";
    }
    @ViewChild('codeInput', {static: false}) codeInput:ElementRef;

    acceptSaving() {
        this.showSmsField = true;
        setTimeout(()=>{
            this.codeInput.nativeElement.focus();
        });
    }

    getErrorTypeToTranslate(errorDescr: string) {
        let type = errorDescr //default value if errorDescr is not in list "types"
            , inTranslateList = false
            , types = {
            "OracleException": this.translate.instant('login.error_database'),
            "Incorrect Password/Login": this.translate.instant('login.error_login_password'),
            "default": this.translate.instant('login.error_unknown')
        };

        if (!errorDescr) {
            return {
                type: types['default'],
                inTranslateList: true
            };
        }

        for (let key in types) {
            if (errorDescr.indexOf(key) + 1) {
                type = types[key];
                inTranslateList = true;
            }
        }
        return {
            type: type,
            inTranslateList: inTranslateList
        };

    }

    toggleMoreInfoPopup($event) {
        let popup = $event.currentTarget.children[0];
        popup.classList.add('visible');

        let cb = function f(e) {
            popup.classList.remove('visible');
            document.removeEventListener('click', f);
        };
        $event.stopPropagation();
        document.addEventListener('click', cb);
    }

    ngOnDestroy() {
        this.capsLockProvider.destroyCapsLockListener();
    }

    // public FPForm: FormGroup = new FormGroup();
    isVisibleFPForm = false;
    toggleFPForm(val = null) {
        this.isVisibleFPForm = (val)
            ? val
            : !this.isVisibleFPForm;
    }

    disabledSendEmailBtn = false;
    loadingSendEmail = false;
    sendEmailFP(inputEl) {
        // this.router.navigateByUrl(appRouter.login_reset.verification + '?user=IVANB&token=nQ0AsmimCZaHIybwx5l3sUwB6haX');
        // return;

        if (!inputEl.value) {
            return;
        }

        const data = {
            "userid": inputEl.value
        };

        this.loadingSendEmail = true;
        this.disabledSendEmailBtn = true;

        // Error: null
        // ErrorCode: null
        // ErrorDetails: null
        // ID: 0
        // Result: true
        this.loginService.forgotPassword(data).subscribe(res => {
            this.loadingSendEmail = false;
            this.disabledSendEmailBtn = false;
            if (res && res.Result) {
                this.notification.notifyShow(1, 'login_reset.success_sent_email');
            }
        }, error => {
            this.loadingSendEmail = false;
            this.disabledSendEmailBtn = false;
            this.notification.notifyShow(2, 'login_reset.error_sent_email');
        });
    }

    private checkLoginMode(name) {
        for (var i = 0; i < this.loginMode.length; i++) {
            if (name == this.loginMode[i]) {
                return true;
            }
        }
        return false;
    }

    private cleanState() {
        this.cookieService.delete('stateId');
        this.cookieService.delete('stateId', '/');
        this.cookieService.delete('stateId', '/', '/');
    }
    private _getUserLogoUrl(id) {
        const theme = $('.common-app-wrapper').hasClass('dark') ? 'dark' : 'default'; // this.themesProvider.getCurrentTheme()
        // @ts-ignore
        this.loadingIconsService.getImageLogo(theme, id).subscribe(url => {
            this.bigLogo = url;
            this.cdr.detectChanges();
        }, error => {
            this.bigLogo = null;
            this.cdr.detectChanges();
        });
    }

    termsAccept(accepted) {
        this.showTAC = false;
        this.stateTac = accepted;
        this.login(null, this.loginForm.value, this.loginForm.valid);
    }
}
