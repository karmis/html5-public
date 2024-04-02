import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
// comps
import { TranslateModule } from '@ngx-translate/core';
import {SettingsUsersTabComponent} from "./comp";
import {FormsModule} from "@angular/forms";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUsersTabComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        SettingsUsersTabComponent,
    ]
})
export default class SettingsUsersTabModule {
}
