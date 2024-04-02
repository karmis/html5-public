/**
 * Created by IvanBanan 19.07.2019
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { IMFXModalProvider } from '../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { IMFXModalEvent } from '../imfx-modal/types';
import { HttpService } from '../../services/http/http.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClipboardProvider } from '../../providers/common/clipboard.provider';
import { NotificationService } from '../notification/services/notification.service';
import { ConfigService } from '../../services/config/config.service';
import { ActivatedRoute } from '@angular/router';



@Component({
    selector: 'about-info-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush, // noway
    providers: [
    ]
})

export class AboutInfoModalComponent {
    @ViewChild('wrapper', {static: false}) wrapper: ElementRef;
    public modalRef: IMFXModalComponent;
    protected data: any;
    private destroyed$ = new Subject();


    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider,
                public translate: TranslateService,
                public cdr: ChangeDetectorRef,
                public clipboardProvider: ClipboardProvider,
                public notificationService: NotificationService,
                public http: HttpService) {
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();

        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name.indexOf('hide') > -1) {
                // this.hide();
            }
        });
    }
    navigator;
    toPrintClient: any = {};
    toPrintServer: any = {};
    serverLog: string[] = null;

    ngOnInit() {
        this.navigator = window.navigator;
        this.toPrintClient = {
            'platform' : this.navigator.platform || null,
            'vendor' : this.navigator.vendor || null,
            'oscpu' : this.navigator.oscpu || null,
            'onLine' : (typeof this.navigator.onLine == 'boolean') ? this.navigator.onLine : null,
            'connection.effectiveType': this.navigator.connection && this.navigator.connection.effectiveType || null,
            'cookieEnabled': (typeof this.navigator.cookieEnabled == 'boolean') ? this.navigator.cookieEnabled : null,
            'language': this.navigator.language || null,
            'userLanguage': this.navigator.userLanguage || null,
            'browserLanguage': this.navigator.browserLanguage || null,
            'systemLanguage': this.navigator.systemLanguage || null,
            'languages': Array.isArray(this.navigator.languages) ? `[${this.navigator.languages.join(', ')}]` : null,
            'userAgent' : this.navigator.userAgent || null,
            'build': ConfigService.getAppVersion() || null,
            'location': location.href || null,
            'settings.language': this.translate.currentLang || null
        };

        this.http.get('/api/appinfo2').pipe(
            takeUntil(this.destroyed$),
            map((res: any) => {
                return res.body;
            })
        ).subscribe((res: any) => {
            this.onDataLoaded(res);
        });
    }

    ngAfterViewInit() {
        this.modalRef.showOverlay();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onDataLoaded(data) {
        this.serverLog = data.serverLog;
        delete data.serverLog;
        this.toPrintServer = data;
        this.modalRef.hideOverlay();
        this.cdr.detectChanges();
    }

    getKeys(obj) {
        return Object.keys(obj)
    }

    copyJSON() {
        (this.clipboardProvider.copy(this.getTextToCopy()))
            ? this.notificationService.notifyShow(1, 'common.copied')
            : this.notificationService.notifyShow(2, 'common.failed');
    }

    getDataToCopy() {
        let obj = {
            Client: this.toPrintClient,
            Server: this.toPrintServer,
            ServerLog: this.serverLog
        };

        return JSON.stringify(obj, null, 4);
    }

    getTextToCopy() {
        let spaceNum = 4;
        let space = " ".repeat(spaceNum);
        let obj = {
            Client: this.toPrintClient,
            Server: this.toPrintServer,
            ServerLog: this.serverLog
        };
        let result = '';

        let func = (obj, deep = 0, isArray = false) => {
            for (var key in obj) {
                if (obj[key] && typeof obj[key] == 'object') {
                    result = `${result}${space.repeat(deep)}${key}:\n`;
                    func(obj[key], deep + 1, Array.isArray(obj[key]));
                } else {
                    if (obj[key] !== null) {
                        result = `${result}${space.repeat(deep)}${!isArray ? key + ': ' : ''}${obj[key]}\n`;
                    }
                }
            }
        };

        func(obj,0 , Array.isArray(obj));

        return result;
    }
}
