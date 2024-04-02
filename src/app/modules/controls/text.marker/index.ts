import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// imfx modules
import { IMFXTextMarkerComponent } from './imfx.text.marker';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    IMFXTextMarkerComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IMFXTextDirectionDirectiveModule,
        TranslateModule
    ],
  exports: [
    IMFXTextMarkerComponent
  ]
})
export class IMFXTextMarkerModule {}
