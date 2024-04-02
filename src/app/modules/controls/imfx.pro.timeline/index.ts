import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXProTimelineComponent} from "./imfx.pro.timeline";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXProTimelineComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXProTimelineComponent,
    ],
    entryComponents: []
})
export class IMFXProTimelineModule {
}
