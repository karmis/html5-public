import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {FormsModule} from "@angular/forms";
import {ManagerUserModalComponent} from "./user.modal.component";
import SettingsUserChannelsTabModule from "../../comps/channels_tab";
import SettingsUserPresetsTabModule from "../../comps/presets_tab";
import SettingsUserGroupsTabModule from "../../comps/groups_tab";
import SettingsUserManagerResponsibilitiesTreeModule from "../../comps/responsibilities_tree";
import {NamesAuthoringModalModule} from "../names-authoring.modal";
import { DatepickerModule } from "ngx-bootstrap";
import { IMFXControlsDateTimePickerModule } from "../../../../../../../modules/controls/datetimepicker";
import { ExpiryDateComponent } from "../../comps/expiry-date/expiry-date.component";

@NgModule({
    declarations: [
        ManagerUserModalComponent,
        ExpiryDateComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        FormsModule,
        SettingsUserChannelsTabModule,
        SettingsUserPresetsTabModule,
        SettingsUserGroupsTabModule,
        SettingsUserManagerResponsibilitiesTreeModule,
        DatepickerModule,
        IMFXControlsDateTimePickerModule
    ],
    entryComponents: [
        ManagerUserModalComponent
    ]
})
export class ManagerUserModalModule {
    entry: Type<ManagerUserModalComponent>;

    constructor() {
        this.entry = ManagerUserModalComponent;
    }
}
