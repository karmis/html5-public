import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import {TranslateModule} from '@ngx-translate/core';
import {SettingsUserChannelsTabComponent} from "./comp";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserChannelsTabComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        SettingsUserChannelsTabComponent
    ]
})
export default class SettingsUserChannelsTabModule {
}
