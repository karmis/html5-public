import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {ManagerGroupModalComponent} from './group.modal.component';
import {IMFXControlsTreeModule} from '../../../../../../../modules/controls/tree';
import SettingsUserManagerResponsibilitiesTreeModule from '../../comps/responsibilities_tree';
import {OverlayModule} from '../../../../../../../modules/overlay';
import SettingsUserManagerGroupDescriptionModule from '../../comps/group_description';
import {SettingGroupUsersListModule} from '../../comps/users-list';
import SettingsUserChannelsTabModule from '../../comps/channels_tab';
import SettingsUserPresetsTabModule from '../../comps/presets_tab';
import SettingsUsersTabModule from "../../comps/users_tab";

@NgModule({
    declarations: [
        ManagerGroupModalComponent
    ],
    imports: [
        CommonModule,
        IMFXControlsTreeModule,
        TranslateModule,
        SettingsUserManagerResponsibilitiesTreeModule,
        SettingsUserManagerGroupDescriptionModule,
        SettingGroupUsersListModule,
        SettingsUserChannelsTabModule,
        SettingsUserPresetsTabModule,
        SettingsUsersTabModule,
        FormsModule,
        OverlayModule
    ],
    entryComponents: [
        ManagerGroupModalComponent
    ]
})
export class ManagerGroupModalModule {
    entry: Type<ManagerGroupModalComponent>;

    constructor() {
        this.entry = ManagerGroupModalComponent;
    }
}
