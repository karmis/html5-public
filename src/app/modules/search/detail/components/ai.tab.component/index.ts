import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// imfx modules
import {IMFXAiTabComponent} from "./ai.tab.component";
import {TranslateModule} from '@ngx-translate/core';
import {IMFXTextDirectionDirectiveModule} from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {SafePipeModule} from "../../../../pipes/safePipe";

@NgModule({
    declarations: [
        IMFXAiTabComponent,
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        IMFXTextDirectionDirectiveModule,
        SafePipeModule
    ],
    exports: [
        IMFXAiTabComponent
    ]
})
export class IMFXAiTabModule {
}
