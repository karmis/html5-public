/**
 * Created by initr on 18.10.2016.
 */
import { EventEmitter, Injectable, Injector } from '@angular/core';
import {HttpService} from '../http/http.service';
import {ProfileService} from '../profile/profile.service';
import {Observable, Subscription} from 'rxjs';
import {LocalStorageService, SessionStorageService} from "ngx-webstorage";
import {ConfigService} from '../config/config.service';
import {ServerStorageService} from "../storage/server.storage.service";
import {map} from 'rxjs/operators';
import {ServerGroupStorageService} from '../storage/server.group.storage.service';
import {ErrorManagerProvider} from '../../modules/error/providers/error.manager.provider';
import {ThemesProvider} from "../../providers/design/themes.providers";
import {CookieService} from "ng2-cookies";
import {appRouter} from "../../constants/appRouter";
import {LookupService} from '../lookup/lookup.service';
import { HttpResponse } from '@angular/common/http';
import { PREFERENCES } from "../../views/system/config/comps/settings.groups/comps/details/preferences.const";

declare var window: any;

/**
 * Service for authorization control of user
 */
@Injectable()
export class LoginService {
    // Flag of logged
    private loggedIn = false;
    private targetPath: string;
    private defaultPage: string;
    public userLogin: EventEmitter<any> = new EventEmitter<any>();

    constructor(public httpService: HttpService,
                public profileService: ProfileService,
                public injector: Injector,
                public localStorage: LocalStorageService,
                public sessionStorage: SessionStorageService,
                private serverGroupStorage: ServerGroupStorageService,
                public storageService: ServerStorageService,
                public cookieService: CookieService,
                public lookupService: LookupService,
                public themesProvider: ThemesProvider,
                public emp: ErrorManagerProvider) {
        this.profileService.defaultPage.subscribe((page) => {
            this.defaultPage = page;
        });
        // this.defaultPageSubscription = this.profileService.defaultPage.subscribe((page)=>{
        //   this.targetPath = page;
        //   this.defaultPageSubscription.unsubscribe();
        // })
    }

