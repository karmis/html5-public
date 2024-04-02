import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXImageComponent} from './imfx.image.component';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {IMFXFullImageDirectiveModule} from "../../../../../directives/img-fullscreen/fullimage.directive.module";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXImageComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        IMFXTextDirectionDirectiveModule,
        IMFXFullImageDirectiveModule
    ],
    exports: [
        IMFXImageComponent,
    ]
})
export class IMFXImageModule {}
