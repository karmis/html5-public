/**
 * Created by Sergey Trizna on 17.12.2016.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// imfx modules
import {IMFXControlsSelect2Component} from './imfx.select2';
import {IMFXControlsLookupsSelect2Component} from './imfx.select2.lookups';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXControlsSelect2Component,
        IMFXControlsLookupsSelect2Component
    ],
    imports: [
        TranslateModule,
        // FormsModule,
        // ReactiveFormsModule,
        CommonModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXControlsSelect2Component,
        IMFXControlsLookupsSelect2Component
    ],
})
export class IMFXControlsSelect2Module {}
