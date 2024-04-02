import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXTextDirectionDirectiveModule} from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXInfiniteTimelineComponent} from "./imfx.infinite.timeline";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXInfiniteTimelineComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXInfiniteTimelineComponent,
    ],
    entryComponents: []
})
export class IMFXInfiniteTimelineModule {
}
