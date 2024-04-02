/**
 * Created by Sergey Trizna on 14.02.2017.
 */
import {
    Component,
    ChangeDetectorRef,
    ViewEncapsulation,
    Input,
    ViewChild,
    Injector, ChangeDetectionStrategy
} from "@angular/core";
import {LoginService} from '../../../../services/login/login.service';
import {LoginProvider} from '../../../login/providers/login.provider';
import {Title} from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import {ErrorManagerProvider} from "../../../../modules/error/providers/error.manager.provider";
import {Router} from "@angular/router";
@Component({
    selector: 'imfx-modal-logout',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    // providers:[
    //     LoginProvider
    // ]
})

export class LogoutByTimeoutComponent {
    /**
     * Logout after (seconds)
     * @type {number}
     */
    private logoutAfter: number = 15;

    /**
     * Show modal after (seconds)
     * @type {number}
     */
    private showModalAfter: number = 10;

    private timeLeft: number = 3300; // time left counter
    private timerHandler: number = null; // handler of timer
    private nativeTabName: string = ""; // native tab name
    private sessionExpiredTabName: string = ""; // tab name when session expired
    private firstRefreshToken: string = ""; // refresh token for first time;
    data: any;

    constructor(private cdr: ChangeDetectorRef,
                private loginService: LoginService,
                private titleService: Title,
                private translate: TranslateService,
                private loginPriovider: LoginProvider,
                private injector: Injector,
                private emp: ErrorManagerProvider,
                private router: Router
    ) {
        this.data = this.injector.get('data');
        this.logoutAfter = this.data.config.options.content.logoutAfter;
        this.showModalAfter = this.data.config.options.content.showModalAfter;
        translate.get('logout_modal_module.count_down_to_logout').subscribe((res: string) => {
            this.sessionExpiredTabName = res;
            this.nativeTabName = titleService.getTitle();
            this.firstRefreshToken = this.getRefreshToken();
        });

        this.emp.onErrorThrown.subscribe(()=> {
            // console.log('error! stop timer');
            this.resetTimer();
            this.unbindResetTimerByClick()
        })

        this.emp.onErrorResolve.subscribe(()=> {
            // console.log('resolved! continue');
            this.startTimer(true);
            this.bindResetTimerByClick();
        });
    }

    ngAfterViewInit() {
        if (this.loginPriovider.isLogged) {
            this.startTimer(false);
            this.firstRefreshToken = this.loginPriovider.getRefreshToken();
        }

        this.loginPriovider.onLogin.subscribe(() => {
            this.firstRefreshToken = this.loginPriovider.getRefreshToken();
            this.startTimer(false);
            this.bindResetTimerByClick();
        });

        this.loginPriovider.onLogout.subscribe(() => {
            // Clear timeInterval
            window.clearTimeout(this.timerHandler);
        });
    }

    ngOnDestroy() {
        // Clear timeInterval
        window.clearTimeout(this.timerHandler);
    }

    /**
     * Get default options
     */
    public getDefaultOptions() {
        return {
            logoutAfter: this.logoutAfter,
            showModalAfter: this.showModalAfter,
        };
    }

    private extendsOptions = {};

    /**
     * Set default options
     * @param paramOptions
     */
    public setDefaultOptions(paramOptions) {
        this.extendsOptions = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            paramOptions // options from params
        );
    }

    /**
     * Returned current state options for plugin
     * @returns Object
     */
    public getActualOptions(paramOptions = {}) {
        let opts = Object.assign(
            {}, // blank
            this.getDefaultOptions(),// default options
            this.extendsOptions, // actually options
            paramOptions // options from params
        );

        return opts;
    }

    /**
     * Start timer
     * @param restart - restart timer
     */
    private startTimer(restart: boolean = true): void {
        if (restart) {
            this.resetTimer();
        }

        this.timeLeft = this.logoutAfter;
        this.cdr.detectChanges();
        this.timerHandler = window.setInterval(() => {
            this.triggersOfLogout();
        }, 1000);
    }

    /**
     * Reset timer
     */
    private resetTimer(): void {
        this.titleService.setTitle(this.nativeTabName);
        if (this.timerHandler) {
            window.clearTimeout(this.timerHandler);
        }
    }

    /**
     * Triggers of logout
     */
    private triggersOfLogout(): void {
        this.timeLeft--;
        // console.log('tick');
        // Show window with warning
        if (this.showModalAfter == this.timeLeft) {
            this.unbindResetTimerByClick();
            this.data.config.moduleContext.show();
        }

        if (this.showModalAfter >= this.timeLeft) {
            this.titleService.setTitle(this.timeLeft + this.sessionExpiredTabName);
        }

        if (this.timeLeft <= 0) {
            this.resetTimer();
            // this.tryLogout();
        }
    }

    /**
     * Continue session
     */
    private continueSession(): void {
        this.data.config.moduleContext.hide();
        setTimeout(() => {
            this.startTimer(true);
            this.bindResetTimerByClick();
        });

        // TODO Update refresh token
    }

    /**
     * Break session; Try logout if refresh tokens is equals
     */
    private tryLogout(): void {
        let currentToken = this.getRefreshToken();
        this.data.config.moduleContext.hide();
        if (!currentToken || currentToken == this.firstRefreshToken) {
            // this.logout();
        } else {
            this.startTimer(true);
        }
    }

    /**
     * Logout
     */
    private logout(): void {
        this.data.config.moduleContext.hide();
        this.resetTimer();
        this.loginPriovider.logout({redirectFrom: this.router.url});
    }

    /**
     * Return refresh token
     * @returns {string}
     */
    private getRefreshToken(): string {
        return this.loginService.httpService.getRefreshToken();
    }

    private bindResetTimerByClick() {
        let self = this;
        this.unbindResetTimerByClick();
        $('.timeout-wrapper').on('click', function () {
            // console.log('reseted');
            self.startTimer(true);
        });
    }

    private unbindResetTimerByClick() {
        $('.timeout-wrapper').off('click');
    }
}
