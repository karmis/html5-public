import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentRef,
    EventEmitter,
    HostListener,
    Injector,
    NgZone,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import * as $ from 'jquery';
import { LoginProvider } from '../login/providers/login.provider';
import { ThemesProvider } from '../../providers/design/themes.providers';
import { SplashProvider } from '../../providers/design/splash.provider';
import { TopMenuProvider } from '../../providers/design/topmenu.provider';
import { ConfigService } from '../../services/config/config.service';
import { ProfileService } from '../../services/profile/profile.service';

import { SettingsGroupsService } from '../../services/system.config/settings.groups.service';
import 'style-loader!bootstrap/dist/css/bootstrap.min.css';
import 'style-loader!font-awesome/css/font-awesome.css';
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { LoginService } from '../../services/login/login.service';

import { Icons } from '../../services/system.config/icons';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { ModalPreviewPlayerProvider } from '../../modules/modal.preview.player/providers/modal.preview.player.provider';
import { appRouter } from '../../constants/appRouter';
import { BaseProvider } from './providers/base.provider';
import { BaseUploadMenuComponent } from "./components/base.upload/base.upload.component";
import { UploadProvider } from "../../modules/upload/providers/upload.provider";
import { SecurityService, systemModes } from "../../services/security/security.service";
import { ErrorManagerProvider } from '../../modules/error/providers/error.manager.provider';
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ng2-cookies';
import { ServerGroupStorageService } from '../../services/storage/server.group.storage.service';
import { takeUntil } from "rxjs/internal/operators";
import { Subject } from 'rxjs';
import { IMFXModalComponent } from '../../modules/imfx-modal/imfx-modal';
import { AboutInfoModalComponent } from '../../modules/about.info.modal/about.info.modal.component';
import { NotificationService } from '../../modules/notification/services/notification.service';
import { JsonProvider } from '../../providers/common/json.provider';
import { lazyModules } from "../../app.routes";
import { LoadingIconsService } from "../system/config/comps/global.settings/comps/loading-icons/providers/loading-icons.service";
import { HttpClient } from "@angular/common/http";
import {StorageAutoCleanerProvider} from "../../providers/common/storage.auto.cleaner.provider";

/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [
        './styles/theme.scss',
        // './styles/splash.scss',
        './styles/index.scss',
        '../../../assets/icons/font-icons/icons.css',
    ],
    templateUrl: './tpl/index.html',
    // in the future just import them if dont want create new instance of them
    providers: [
        // {provide: LoginProvider, useClass: LoginProvider},
        {provide: SplashProvider, useClass: SplashProvider},
        {provide: TopMenuProvider, useClass: TopMenuProvider},
        {provide: SettingsGroupsService, useClass: SettingsGroupsService},
        BaseProvider,
        CookieService,
        RaiseWorkflowWizzardProvider,
        ServerGroupStorageService
    ]
})

export class BaseComponent {
    public uploadProvider: UploadProvider;
    public serverVersion;
    protected appVersion: string;
    // @ViewChild('loaderEl', {static: false}) private loaderElRef: ElementRef;
    @ViewChild('successModal', {static: false}) private successModalRef: ViewContainerRef;
    @ViewChild('errorModal', {static: false}) private errorModalRef: ViewContainerRef;
    @ViewChild('confirmModal', {static: false}) private confirmModalRef: ViewContainerRef;
    @ViewChild('promptModal', {static: false}) private promptModalRef: ViewContainerRef;
    @ViewChild('warningModal', {static: false}) private warningModalRef: ViewContainerRef;
    @ViewChild('modalPreviewPlayer', {static: false}) private modalPreviewPlayer: ViewContainerRef;
    @ViewChild('baseUploadMenu', {static: false}) private baseUploadMenuRef: BaseUploadMenuComponent;
    // @ViewChild('exportModal', {static: false}) private exportModal: IMFXModalComponent;
    @ViewChild('overlay', {static: false}) private overlay;
    private mainLogo;
    isBigLogo = false;
    errorLogo = false;
    // Login settings
    private loginSettings: {
        isLogged: boolean,
        onLogin?: EventEmitter<any>,
        onAccessDenied?: EventEmitter<any>,
        onLogout?: EventEmitter<any>
    } = {
        isLogged: false,
    };
    private routerEventsSubscr;
    // Splash settings
    private splashSettings: {
        enabled: boolean,
        // loaderElRef: ElementRef,
        changed?: EventEmitter<any>,
    } = {
        enabled: true,
        // loaderElRef: this.loaderElRef
    };
    // Top menu settings
    private topMenuSettings: {
        showSidebarMenu: boolean
    } = {
        showSidebarMenu: false
    };
    private destroyed$: Subject<any> = new Subject();

