/**
 * Created by initr on 28.11.2016.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EventEmitter,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {SecurityService} from '../../../../services/security/security.service';
import {LocalStorageService, SessionStorageService} from "ngx-webstorage";
import {NavigationEnd, Router} from '@angular/router';
import {SearchTypes} from '../../../../services/system.config/search.types';
import {SettingsGroupsService} from '../../../../services/system.config/settings.groups.service';
import {UploadComponent} from "../../../../modules/upload/upload";
import {IMFXModalComponent} from "../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalProvider} from "../../../../modules/imfx-modal/proivders/provider";
import {forkJoin, Subscription} from 'rxjs';
import {BaseProvider} from '../../providers/base.provider';
import {UploadRemoteComponent} from '../../../../modules/upload-remote/remote.upload';

import {lazyModules} from "../../../../app.routes";
import {IMFXModalEvent} from "../../../../modules/imfx-modal/types";
import {SystemAboutComponent} from "../../../../modules/system-about/system-about.component";
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {SettingsGroupsMainMenu} from "../../../system/config/comps/settings.groups/comps/details/comps/main.menu.urls/main.menu.settings.component";

@Component({
    selector: 'base-top-menu',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTopMenuComponent {
    @Output() toClick: EventEmitter<any> = new EventEmitter<any>();
    protected isDevMode: boolean = false;
    protected isCloudServer: boolean = false;
    protected activeItem = {
        m: false,
        w: false,
        e: false,
        a: false,
        s: false,
        p: false,
        aq: false,
        loans: false,
        production: false,
        urls: false
    };
    protected staticSearchType: string = SearchTypes.CONSUMER;
    private defaultSearch;
    private routeSubscr: Subscription;
    private changesTimer;
    private readonly consumerSearchComponentStoragePrefix = null;
    private storagePrefix: string = 'consumer.component.data';
    // public ngDoCheck(): void {
    //     this.cdr.detectChanges();
    // }
    private umsUrl: string = '';
    private videoBrowserUrl: string = '';
    private mainMenuSettings: SettingsGroupsMainMenu[] = [];

    constructor(private securityService: SecurityService,
                private sessionStorage: SessionStorageService,
                public baseProvider: BaseProvider,
                private cdr: ChangeDetectorRef,
                private elementRef: ElementRef,
                private routerInstance: Router,
                private localStorage: LocalStorageService,
                private sgs: SettingsGroupsService,
                private modalProvider: IMFXModalProvider,
                private settingsGroupsService: SettingsGroupsService,
                private titleService: Title,
                private translate: TranslateService) {
        this.consumerSearchComponentStoragePrefix = this.sessionStorage.retrieve(this.storagePrefix);
    }

    menuActive(bIsActive, target) {
        if (bIsActive !== null && bIsActive !== undefined) {
            this.activeItem[target] = bIsActive;
        }
        return true;
    }

    ngOnInit() {
        const sbs: Subscription = forkJoin([this.settingsGroupsService.getSettingsGroupById(0, false),
            this.settingsGroupsService.getSettingsUserById('mainMenuSettings', false)]).subscribe((resArr: any) => {
            const res = resArr[0];
            const menuRes = resArr[1];
            if(menuRes && menuRes.length) {
                this.mainMenuSettings = JSON.parse(menuRes[0].DATA);
            }
            if (res) {
                const data = {
                    "ID": res.ID,
                    "NAME": res.NAME,
                    "DESCRIPTION": res.DESCRIPTION,
                    "TM_SETTINGS_KEYS": res.TM_SETTINGS_KEYS.map(el => {
                        el.EntityKey = null;
                        el.TM_SETTINGS_GROUPS = null;
                        el.TM_SETTINGS_GROUPSReference = null;
                        return el;
                    })
                };
                const umsUrl = data.TM_SETTINGS_KEYS.filter(el => el.KEY == 'umsUrl');
                if (umsUrl && umsUrl[0] && umsUrl[0].DATA) {
                    this.umsUrl = JSON.parse(umsUrl[0].DATA);
                } else {
                    this.umsUrl = '';
                }
                const videoBrowserUrl = data.TM_SETTINGS_KEYS.filter(el => el.KEY == 'videoBrowserUrl');
                if (videoBrowserUrl && videoBrowserUrl[0] && videoBrowserUrl[0].DATA) {
                    this.videoBrowserUrl = JSON.parse(videoBrowserUrl[0].DATA);
                } else {
                    this.videoBrowserUrl = '';
                }
                this.cdr.markForCheck();
                sbs.unsubscribe();
            }
        });
        this.settingsGroupsService.getSettingsGroupById(0, false)

        this.routeSubscr = this.routerInstance.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.refresh();
            }
        }, error => console.error(error));

    }

    ngAfterViewInit() {
        //double for refresh template variables after init&render(async refresh)
        this.refresh();
        this.refresh();
    }

    refresh() {
        this.cdr.markForCheck();
        //include template variables and after that detect changes.
        this.changesTimer = setTimeout(() => {
            try {
                this.cdr.detectChanges();
            } catch (e) {

            }
            this.isDevMode = this.baseProvider.isDevServer;
            this.isCloudServer = this.baseProvider.isCloudServer;
        });
    }

    ngOnDestroy() {
        this.routeSubscr.unsubscribe();
        clearTimeout(this.changesTimer);
    }

    toClickEvent($event) {
        // this.toClick.emit();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    hasPermission(path) {
        //return true;
        return this.securityService.hasPermissionByPath(path);
    }

    hasPermissions(paths) {
        //return true;
        let has = false;
        for (var p of paths) {
            has = has || this.securityService.hasPermissionByPath(p);
        }
        return has;
    }

    getHelpdeskUrl() {
        // debugger
        const srObj = this.sessionStorage.retrieve('config.user.group.preferences.helpdeskUrl');

        if (srObj && srObj.length > 0) {
            return JSON.parse(srObj).HelpdeskUrl === null ? '' : JSON.parse(srObj).HelpdeskUrl;
        }
        return '';
        // console.log(a);
    }

    clearStorages() {
        this.sessionStorage.clear();
        this.localStorage.clear();
    }

    callMediaUpload($events) {
        if (!this.securityService.hasPermissionByName('media_upload')) {
            console.warn('>>> Upload not allowed');
            return;
        }
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.upload_modal, UploadComponent, {
            title: 'base.media_upload',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr: ComponentRef<UploadComponent>) => {
            cr.instance.onSelectFiles([]);
        })
    }

    callMultiMediaUpload($events) {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.upload_remote_modal, UploadRemoteComponent, {
            title: 'remote_upload.title',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, '');

        modal.load().then((cr: ComponentRef<UploadRemoteComponent>) => {

        })

        // modal.contentView.instance.onSelectFiles([]);
    }

    // }
    onOpenSystemAbout() {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.system_about_modal, SystemAboutComponent, {
            title: 'base.system_about_dialog',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, '');
        modal.load().then((cr: ComponentRef<SystemAboutComponent>) => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide()
                }
            })
        });
    }

    protected getActiveName(group: string = null) {
        let result
            , url = this.routerInstance.url;
        let transString = null;
        switch (group) {
            case 'media':
                result = url.substr(1, url.length).indexOf('/') > -1
                    ? url.substr(1, url.substr(1).indexOf('/')) === "search" ||
                    url.substr(1, url.substr(1).indexOf('/')) === "simple"
                        ? "simple"
                        : url.substr(1, url.substr(1).indexOf('/'))
                    : url.substr(1) == "search"
                        ? "simple"
                        : url.substr(1);
                transString = 'base.' + result;
                break;
            case 'wf':
                if (url.indexOf('component-qc') > -1) {
                    result = 'component_qc';
                } else if (url.indexOf('segmenting') > -1) {
                    result = 'segmenting';
                } else if (url.indexOf('assessment') > -1) {
                    result = 'assessment';
                } else if (url.indexOf('media-logger-task') > -1) {
                    result = 'media-logger-task';
                } else {
                    result = url.substr(1, url.length).indexOf('/') > -1
                        ? (url.substr(url.substr(1).indexOf('/') + 2).length == 2
                            ? url.substr(1, url.substr(1).indexOf('/')) +
                            '_' + url.substr(url.substr(1).indexOf('/') + 2)
                            : url.substr(1, url.substr(1).indexOf('/')))
                        : url.substr(1);
                }
                transString = 'base.' + result;
                break;
            case 'loans':
                if (url.split('/')[2] === 'create') {
                    result = 'new_loan';
                } else {
                    result = 'search_loans';
                }
                transString = 'loans.' + result;
                break;
            case 'production':
                if (url.split('/')[2] === 'create') {
                    result = 'new_production';
                } else if (url.split('/')[2] === 'manager') {
                    result = 'production_manager';
                } else if (url.split('/')[2] === 'my-productions') {
                    result = 'my_productions';
                } else if (url.split('/')[2] === 'made-items-search') {
                    result = 'made_items_search';
                } else {
                    result = 'search_production';
                }
                transString = 'production.' + result;
                break;
            case 'urls':
                transString = '';
                break;
            default:
                result = url.substr(1, url.length).indexOf('/') > -1
                    ? url.substr(1, url.substr(1).indexOf('/'))
                    : url.substr(1);
                transString = 'base.' + result;
        }

        if (group === 'other') {
            switch (result) {
                case 'media-basket':
                case 'clip-editor':
                case 'media-logger':
                    break;
                default:
                    result = '';
            }
        }
        if (transString && transString.length > 5) {
            if (transString === 'base.profile') {
                transString += '.to_profile';
            }
            this.titleService.setTitle('i-mediaflex - ' + this.translate.instant(transString));
        }
        return result;
    }

    private consumerAvailable() {
        // if simple is not default search - it is the only way to get there
        if (SearchTypes[this.defaultSearch] !== SearchTypes.CONSUMER
            && !!this.consumerSearchComponentStoragePrefix) {
            return true;
        }
    }

    // private isProdBuild() {
    //     return (<any>window).IMFX_VERSION.indexOf('dev') < 0;
    // }

    private goToSimpleSearch($event) {
        const path = this.consumerAvailable() ? ['search', 'start'] : ['search', this.staticSearchType];
        this.routerInstance.navigate(path);
        $event.preventDefault();
        return false;
    }

    // private goToUMS($event) {
    //     if(this.umsUrl) {
    //         window.open(this.umsUrl, "_blank");
    //     }
    //     $event.preventDefault();
    //     $event.stopPropagation();
    //     return false
    // }
    //
    // private goVideoBrowser($event) {
    //     if(this.videoBrowserUrl) {
    //         window.open(this.videoBrowserUrl, "_blank");
    //     }
    //     $event.preventDefault();
    //     $event.stopPropagation();
    //     return false
    // }
    getRef(ref: string) {
        let r = ref;
        if(/(http(s?)):\/\//i.test(ref) === false) {
            r = '//' + ref;
        }
        return r;
    }
}
