import {ChangeDetectorRef, Component, ViewEncapsulation} from "@angular/core";
import {LoginService} from "../../services/login/login.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {CapsLockProvider} from "../../providers/common/capslock.provider";
import {TranslateService} from '@ngx-translate/core';
import {NotificationService} from "../../modules/notification/services/notification.service";
import {appRouter} from "../../constants/appRouter";
import {HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";
import { LoginProvider } from '../login/providers/login.provider';

@Component({
    encapsulation: ViewEncapsulation.None,
    moduleId: 'login',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        CapsLockProvider
    ]
})

export class LoginResetPasswordComponent {
    public loginResetForm: FormGroup;

    private isError: Boolean = false;
    private isErrorMoreInfo: Boolean = false;
    private errorTextObj: {
        type: string,
        inTranslateList: boolean
    };
    private errorMoreInfoText: String;
    private disabledResetPassBtn: boolean = false;
    private capsLockNotification: boolean = false;

    // private appVersion: string;
    // private serverVersion: string;
    // private currentYear: number;

    private loading: Boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private loginService: LoginService,
        private loginProvider: LoginProvider,
        private capsLockProvider: CapsLockProvider,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private notification: NotificationService
    ) {
        this.notification.notifyHide();
    }

    ngOnInit() {
        // {
        // user: "IVANB",
        // token: "vnjtzxS6-7HFsCDCI6qDdoiZj7SU"
        // }

        const queryParams = (this.route.queryParams as BehaviorSubject<Params>).getValue();

        if(this.loginProvider.isLogged || !queryParams.user || !queryParams.token) {
            this.router.navigateByUrl(appRouter.login);
        }


        this.loginResetForm = this.formBuilder.group({
            'username': [queryParams && queryParams.user || '', Validators.required],
            'newPassword': ['', Validators.required],
            'confirmPassword': ['', Validators.required],
            // rememberme: ['']
        });
    }

    ngAfterViewInit() {
        this.disabledResetPassBtn = !!(this.loginResetForm.value.username && this.loginResetForm.value.password);
            this.capsLockProvider.initCapsLockListener();
            this.capsLockProvider.onCapsLockEnable.subscribe((data) => {
                this.capsLockNotification = data.state;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.capsLockProvider.destroyCapsLockListener();
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    isPasswordsMatch = null;
    compareMatch(formData): boolean {
        if (formData.newPassword !== formData.confirmPassword
        ) {
            this.isPasswordsMatch = false;
            return false;
        }
        this.isPasswordsMatch = true;
        return true;
    }

    toggleMatchError(show: boolean) {
        if(show) {
            this.isError = true;
            this.errorTextObj = {
                type: 'login.error_password_not_match',
                inTranslateList: true
            };
        } else {
            this.isError = false;
            this.errorTextObj = null;
        }

    }

    resetAndLogin($event, formData, isValid) {
        $event.preventDefault();
        if (!isValid) {
            return;
        }

        this.compareMatch(formData);
        if (!this.isPasswordsMatch) {
            this.toggleMatchError(true);
            return;
        } else {
            this.toggleMatchError(false);
        }

        // {
        // user: string,
        // token: string
        // }
        const queryParams = (this.route.queryParams as BehaviorSubject<Params>).getValue();

        const data = {
            "userid": queryParams.user,
            "password": formData.newPassword
        };

        this.disabledResetPassBtn = true;
        this.loading = true;

        this.loginService.validatePassword(data).subscribe(res => {

            if (!res || !res.Result) {
                this.disabledResetPassBtn = false;
                this.loading = false;
                this.notification.notifyShow(2, 'login_reset.incorrect_pass');
                return;
            }

            const data = {
                "userid": queryParams.user,
                "token": queryParams.token,
                "password": formData.newPassword
            };

            this.loginService.changeForgottenPassword(data)
                .subscribe(
                    (resp: any) => {

                        // Error: null
                        // ErrorCode: null
                        // ErrorDetails: null
                        // ID: 0
                        // Result: true

                        this.isError = false;
                        this.isErrorMoreInfo = false;
                        this.notification.notifyShow(1, 'login_reset.success_pass_reset');
                        this.gotoLogin();
                        return;
                    },
                    (error: HttpErrorResponse) => {

                        // error.error

                        //Error: "Invalid request"
                        // ErrorCode: null
                        // ErrorDetails: "ApplicationException:
                        // ↵  Invalid request
                        // ↵"
                        // ID: 0
                        // Result: false


                        this.isError = true;
                        if (!error.statusText) {
                            this.errorTextObj = {
                                type: "login.error_network",
                                inTranslateList: true
                            };
                        } else {
                            let err = error.error;//{error,error_description}

                            let errDescr = err.ErrorDetails;

                            this.errorTextObj = this.getErrorTypeToTranslate(errDescr);

                            if (errDescr && errDescr.split('\n').length > 1) {
                                this.isErrorMoreInfo = true;
                                this.errorMoreInfoText = errDescr;
                            } else {
                                this.isErrorMoreInfo = false;
                                this.errorMoreInfoText = "";
                            }

                        }
                        this.disabledResetPassBtn = false;
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                );
        }, error => {
            this.disabledResetPassBtn = false;
            this.loading = false;
            this.notification.notifyShow(2, 'login_reset.incorrect_pass');
        });
    }

    gotoLogin() {
        setTimeout(() => {
            this.router.navigateByUrl(appRouter.login);
        }, 3000);
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

    isActiveElem(input) {
        return document.activeElement == input
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
}