    constructor(private loginProvider: LoginProvider,
                private loginService: LoginService,
                private themesProvider: ThemesProvider,
                private jsonProvider: JsonProvider,
                private splashProvider: SplashProvider,
                private topMenuProvider: TopMenuProvider,
                private securityService: SecurityService,
                private profileService: ProfileService,
                private localStorage: LocalStorageService,
                private sessionStorage: SessionStorageService,
                private injector: Injector,
                private rwwizardprovider: RaiseWorkflowWizzardProvider,
                private modalPreviewPlayerProvider: ModalPreviewPlayerProvider,
                private cdr: ChangeDetectorRef,
                private router: Router,
                private zone: NgZone,
                protected sgs: SettingsGroupsService,
                private baseProvider: BaseProvider,
                private emp: ErrorManagerProvider,
                private modalProvider: IMFXModalProvider,
                private translate: TranslateService,
                private cookieService: CookieService,
                private notificationService: NotificationService,
                private serverGroupStorage: ServerGroupStorageService,
                private loadingIconsService: LoadingIconsService,
                private scp: StorageAutoCleanerProvider,
                private httpClient: HttpClient) {
        // check for alive
        const isAlive = this.cookieService.get('detect_reload');
        this.refreshStorages();
        if (!this.loginProvider.isLogged || this.getCountTabs() <= 0) {
            if (!isAlive || isAlive !== 'alive') {
                this.setCountTabs(0);
                this.loginProvider.logout();
            } else if (this.getCountTabs() < 0) {
                this.setCountTabs(0);
            }
        }

        this.routerEventsSubscr = this.router.events.pipe(takeUntil(this.destroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart && event.url === '/') {
                return this.router.navigate([this.loginService.getDefaultPage()]);
            }
        });

        this.uploadProvider = this.injector.get(UploadProvider);
        if (this.loginProvider.loginService.isLoggedIn() === true) {
            this.profileService.retrieveDefaultPage();
        }

        // Login settings
        this.loginSettings = Object.assign({}, this.loginSettings, loginProvider);
        // On logout
        this.loginSettings.onLogout.subscribe((res?) => {
            this.loginSettings.isLogged = false;
            this.setCountTabs(0);
            // end
            return this.router.navigate([appRouter.login]);
        });

        // On login
        this.loginSettings.onLogin.subscribe((res?) => {
            this.loginSettings.isLogged = true;
            this.afterLogin();

            if (res && res.redirectTo.length > 0) {
                return this.router.navigate([res.redirectTo]);
            }
        });

        // On permissions denied
        this.loginSettings.onAccessDenied.subscribe((res: any) => {
            this.callPermissionsDeniedMessage(res);
        });

        // Get profile data on load
        if (this.loginProvider.isLogged) {
            this.profileService.getUserProfile().subscribe((res: any) => {
                this.loadingIconsService.selectGroup({ID: res.Branding, NAME: null});
                this.loadingIconsService.setAssetsGroupIdProfile(res.Branding);
            });
        }

