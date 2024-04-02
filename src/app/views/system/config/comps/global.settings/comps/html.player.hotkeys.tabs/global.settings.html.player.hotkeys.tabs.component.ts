import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { SettingsGroupsService } from "../../../../../../../services/system.config/settings.groups.service";
import { NotificationService } from "../../../../../../../modules/notification/services/notification.service";
import { NgModel } from '@angular/forms';
import { ShortcutsStatic } from '../../../../../../../modules/controls/html.player/shortcuts.static';

@Component({
    selector: 'global-settings-html-player-hotkeys-tabs',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: []
})

export class GlobalSettingsHtmlPlayerHotkeysTabsComponent {
    constructor() {

    };


}

