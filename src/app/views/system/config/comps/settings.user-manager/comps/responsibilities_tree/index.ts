/**
 * Created by Sergey Trizna on 16.02.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
// comps
import {SettingsUserManagerResponsibilitiesTreeComponent} from "./comp";
import { TranslateModule } from '@ngx-translate/core';
import {IMFXControlsTreeModule} from "../../../../../../../modules/controls/tree";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserManagerResponsibilitiesTreeComponent,
    ],
    imports: [
        CommonModule,
        IMFXControlsTreeModule,
        TranslateModule
    ],
    exports: [
        SettingsUserManagerResponsibilitiesTreeComponent
    ]
})
export default class SettingsUserManagerResponsibilitiesTreeModule {
}
