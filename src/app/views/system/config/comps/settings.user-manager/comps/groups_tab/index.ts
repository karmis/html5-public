import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import {TranslateModule} from '@ngx-translate/core';
import {SettingsUserGroupsTabComponent} from "./comp";
import {FormsModule} from "@angular/forms";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserGroupsTabComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        SettingsUserGroupsTabComponent
    ]
})
export default class SettingsUserGroupsTabModule {
}
