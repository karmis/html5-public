import {ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import { SettingsGroupsService } from '../../../../../services/system.config/settings.groups.service';
import { GlobalSettingsGrafanaComponent } from './comps/grafana/global.settings.grafana.component';
import { GlobalSettingsLoggerComponent } from './comps/logger/global.settings.logger.component';
import {GlobalSettingsEventConfigComponent} from "./comps/event.config/event.config.component";

@Component({
    selector: 'global-settings-manager',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [
        GlobalSettingsGrafanaComponent,
        GlobalSettingsLoggerComponent,
        GlobalSettingsEventConfigComponent
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SettingsGroupsService
    ]
})

export class GlobalSettingsComponent {
    private grafanaIsRendered: boolean = false;
    private mode = 'global';
    private config: any = {};
    constructor(private cdr: ChangeDetectorRef){}
    onActivate(name: string) {
        this.mode = name;
        if (this.mode === 'grafana') {
            this.grafanaIsRendered = true;
        }
    }


    onChangeConfig($event) {
        this.config = $event;
        this.cdr.markForCheck();
    }
}