        // Themes settings
        if (this.loginProvider.isLogged) {
            let themeClass = this.themesProvider.storageService.retrieve([this.themesProvider.storagePrefix]).subscribe((res: any) => {
                let data = res && res[0].Value;
                data = this.jsonProvider.isValidJSON(data)
                    ? JSON.parse(data)
                    : data || null;

                if (data) {
                    this.themesProvider.theme_class = data.replace(/["']/g, '');
                } else {
                    this.themesProvider.theme_class = 'default';
                }
            });
        }


        this.themesProvider.changed.subscribe((res: any) => {
            this.themesProvider.theme_class = res;
            this._getUserLogo();
            this.cdr.detectChanges();
        });

        // Top menu
        this.topMenuSettings = Object.assign({}, topMenuProvider, this.topMenuSettings);

        // this.uploadProvider.filesAdded.subscribe((data) => {
        //     setTimeout(() => {
        //         if (this.destroyed$.isStopped) {
        //             return;
        //         }
        //         this.cdr.detectChanges();
        //     });
        // });
        this.loginService.userLogin.subscribe((status) => {
            if (status) {
                this._getUserLogo();
            }
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public setServerVersion(ver) {
        this.serverVersion = ver;
        this.loginProvider.serverVersion = ver;
        this.cdr.detectChanges();
    }
    public getServerVersion() {
        return this.localStorage.retrieve('server_version');
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    moduleAllowed() {
        return this.loginSettings && this.loginSettings.isLogged && this.securityService.getCurrentMode() != systemModes.ConfigOnly;
    }

    ngOnInit() {
        // this.refreshStorages();
        this.appVersion = ConfigService.getAppVersion();
        this.setServerVersion(this.getServerVersion());
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler($event) {
        return !this.isBusyApp();
    }

    @HostListener('window:unload', ['$event'])
    unloadHandler($event) {
        const timeOfDead = new Date(new Date().setSeconds(new Date().getSeconds() + (this.baseProvider.isDevMode ? 60 : 20)));
        if (this.getCountTabs() > 0) {
            this.decrementCountTabs();
            this.cookieService.set('detect_reload', 'alive', timeOfDead);
        }
    }

    ngAfterViewInit() {
        this._getUserLogo();
        // Modal settings
        // this.splashProvider.loaderElRef = this.loaderElRef;

        this.splashProvider.overlay = this.overlay;

        // <--- // set name and reference for your modal
        if (this.loginSettings.isLogged === true) {
            this.incrementCountTabs();
            this.loginService.clearTargetPath();
            this._bindModalsAfterLogin();
        } else {
            this.setCountTabs(0);
        }

        // remove started overlay
        $('#loadingoverlay-prebootstraping').remove();
        let path = document.location.hash.substr(2);

        //for reset-pass page
        if (path.includes(appRouter.login_reset.verification)) {
            return;
        }


        if (path != "") {
            this.loginService.setTargetPath(path);
        }

        this.router.navigate([appRouter.login]);
    }

    afterLogin() {
        setTimeout(() => {
            if (this.destroyed$.isStopped) {
                return;
            }
            this.incrementCountTabs();
            this._bindModalsAfterLogin();
        });
    }

    callPermissionsDeniedMessage(res) {
        if (res && res.headers.get('content-type') == 'text/html' && res.headers.get('server') == 'ZENEDGE') {
            this.notificationService.notifyShow(2, 'Oracle Web Application Firewall blocked this request');
        } else {
            this.notificationService.notifyShow(2, this.translate.instant("common.not_enough_rights"));
        }
    }

    onRouterOutletActivate($event) {
        this.baseProvider.outletComponent = $event;
    }

    showVersions($event) {
        let target = $event.currentTarget.parentNode
            , tooltip = target.querySelector('.version-tooltip');
        if (tooltip) {
            tooltip.classList.add('active');

            let cb = function f(ev) {
                document.removeEventListener('mouseout', f);
                tooltip.classList.remove('active');
            };
            target.addEventListener('mouseout', cb);
        }
    }

    callAboutInfo($event) {
        $event.stopPropagation();

        if(this.securityService.hasPermissionByName('app-info-extended')) {
            const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.about_info_modal, AboutInfoModalComponent, {
                title: 'About Info',
                size: 'lg',
                position: 'center',
                // footer: 'ok',
                // footerRef: 'modalFooterTemplate'
            });

            modal.load().then((cr: ComponentRef<AboutInfoModalComponent>) => {});
        }
    }

    private incrementCountTabs() {
        const countTabs = this.getCountTabs() + 1;
        this.localStorage.store('active_tabs_counter', countTabs);
    }

    private decrementCountTabs() {
        const countTabs = this.getCountTabs() - 1;
        this.localStorage.store('active_tabs_counter', countTabs);
    }

    private setCountTabs(count: number) {
        this.localStorage.store('active_tabs_counter', count);
    }

    // preventHover() {
    //   $('.main-menu .dropdown').addClass('prevent-dropdown-hover');
    //   $('.main-menu .dropdown').hover(function(){
    //     $('.main-menu .dropdown').removeClass('prevent-dropdown-hover')
    //   });
    // }

    private getCountTabs(): number {
        return this.localStorage.retrieve('active_tabs_counter') || 0;
    }

    private refreshStorages() {
        let keysDictionary = {
            'tmd.clip.editor.mediadetails.saved.state': 8,
            'tmd.clip.editor.versiondetails.saved.state': 8,
            'tmd.clip.editor.saved.state': 8,
            'tmd.dashboard.saved.state': 8,
            'tmd.media.details.media.saved.state': 8,
            'tmd.media.details.audio.saved.state': 8,
            'tmd.media.details.default.saved.state': 8,
            'tmd.media.details.physicalitem.saved.state': 8,
            'tmd.media.details.subtile.saved.state': 8,
            'tmd.media.details.archive.saved.state': 8,
            'tmd.media.details.image.saved.state': 8,
            'tmd.media.details.doc.saved.state': 8,
            'tmd.medialogger.saved.state': 8,
            'tmd.version.details.saved.state': 2,
            'tmd.version.details.media.saved.state': 5,
            'tmd.version.details.audio.saved.state': 5,
            'tmd.version.details.default.saved.state': 5,
            'tmd.version.details.physicalitem.saved.state': 5,
            'tmd.version.details.subtile.saved.state': 5,
            'tmd.version.details.archive.saved.state': 5,
            'tmd.version.details.image.saved.state': 5,
            'tmd.version.details.doc.saved.state': 5,
            'tmd.carrier.details.media.saved.state': 4,
            'tmd.carrier.details.audio.saved.state': 4,
            'tmd.carrier.details.default.saved.state': 4,
            'tmd.carrier.details.physicalitem.saved.state': 4,
            'tmd.carrier.details.subtile.saved.state': 4,
            'tmd.carrier.details.archive.saved.state': 4,
            'tmd.carrier.details.image.saved.state': 4,
            'tmd.carrier.details.doc.saved.state': 4,
            'tmd.title.details.saved.state': 4,
            'tmd.assessment.saved.state': 8,
            'tmd.segmenting.saved.state': 8,
            'angular-imfx-split-state': 1,
            'tmd.config.user.group.preferences.logoimage': 4,
            'tmd.consumer.type': 0,
            'tmd.component_qc.saved.state': 1,
            'tmd.subtitles_qc.saved.state': 1,
            'tmd.base.settings.lang': 2
        };
        let cleanerData = this.localStorage.retrieve('storage.cleaner');
        let self = this;

        if (cleanerData) {
            $.each(keysDictionary, function (key, value) {
                if ((cleanerData[key] && cleanerData[key] !== value) || (!cleanerData[key])) {
                    localStorage.removeItem(key);
                }
            });
            self.localStorage.store('storage.cleaner', keysDictionary);
        } else {
            this.localStorage.store('storage.cleaner', keysDictionary);
            $.each(keysDictionary, function (key, value) {
                localStorage.removeItem(key);
            });
        }
    }

    private isBusyApp(): boolean {
        return !!this.uploadProvider.getUploadModelsByStates('waiting', 'progress').length;
    }

    private getOverlayColor(theme) {
        let color = '#EDF1F2';
        switch (theme) {
            case 'default':
                color = '#EDF1F2';
                break;
            case 'dark':
                color = '#34404A';
                break;
            default:
                break;
        }
        $('.loadingoverlay').css('background-color', color);
        return color;
    }

    private goHome() {
        console.log('default ' + this.loginService.getDefaultPage());
        this.router.navigate([this.loginService.getDefaultPage()]);
    }

    private _bindModalsAfterLogin() {
        this.modalPreviewPlayerProvider.previewModal = this.modalPreviewPlayer;
        this.uploadProvider.baseUploadMenuRef = this.baseUploadMenuRef;
    }

    private _getUserLogo() {
        // @ts-ignore

        this.loadingIconsService.getImage(this.themesProvider.getCurrentTheme(), "profile").subscribe(imgs => {
            this.mainLogo = imgs.smallLogo;
            this.cdr.detectChanges();
        }, error => {
            if (this.errorLogo === false) {
                setTimeout(() => {
                    this.errorLogo = true;
                    this._getUserLogo();
                }, 1000);
            } else {
                this.mainLogo = null;
                this.cdr.detectChanges();
            }
        });

        this.loadingIconsService.getImage('default', 'profile').subscribe(imgs => {
            if (imgs.smallLogo !== null) {
                this.httpClient.get(imgs.smallLogo, {responseType: 'blob'}).subscribe(res => {
                        if (res.size > 0) {
                            (document.getElementById('favicon') as HTMLLinkElement).href = imgs.smallLogo;
                        }
                    }
                );
            }
        });
    }
}
