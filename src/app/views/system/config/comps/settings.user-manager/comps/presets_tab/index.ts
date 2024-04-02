import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import {TranslateModule} from '@ngx-translate/core';
import {SettingsUserPresetsTabComponent} from "./comp";
import {FormsModule} from "@angular/forms";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserPresetsTabComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        SettingsUserPresetsTabComponent
    ]
})
export default class SettingsUserPresetsTabModule {
}
