import { ChangeDetectorRef, Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { SettingsGroupsService } from '../../../../../../../services/system.config/settings.groups.service';
import { NotificationService } from '../../../../../../../modules/notification/services/notification.service';
import { ThemesProvider } from '../../../../../../../providers/design/themes.providers';
import { DebounceProvider } from '../../../../../../../providers/common/debounce.provider';
import { ErrorManagerProvider } from '../../../../../../../modules/error/providers/error.manager.provider';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'global-settings-system',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SettingsGroupsService,
        ThemesProvider
    ]
})

export class GlobalErrorConfigComponent implements OnInit {
    protected emp: ErrorManagerProvider;
    private destroyed$: Subject<any> = new Subject<any>();
    private data;
    private key = "isDebugMode";

    constructor(private cdr: ChangeDetectorRef,
                private settingsGroupsService: SettingsGroupsService,
                private debounceProvider: DebounceProvider,
                private injector: Injector,
                private translate: TranslateService,
                private notificationRef: NotificationService) {
        this.emp = this.injector.get(ErrorManagerProvider);
    };

    ngOnInit() {
        this.initErrorSettings();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    changeDebugMode($event) {
        this.emp.isEnabled = $event.target.checked;
        // this.debounceProvider.debounce(() => {
        //     this.saveErrorConfig().subscribe(() => {
        //         console.log('Start saved');
        //         this.notificationRef.notifyShow(
        //             1,
        //             this.emp.isEnabled ? this.translate.instant('error_modal.enabled') : this.translate.instant('error_modal.disabled'));
        //     });
        // }, 350);
    }

    getSetting(key) {
        if (this.data.TM_SETTINGS_KEYS) {
            return this.data.TM_SETTINGS_KEYS.filter(el => el.KEY === key)[0];
        }
    }

    initErrorSettings() {
        this.settingsGroupsService.getSettingsGroupById(0, true).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            if (res) {
                this.data = {
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
                let debugData = this.getSetting(this.key);
                if (debugData) {
                    this.emp.isEnabled = <boolean>JSON.parse(debugData.DATA);
                    this.cdr.detectChanges();
                }
            }
        });
    }

    saveErrorConfig() {
        console.log('Start save');
        if (this.getSetting(this.key)) {
            this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.key)[0].DATA = JSON.stringify(this.emp.isEnabled);
        } else {
            this.data.TM_SETTINGS_KEYS.push({
                "KEY": this.key,
                "DATA": JSON.stringify(this.emp.isEnabled),
            });
        }

        return this.settingsGroupsService.saveSettingsGroup(this.data).pipe(
            takeUntil(this.destroyed$)
        );
    }
}
