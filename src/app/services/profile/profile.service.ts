/**
 * Created by initr on 26.10.2016.
 */
import {ChangeDetectorRef, EventEmitter, Injectable} from "@angular/core";
import {HttpService} from "../http/http.service";
import {SecurityService, systemModes} from "../security/security.service";
import {forkJoin, Observable, ReplaySubject, Subscription} from 'rxjs';
import {ServerStorageService} from "../storage/server.storage.service";
import {ConfigService} from "../config/config.service";
import {appRouter, appRouterAliases} from "../../constants/appRouter";
import {map} from 'rxjs/operators';
import {LocalStorageService, SessionStorageService} from "ngx-webstorage";
import {Select2ItemType, Select2ListTypes} from "../../modules/controls/select2/types";
import {ListOfPermissionTypes, PermissionService, PermissionType} from "../permission/permission.service";
import {TranslateService} from "@ngx-translate/core";
import {SettingsGroupsService} from "../system.config/settings.groups.service";
import {JsonProvider} from '../../providers/common/json.provider';
import { HttpResponse } from '@angular/common/http';
export type ProfileUserData = {[key:string]:any} & {UserID: string};
import { LoadingIconsService } from "../../views/system/config/comps/global.settings/comps/loading-icons/providers/loading-icons.service";

/**
 * Profile service
 */
@Injectable()
export class ProfileService {
    storagePrefix = 'base.profile.data';
    colorSchemaChanged: EventEmitter<any> = new EventEmitter<any>();
    defaultPageChanged: EventEmitter<any> = new EventEmitter<any>();
    personalData: any;
    defaultPagePlain: string;
    defaultPage: EventEmitter<string> = new EventEmitter();
    userData: {[key:string]:any} & {UserID: string}; //
    public onGetUserData: ReplaySubject<ProfileUserData> = new ReplaySubject<ProfileUserData>();
    /**
     * Returned info about user
     */
    private _groupDefaultPage: string;


    constructor(public httpService: HttpService,
                private cdr: ChangeDetectorRef,
                public localStorage: LocalStorageService,
                private securityService: SecurityService,
                private storageService: ServerStorageService,
                private settingsGroupsService: SettingsGroupsService,
                private sessionStorage: SessionStorageService,
                private jsonProvider: JsonProvider,
                private translate: TranslateService,
                private loadingIconsService: LoadingIconsService) {
    }

    // public getGroupDefaultPage(): Select2ItemType | null {
    //     let answ = null;
    //     if (Object.keys(this.getAllowedIndexedPages()).length && this._groupDefaultPage) {
    //         answ = this.getAllowedIndexedPages()[this._groupDefaultPage]||this.getAllowedIndexedPages()['base.' + this._groupDefaultPage];
    //     }
    //
    //     return answ;
    // }

    public retrieveDefaultPage() {
        const groupDefPageObs = this.getDefaultPageForGroup();
        const personalDefPageObs = this.storageService.retrieve(['default_page'], false, 0, 'local');
        const defPage = ConfigService.getSetupsForRoutes().main;
        forkJoin(groupDefPageObs, personalDefPageObs).subscribe((res: any[]) => {
            this._groupDefaultPage = res[0] && res[0].DefaultHomePage ? res[0].DefaultHomePage : res[0] ? res[0] : null;
            const value = res[1] && res[1][0].Value;
            const personPageResp = this.jsonProvider.isValidJSON(value)
                ? JSON.parse(value)
                : value || null;

            const personPage = this.defaultPageToPlain(personPageResp);
            if (personPage) {
                if (personPage === 'default_page') {
                    if(this._groupDefaultPage && typeof this._groupDefaultPage === 'string'){
                        this.setDefaultPage(this._groupDefaultPage);
                    } else {
                        this.setDefaultPage(defPage);
                    }
                } else {
                    this.setDefaultPage(personPage);
                }
            } else if (this._groupDefaultPage && typeof this._groupDefaultPage === 'string') {
                this.setDefaultPage(this._groupDefaultPage);
            } else {
                this.setDefaultPage(defPage);
            }
        });
    }

    public colorSchemaChange(schema) {
        this.colorSchemaChanged.next(schema);
    }

