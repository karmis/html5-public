import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";

export type SettingsGroupsMainMenu = {
    title: string,
    ref: string
}

@Component({
    selector: 'main-menu-urls-settings',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class MainMenuSettingsComponent {
    @Input('mainMenuSettings') public mainMenuSettings: SettingsGroupsMainMenu[] = [];
    @Output('onChangeMainMenuSettings') private onChangeMainMenuSettings: EventEmitter<any> = new EventEmitter<any>();

    add() {
       this.mainMenuSettings.unshift({
           ref: '',
           title: ''
       });
        this.onChangeMainMenuSettings.emit(this.mainMenuSettings);
    }

    remove(j) {
        this.mainMenuSettings.splice(j, 1);
        this.onChangeMainMenuSettings.emit(this.mainMenuSettings);
    }
}
