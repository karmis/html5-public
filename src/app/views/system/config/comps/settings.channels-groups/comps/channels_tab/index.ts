import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {SettingsChannelsTabComponent} from "./comp";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsChannelsTabComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        SettingsChannelsTabComponent
    ]
})
export default class SettingsChannelsTabModule {
}
