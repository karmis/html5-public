/*
 * Angular 2 decorators and services
 */
import {ChangeDetectorRef, EventEmitter, Inject} from '@angular/core';
import {LoginService} from '../../../services/login/login.service';
import {SessionStorageService} from "ngx-webstorage";
import {ConfigService} from '../../../services/config/config.service';
import {ActivatedRoute} from "@angular/router";

export class LoginProvider {
    public isLogged = false;
    public isRedirecting = false;
    public onLogin: EventEmitter<any> = new EventEmitter<any>();
    public onLogout: EventEmitter<any> = new EventEmitter<any>();
    public onAccessDenied: EventEmitter<any> = new EventEmitter<any>();
    public showSidebarMenu = false;
    public serverVersion;

    constructor(@Inject(LoginService) public loginService: LoginService,
                @Inject(ChangeDetectorRef) protected cdr: ChangeDetectorRef,
                @Inject(SessionStorageService) protected storageService: SessionStorageService,
                @Inject(ActivatedRoute) private route: ActivatedRoute) {
        // On 401 in any request mark the status application as not logged
        this.loginService.httpService.authFailed.subscribe(
            (res: any) => {
                this.logout(res);
            }
        );

        // On 200 in auth request mark the status application as is logged
        this.loginService.httpService.authSuccess.subscribe(
            (res: any) => {
                this.onLogin.emit(res);
            }
        );

        this.loginService.httpService.noPermissions.subscribe(
            (res: any) => {
                this.onAccessDenied.emit(res);
            }
        );

        this.isLogged = this.loginService.isLoggedIn();
    }

    ngOnInit() {
        // get status of logged
        this.isLogged = this.loginService.isLoggedIn();
    }

    /**
     * Logout from application
     */
    logout(res = {}, isAuto: boolean = false): void {
        // if (!/login/.test(this.route.snapshot.url.join("/"))) {
        //   // setTimeout(()=>{
        //   //   window.location.reload()
        //   // })
        this.loginService.logout();
        // }
        this.isLogged = false;
        // Clear all data form current session
        this.loginService.clear();

        if (isAuto) {
            //this.onLogout.emit($.extend(true, {redirectTo: ConfigService.getSetupsForRoutes().loginauto}, res));
        } else {
            this.onLogout.emit($.extend(true, {redirectTo: ConfigService.getSetupsForRoutes().login}, res));
            // this.onLogout.complete();
        }
        this.loginService.profileService.clearPersonalData();

        // setTimeout(()=>{
        //   window.location.reload()
        // })

    }

    /**
     * On success login
     */
    login(res): void {
        this.onLogin.emit(res);
    }

    /**
     * Return access token
     */
    getAccessToken(): string {
        return this.loginService.httpService.getAccessToken();
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string {
        return this.loginService.httpService.getRefreshToken();
    }
}
