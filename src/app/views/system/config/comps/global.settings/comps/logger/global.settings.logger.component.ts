import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EventEmitter,
    Injector,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {SettingsGroupsService} from "../../../../../../../services/system.config/settings.groups.service";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {TranslateService} from '@ngx-translate/core';
import {ErrorManagerProvider} from '../../../../../../../modules/error/providers/error.manager.provider';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {VersionModalComp} from "../version.modal/version.modal.comp";
import {
    DBSettings,
    ServiceConfigService
} from "../../../../../../../services/system.config/settings.service-config.service";
import {lazyModules} from "../../../../../../../app.routes";


@Component({
    selector: 'global-settings-logger',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SettingsGroupsService
    ]
})

export class GlobalSettingsLoggerComponent implements OnInit {
    versionClient: DBSettings;
    modalProvider: IMFXModalProvider;
    protected loggerData: LoggerData = {Url: "", MediaProxyLogger: "", UMSURL: ""};
    protected audioOnFrameForward: boolean = false;
    @ViewChild("gss", {static: false}) private gss;
    @ViewChild("loggerSettingsWrapper", {static: false}) private loggerSettingsWrapper;
    private data;
    @Output('onChangeConfig') private onChangeConfig: EventEmitter<any> = new EventEmitter<any>();
    private key = "globallogger";
    private debugKey = 'isDebugMode';
    private audioOnFrameForwardKey = 'audioOnFrameForward';
    private destroyed$: Subject<any> = new Subject<any>();
    private umsUrlKey: string = "umsUrl";
    private umsUrl: string = '';
    private videoBrowserKey: string = 'videoBrowserUrl';
    private videoBrowserUrl: string = '';

    constructor(private cdr: ChangeDetectorRef,
                private settingsGroupsService: SettingsGroupsService,
                private notificationRef: NotificationService,
                private translate: TranslateService,
                private emp: ErrorManagerProvider,
                public injector: Injector,
                private serviceConfigService: ServiceConfigService) {
        this.modalProvider = this.injector.get(IMFXModalProvider)
    };

    @Input('data')
    private set _data(_data) {
        this.data = _data;
        this.cdr.markForCheck();
    };

    ngOnInit() {
        this.initLoggerSetting();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    initLoggerSetting() {
        let self = this;
        this.settingsGroupsService.getSettingsGroupById(0, true).pipe(
            takeUntil(self.destroyed$)
        ).subscribe((res: any) => {
            if (res) {
                self.data = {
                    "ID": res.ID,
                    "NAME": res.NAME,
                    "DESCRIPTION": res.DESCRIPTION,
                    "TM_SETTINGS_KEYS": res.TM_SETTINGS_KEYS.map(el => {
                        el.EntityKey = null;
                        el.TM_SETTINGS_GROUPS = null;
                        el.TM_SETTINGS_GROUPSReference = null;
                        return el;
                    }),
                    "VISUAL_ASSETS_GROUP_ID": res.VISUAL_ASSETS_GROUP_ID
                };
                let loggerData = self.getSetting(this.key);
                let isDebug = self.getSetting(this.debugKey);
                const umsUrl = self.getSetting(this.umsUrlKey);
                const vbUrl = self.getSetting(this.videoBrowserKey);
                let audioOnFrameForward = self.getSetting(this.audioOnFrameForwardKey);
                if (loggerData) {
                    self.loggerData = <LoggerData>JSON.parse(loggerData.DATA);
                }
                if (umsUrl) {
                    self.umsUrl = <string>JSON.parse(umsUrl.DATA);
                }
                if (vbUrl) {
                    self.videoBrowserUrl = <string>JSON.parse(vbUrl.DATA);
                }
                if (isDebug) {
                    this.emp.isEnabled = <boolean>JSON.parse(isDebug.DATA);
                }
                if (audioOnFrameForward) {
                    this.audioOnFrameForward = <boolean>JSON.parse(audioOnFrameForward.DATA);
                }
                this.cdr.detectChanges();
            }
        });

        this.serviceConfigService.getVersionClient()
            .subscribe(res => {
                this.versionClient = res
            });
    };

    changeFrameForwardMode($event) {
        this.audioOnFrameForward = $event.target.checked;
    };

    SaveLoggerUrl() {
        if (this.getSetting(this.key) && this.getSetting(this.debugKey) && this.getSetting(this.umsUrlKey) && this.getSetting(this.videoBrowserKey)) {
            this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.key)[0].DATA = JSON.stringify(this.loggerData);
            this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.debugKey)[0].DATA = JSON.stringify(this.emp.isEnabled);
            this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.umsUrlKey)[0].DATA = JSON.stringify(this.umsUrl);
            this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.videoBrowserKey)[0].DATA = JSON.stringify(this.videoBrowserUrl);
        } else {
            this.data.TM_SETTINGS_KEYS.push({
                    "KEY": this.key,
                    "DATA": JSON.stringify(this.loggerData),
                }, {
                    "KEY": this.debugKey,
                    "DATA": JSON.stringify(this.emp.isEnabled),
                },
                {
                    "KEY": this.umsUrlKey,
                    "DATA": JSON.stringify(this.umsUrl),
                },
                {
                    "KEY": this.videoBrowserKey,
                    "DATA": JSON.stringify(this.videoBrowserUrl),
                });
        }
        if (this.getSetting(this.audioOnFrameForwardKey)) {
            this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.audioOnFrameForwardKey)[0].DATA = JSON.stringify(this.audioOnFrameForward);
        } else {
            this.data.TM_SETTINGS_KEYS.push({
                "KEY": this.audioOnFrameForwardKey,
                "DATA": JSON.stringify(this.audioOnFrameForward),
            });
        }
        this.settingsGroupsService.saveSettingsGroup(this.data).subscribe(res => {
            this.notificationRef.notifyShow(1, "Configuration saved successfully");
            this.onChangeConfig.emit(this.data);
            this.onChangeConfig.complete();
        });
    }

    openVersionModal() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.version_modal,
            VersionModalComp,
            {
                size: 'md',
                title: 'Advanced settings',
                position: 'center',
                class: 'view-details'
            }
        );
        modal.load().then((modal: ComponentRef<VersionModalComp>) => {
            let modalContent: VersionModalComp = modal.instance;
            modalContent.setInputs(this.versionClient);
        });
        modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name == 'ok') {
                modal.hide();
            }
        });
    }

    private getSetting(key) {
        if (this.data.TM_SETTINGS_KEYS) {
            return this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == key)[0];
        }
    }
}

export class LoggerData {
    public Url: string = "";
    public MediaProxyLogger: string = "";
    public UMSURL: string = "";
}
