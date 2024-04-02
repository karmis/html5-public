import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { SettingsGroupsService } from "../../../../../../../services/system.config/settings.groups.service";
import { NotificationService } from "../../../../../../../modules/notification/services/notification.service";
import { NgModel } from '@angular/forms';
import { ShortcutsStatic } from '../../../../../../../modules/controls/html.player/shortcuts.static';

@Component({
    selector: 'global-settings-html-player-hotkeys',
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

export class GlobalSettingsHtmlPlayerHotkeysComponent implements OnInit {

    @ViewChild('htmlPlayerHotkeysSettingsWrapper', {static: false}) private loggerSettingsWrapper;
    @Input() dataKey = 'htmlplayerhotkeys';
    private data;
    private hotkeysData;
    private permanentHotkeysData;
    private hotkeysNames = [];
    private afterDownEvent: KeyboardEvent;

    constructor(private cdr: ChangeDetectorRef,
                private settingsGroupsService: SettingsGroupsService,
                private notificationRef: NotificationService) {
    };

    ngOnInit() {
        this.setHotkeysData();
        this.permanentHotkeysData = ShortcutsStatic._deepCopy(ShortcutsStatic.permanentHotkeys);
        this.initSetting();
    }

    initSetting() {
        let self = this;
        this.settingsGroupsService.getSettingsGroupById(0, true).subscribe((res: any) => {
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
                let hotkeysData = self.getSetting(self.dataKey);
                if (hotkeysData) {
                    // self.hotkeysData = <LoggerData>JSON.parse(hotkeysData.DATA);
                    let hkObj = JSON.parse(hotkeysData.DATA);
                    const defaultHotkeysData = this.dataKey === 'htmlplayerhotkeys' ? ShortcutsStatic.defaultHotkeysData : ShortcutsStatic.defaultHotkeysDataWorkstation
                    self.hotkeysData = $.extend(true, {}, defaultHotkeysData, hkObj);
                }
                self.hotkeysNames = Object.keys(this.hotkeysData);
                try {
                    self.cdr.detectChanges();
                } catch (e) {
                    console.log(e.message);
                }
            }
        });
    }

    SaveSettings() {
        let self = this;
        if (this.hotkeysData) {
            this.cdr.detectChanges();
            if (this.getSetting(this.dataKey)) {
                this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == this.dataKey)[0].DATA = JSON.stringify(this.hotkeysData);
            } else {
                this.data.TM_SETTINGS_KEYS.push({
                    "KEY": this.dataKey,
                    "DATA": JSON.stringify(this.hotkeysData),
                });
            }
            // debugger;
            this.settingsGroupsService.saveSettingsGroup(this.data).subscribe((res: any) => {
                self.cdr.detectChanges();
                self.notificationRef.notifyShow(1, "Parameters saved");
            });
        } else {
            self.notificationRef.notifyShow(2, "No data to save");
        }
    }

    SetDefault() {
        this.setHotkeysData();
    }

    setHotkeysData() {
        if (this.dataKey === 'htmlplayerhotkeys') {
            this.hotkeysData = ShortcutsStatic._deepCopy(ShortcutsStatic.defaultHotkeysData);
        } else {
            this.hotkeysData = ShortcutsStatic._deepCopy(ShortcutsStatic.defaultHotkeysDataWorkstation);
        }
        return this.hotkeysData;
    }

    private getSetting(key) {
        if (this.data.TM_SETTINGS_KEYS) {
            return this.data.TM_SETTINGS_KEYS.filter(el => el.KEY == key)[0];
        } else {
            return null;
        }
    }

    keyDown($event) {
        // we save meta properties before preventDefault
        $event.preventDefault();
        if (ShortcutsStatic.defineForbiddenKeys($event)) {
            return;
        }
        this.afterDownEvent = $event;
    }

    keyUp($event, model: NgModel) {
        // console.log(this.afterDownEvent, $event, model, act_name);

        if (ShortcutsStatic.defineForbiddenKeys($event) || !this.afterDownEvent) {
            return;
        }

        let downEvent = this.afterDownEvent;
        let shortCut = ShortcutsStatic.defineHotkeyBundle(downEvent);
        this.afterDownEvent = null;

        if ($event.code === 'Backspace') {
            model.control.setValue('');
            return;
        }

        if (!this.getActNameByShortcut(shortCut)) {
            model.control.setValue(shortCut);
            $event.currentTarget.blur();
        }

    }

    getActNameByShortcut (shortCut) {
        for (let key in this.hotkeysData) {
            if (shortCut == this.hotkeysData[key].combin) {
                return key;
            }
        }
        for (let key in this.permanentHotkeysData) {
            if (shortCut == this.permanentHotkeysData[key].combin) {
                return key;
            }
        }
        return;
    }

    // repeatValidator (control: FormControl) {
    //     return {repeatedShortcut: 'Shortcut is already used'};
    // }
}