    /**
     * Login auth
     *
     * @param username
     * @param password
     * @param code2fa
     * @param state2fa
     * @param tacAccept
     * @param code2fa
     * @param state2fa
     * @param tacAccept
     * @param code2fa
     * @param state2fa
     * @param tacAccept
     * @returns {Observable<HttpResponse<any>>}
     */
    login(username, password, code2fa = null, state2fa = null, tacAccept = null): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .auth(
                        '/token',
                        username,
                        encodeURIComponent(password),
                        {},
                        {state: state2fa, code: code2fa},
                        tacAccept
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            if(authResp && (authResp.password_reset === true || authResp.password_reset === "true")) {
                                observer.next({
                                    authReps: authResp
                                });
                            }
                            else
                                this.processAuthResp(authResp, observer);
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    changePassword(data): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .put(
                        '/api/v3/config/user/change-expired-password',
                        JSON.stringify(data),
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    // {
    //     "userid":"jamess"
    // }
    forgotPassword(data): Observable<any> {
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/v3/config/user/forgotpassword',
                        JSON.stringify(data),
                        // {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    // {
    //     "userid":"jamess",
    //     "token": "Rj4Ebn36LEFGAKleD7F7NotNMjmF",
    //     "password": "1.png"
    // }
    changeForgottenPassword(data): Observable<any> {
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/v3/config/user/userpasswordreset',
                        JSON.stringify(data),
                        // {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }


    // {
    //     "userid":"jamess",
    //     "password":"mp"
    // }
    validatePassword(data): Observable<any> {
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/v3/config/user/validatepassword',
                        JSON.stringify(data),
                        // {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            observer.next(authResp);
                            observer.complete();
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    preloginData() {
        let self = this;
        return new Observable((observer: any) => {
                this.httpService
                    .get(
                        '/api/appinfo',
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (rest) => {
                            this.sessionStorage.store('appinfo', rest);
                            self.httpService.setAuthMode(rest.authMode.indexOf("ActiveDirectory") > -1 ? "ActiveDirectory" : "Other");
                            observer.next(rest);
                        },
                        (error) => {
                            observer.error(error);
                        },
                        () => {
                            observer.complete();
                        }
                    );
            }
        );
    }

    loginOkta(stateId?: string, targetPath: string = null): Observable<Subscription> {
        const targetUrl = location.origin + location.pathname + "#/" + (targetPath ? targetPath : "");
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/v3/token/saml',
                        "\"" + targetUrl + "\"",
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            if (stateId && stateId.length > 0 || authResp.access_token && authResp.token_type) {
                                this.processAuthResp(authResp, observer);
                            } else if (authResp && authResp.redirect_url) {
                                //toDo support async init
                                //to make observable asynchronous
                                // Promise.resolve()
                                //     .then(() => {
                                observer.next(authResp);
                                observer.complete();
                                // });
                            }
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    loginAD(): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .get(
                        '/api/v3/token/ad',
                        {withCredentials: true}
                    )
                    .pipe(map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        (authResp) => {
                            this.processAuthResp(authResp, observer);
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    sendYouTubeResponse(res): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/v3/youtube/token',
                        JSON.stringify(res),
                        {withCredentials: true}
                    ).pipe(
                    map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        () => {
                            //this.processAuthResp(authResp, observer);
                            observer.complete(); // commment this if 'processAuthResp' will be uncommented
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }

    sendYouTubeResponse2(res): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .post(
                        '/api/v3/youtube/token',
                        JSON.stringify(res),
                        {withCredentials: true}
                    ).pipe(
                    map((res: any) => {
                        return res.body;
                    }))
                    .subscribe(
                        () => {
                            //this.processAuthResp(authResp, observer);
                            observer.complete(); // commment this if 'processAuthResp' will be uncommented
                        },
                        (error) => {
                            observer.error(error);
                        }
                    );
            }
        );
    }


    processAuthResp(authResp, observer) {
        this.setAuthData(authResp);
        this.httpService.setAccessToken(authResp.access_token);
        this.httpService.setRefreshToken(authResp.refresh_token);

        /**
         * use 'local' and 'global' arrays both with same keys to extract values via serverGroupStorageService.retrieve
         * Example: this.serverGroupStorageService.retrieve({global:['keyEx'], local:['keyEx']});
         */
        const obsGroups = this.serverGroupStorage.retrieve({
            local: [
                'defaultSearchColumnsMedia',
                'defaultSearchColumnsVersion',
                'defaultSearchColumnsSimple',
                'defaultSearchColumnsTitle',
                'defaultSearchMisrDetailsMediaColumns',
                'versionCreationSettings',
                'associate.advanced_search.version.setups',
                'associate.advanced_search.media.setups',
                'associate.wfrise.setups',
                PREFERENCES.allOrdersSearchCriteria,
                PREFERENCES.delHistorySearchCriteria,
                'supplier_portal.version_complete.setups',
                'logoImage',
                'uploadSettings',
                'helpdeskUrl',
                'customLabels',
                'googleMapsApiSettings'
            ],
            global: [
                'isDebugMode',
                'htmlplayerhotkeys',
                'versionCreationSettings',
                'associate.advanced_search.version.setups',
                'associate.advanced_search.media.setups',
                'associate.wfrise.setups',
                PREFERENCES.allOrdersSearchCriteria,
                PREFERENCES.delHistorySearchCriteria,
                'helpdeskUrl',
                'customLabels'
            ]
        }, true);

        const obsSettings = this.storageService.retrieve([
            "personal_settings",
            "basket",
            "default_page",
            "color_schema",
            "media.basket.data",
            "defaultSearch",
            PREFERENCES.workflowQueuesActions,
            PREFERENCES.workflowQueuesSettings,
        ], true);


        obsGroups.subscribe((res: any) => {
            if (res && res.global && res.global.isDebugMode) {
                this.emp.isEnabled = JSON.parse(res.global.isDebugMode);
            } else {
                this.emp.isEnabled = false;
            }

            obsSettings.subscribe((res: any) => {
                this.themesProvider.theme_class = res && res[3] && res[3].Value && res[3].Value.length > 0 ? res[3].Value.replace(/"/g, "") : "default";
                // user profile is contains access rules
                // therefore better to load it at once after login
                this.localStorage.clear('permissions');
                this.profileService.getUserProfile().subscribe(
                    (profileResp) => { // data cached in service
                        if (!(authResp.expired === "true" || authResp.expired === true)) {
                            this.loggedIn = true;
                            this.httpService.authSuccess.emit();
                        }

                        observer.next({
                            authReps: authResp,
                            profileResp: profileResp,
                            targetRoute: ''
                        });
                    }, (error) => {
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    });
            });

        });
    }

    entrySessionStorage() {
        console.log('entrySessionStorage');
        //must be available after launch the app
        this.lookupService.getLookups('MediaStatus', '/api/lookups/')
            .subscribe(() => {});
        this.lookupService.getLookups('PgmStatus', '/api/lookups/')
            .subscribe(() => {});
        this.lookupService.getLookups('CustomMediaStatusTypes', '/api/lookup/')
            .subscribe(() => {});
        this.lookupService.getLookups('CustomVersionStatusTypes', '/api/lookup/')
            .subscribe(() => {});
        this.lookupService.getLookups('CustomTitleStatusTypes', '/api/lookup/')
            .subscribe(() => {});
    }

    /**
     * Return data about auth
     * @returns {any|{}}
     */
    getAuthData(): Object {
        // let jsstr = this.localStorage.retrieve('auth_data');
        // if (jsstr) {
        //     return JSON.parse(jsstr);
        // } else {
        //     return {};
        // }
        return this.localStorage.retrieve('auth_data') || {};

    }


    setAuthData(authResp) {
        this.localStorage.store('auth_data', authResp);
        // this.sessionStorage.store(this.storagePrefix, authResp);
    }

    /**
     * Clear all data from current session
     */
    clear(): void {
        // Delete all
        // Cookies.remove('auth_data');
        // Cookies.remove('permissions');
        this.localStorage.clear('auth_data');
        this.localStorage.clear('permissions');
        this.localStorage.clear('logo.images');
        this.cookieService.delete('stateId');
        this.httpService.deleteAllTokens();

        // Clear all timeouts/timeintervals
        let lastTimeHandler = window.setTimeout(function () {
        }, 0);
        while (lastTimeHandler--) {
            // will do nothing if no timeout with id is present
            window.clearTimeout(lastTimeHandler);
        }

        this.sessionStorage.clear();
        this.localStorage.clear('default_page');
        this.loggedIn = false;
    }

    /**
     * Get authorization status
     * @returns {boolean}
     */
    isLoggedIn(): boolean {
        let res = false;
        if (this.httpService.getAccessToken()) {
            res = true;
        } else {
            // console.error('!!! Access token from cookie is empty !!!');
            // debugger
        }
        this.loggedIn = res;
        return res;
    }

    /**
     * Store target route for redirect to it after login if this  route is not reserved;
     * Else set main page as targetPath
     * @param path
     */
    setTargetPath(path: string): void {
        let routes = ConfigService.getSetupsForRoutes();
        if (path) {
            let reservedPages = [];
            reservedPages.push(routes.login); // login
            reservedPages.push(routes.logout); // logout
            reservedPages.push(routes.noAccess); // noAccess
            if (reservedPages.indexOf(path) === -1) {
                this.targetPath = path;
            }
        }
    }

    /**
     * Return target path
     * @returns {string}
     */
    getTargetPath(defaultPage?): string {
        if (defaultPage) {
            this.defaultPage = defaultPage;
        }
        return this.targetPath && this.targetPath != '' ? this.targetPath : this.getDefaultPage();
    }

    getDefaultPage(): string {
        return this.defaultPage && this.defaultPage != '' ? this.defaultPage : appRouter.branding;
    }

    clearTargetPath() {
        this.targetPath = '';
    }

    logout(): void {
        if(this.loggedIn) {
            this.httpService
                .post(
                    '/api/logout',
                    JSON.stringify({}),
                    {withCredentials: true}
                )
                .pipe(map((res: any) => {
                    return res.body;
                }))
                .subscribe();
        }
    }
}