    public defaultPageChange(page) {
        // this.setDefaultPage(page); // if do set, app will navigate to this page after changing defaults in the profile page
        this.storageService.store('default_page', page, 'local').subscribe(() => {
            this.defaultPageChanged.next(page);
        });
    }

    public SetPersonal(data) {
        this.personalData = data;
        this.cdr.detectChanges();
    }

    public GetPersonal(): Observable<HttpResponse<any>> {
        return new Observable((observer: any) => {
            if (!this.personalData) {
                this.storageService.retrieve(["personal_settings"], false).subscribe((res: any) => {
                    if (res[0] && res[0].Value && res[0].Value.length > 0) {
                        this.personalData = JSON.parse(res[0].Value || null);
                    }
                    observer.next(this.personalData);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
            } else {
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(this.personalData);
                observer.complete();
                // });
            }
        });
    }

    getUserProfile(): Observable<HttpResponse<any>> {
        // let data = this.storage.retrieve(this.storagePrefix);
        const permissions = this.localStorage.retrieve('permissions');
        return new Observable((observer: any) => {
            if (!permissions) {
                return this.httpService
                    .get(
                        '/api/userprofile/0'
                    )
                    .pipe(map((resp: any) => resp.body))
                    .subscribe(
                        (permissions: any) => {
                            if (!permissions.Permissions) {
                                permissions.Permissions = [];
                            }
                            this.loadingIconsService.selectGroup({ID: permissions.Branding, NAME: null});
                            this.loadingIconsService.setAssetsGroupIdProfile(permissions.Branding);
                            this.localStorage.store('permissions', permissions);
                            // this.storage.store(this.storagePrefix, data);
                            this.securityService.setPermissions(permissions.Permissions, permissions.Mode);

                            if (permissions.Mode == systemModes.ConfigOnly) {
                                this.storageService.store('default_page', appRouter.system.config, 'local').subscribe(() => {
                                    this.defaultPageChanged.next(appRouter.system.config);
                                    if (!this.personalData) {
                                        this.storageService.retrieve(["personal_settings"], false).subscribe((res: any) => {
                                            if (res[0].Value.length > 0) {
                                                this.personalData = JSON.parse(res[0].Value || null);
                                            }
                                            observer.next(permissions);
                                        }, (err) => {
                                            observer.error(err);
                                        }, () => {
                                            observer.complete();
                                        });
                                    } else {
                                        //toDo support async init
                                        //to make observable asynchronous
                                        // Promise.resolve()
                                        //     .then(() => {
                                        observer.next(permissions);
                                        observer.complete();
                                        // });
                                    }
                                }, (err) => {
                                    observer.error(err);
                                });
                            } else {
                                if (!this.personalData) {
                                    this.storageService.retrieve(["personal_settings"], false).subscribe((res: any) => {
                                        const personalSettings = res && res[0].Value ? JSON.parse(res[0].Value || null) : null;
                                        if (personalSettings) {
                                            this.personalData = personalSettings;
                                        }
                                        observer.next(permissions);
                                    }, (err) => {
                                        observer.error(err);
                                    }, () => {
                                        observer.complete();
                                    });
                                } else {
                                    //toDo support async init
                                    //to make observable asynchronous
                                    // Promise.resolve()
                                    //     .then(() => {
                                    observer.next(permissions);
                                    observer.complete();
                                    // });
                                }
                            }
                        },
                        (err) => {
                            observer.error(err);
                        });
            } else {
                this.securityService.setPermissions(permissions.Permissions, permissions.Mode);
                this.loadingIconsService.selectGroup({ID: permissions.Branding, NAME: null});
                this.loadingIconsService.setAssetsGroupIdProfile(permissions.Branding);
                //toDo support async init
                //to make observable asynchronous
                // Promise.resolve()
                //     .then(() => {
                observer.next(permissions);
                observer.complete();
                // });
            }
        });
    }

    public changePassword(password: any): Observable<Subscription> {
        return new Observable((observer: any) => {
                this.httpService
                    .put(
                        '/api/v3/config/user/password',
                        JSON.stringify(password),//JSON.stringify(password),//"\"" + password + "\"",
                        {withCredentials: true}
                    ).pipe(
                    map((res: any) => {
                        return res.body;
                    })).subscribe(
                    (rest) => {
                        observer.next(rest);
                    },
                    (error) => {
                        observer.error(error);
                    }, () => {
                        observer.complete();
                    }
                );
            }
        );
    }

    public getAllowedPages(withDefault: boolean = false): Select2ListTypes {
        const _allowedPages: string[] = this.prepareAllowedPages();
        const allowedPages: Select2ListTypes = [];
        _allowedPages.forEach((translateRef: string) => {
            if (appRouterAliases[translateRef] && this.securityService.hasPermissionByPath(translateRef)) {
                const item: Select2ItemType = {
                    id: translateRef,
                    text: this.translate.instant(appRouterAliases[translateRef])
                };
                allowedPages.push(item);
            }
        });

        if (withDefault) {
            allowedPages.unshift({id: 'default_page', text: 'Settings Group Default'});
        }

        allowedPages.sort(function(a: Select2ItemType, b: Select2ItemType){
            if(a.text < b.text) { return -1; }
            if(a.text > b.text) { return 1; }
            return 0;
        });

        return allowedPages;
    }

    public getAllowedIndexedPages(): { [key: string]: Select2ItemType }[] {
        const _allowedPages = this.prepareAllowedPages();
        const allowedPages = [];
        $.each(_allowedPages, (hRef: string, translateRef: string) => {
            if (appRouterAliases[translateRef]) {
                allowedPages[appRouterAliases[translateRef]] = <Select2ItemType>{
                    id: translateRef,
                    text: this.translate.instant(appRouterAliases[translateRef])
                }
            }
        });

        return allowedPages;
    }

    public clearPersonalData() {
        this.personalData = null;
        const cleanOnLogout = [
            'production.detail.saved.state'
        ];
        for (let i = 0; i < cleanOnLogout.length; i++) {
            this.localStorage.clear(cleanOnLogout[i]);
        }
    }

    getDefaultPageForGroup(): Observable<any> {
        return new Observable((obs) => {
            const d = this.sessionStorage.retrieve(this.storagePrefix + "." + "defaultHomePage");
            if (d) {
                obs.next(d);
                obs.complete();
            } else {
                this.settingsGroupsService.getSettingsUserById('defaultHomePage').subscribe((res: any) => {
                    if (res && res.length > 0) {
                        if (res[0].DATA != null) {
                            const d = JSON.parse(res[0].DATA);
                            this.sessionStorage.store(this.storagePrefix + "." + "defaultHomePage", d);
                            obs.next(d);
                            obs.complete();
                        }
                    } else {
                        obs.next(appRouter.branding);
                        obs.complete();
                    }
                });

            }
        });
    }

    getUserConfig() {
        const currentUserKey = 'current.user.config';
        return new Observable((observer) => {
            const data = this.sessionStorage.retrieve(currentUserKey);
            if (!data) {
                this.httpService.get('/api/settings/user').subscribe((user) => {
                    this.sessionStorage.store(currentUserKey, user.body)
                    observer.next(user.body);
                    observer.complete();
                })
            } else {
                observer.next(data);
                observer.complete();
            }
        });
    }

    private defaultPageToPlain(resp) {
        let dPage;
        if (resp) {
            dPage = resp.replace(/["']/g, "");
        }

        return dPage;
    }

    private prepareAllowedPages(): string[] {
        const allowedPages = [];
        const allPages: ListOfPermissionTypes = PermissionService.getPermissionsMap();

        const addedKeys = [];
        $.each(allPages, (k, pt: PermissionType) => {
            if (pt.paths && pt.paths.length > 0) {
                $.each(pt.paths, (k, name: string) => {
                    if (
                        name != "" &&
                        name.indexOf(':') === -1 &&
                        name.indexOf('demo') === -1 &&
                        name.indexOf('no-access') === -1
                    ) {
                        const foundKey = addedKeys.filter((val) => {
                            return val === name
                        });
                        if (foundKey.length === 0) {
                            allowedPages.push(name);
                            addedKeys.push(name)
                        }

                    }
                });

            }
        });

        return allowedPages;
    }

    private setDefaultPage(p: string) {
        if (p && p.toLowerCase) {
            p = p.toLowerCase();
            if (p === 'search') {
                p = appRouter.branding
            }
            this.defaultPagePlain = p;
            console.log('default page:', this.defaultPagePlain);
            this.defaultPage.emit(this.defaultPagePlain);
        }
    }
}

