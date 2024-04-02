/**
 * Created by Sergey Trizna on 16.02.2017.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import { SettingsUserManagerGroupDescriptionComponent } from './comp';
import {TranslateModule} from '@ngx-translate/core';
import { IMFXControlsTreeModule } from '../../../../../../../modules/controls/tree';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingsUserManagerGroupDescriptionComponent,
    ],
    imports: [
        CommonModule,
        IMFXControlsTreeModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        SettingsUserManagerGroupDescriptionComponent
    ]
})
export default class SettingsUserManagerGroupDescriptionModule {
}
