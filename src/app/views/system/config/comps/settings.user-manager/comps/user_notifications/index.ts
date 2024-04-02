import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import { TranslateModule } from "@ngx-translate/core";
import {SettingsUserNotificationsComponent} from "./comp";
import {FormsModule} from "@angular/forms";
import {SlickGridModule} from "../../../../../../../modules/search/slick-grid";
import {OverlayModule} from "../../../../../../../modules/overlay";
import {IMFXControlsTreeModule} from "../../../../../../../modules/controls/tree";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserNotificationsComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SlickGridModule,
        OverlayModule,
        IMFXControlsTreeModule
    ],
    exports: [
        SettingsUserNotificationsComponent
    ]
})
export default class SettingsUserNotificationsModule {
}
