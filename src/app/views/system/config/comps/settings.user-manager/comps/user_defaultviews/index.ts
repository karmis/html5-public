import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import { TranslateModule } from "@ngx-translate/core";
import {SettingsUserDefaultViewsComponent} from "./comp";
import {FormsModule} from "@angular/forms";
import {IMFXControlsTreeModule} from "../../../../../../../modules/controls/tree";
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {OverlayModule} from "../../../../../../../modules/overlay";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserDefaultViewsComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        IMFXControlsTreeModule,
        IMFXControlsSelect2Module,
        OverlayModule
    ],
    exports: [
        SettingsUserDefaultViewsComponent
    ]
})
export default class SettingsUserDefaultViewsModule {
}
