import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXDefaultTabComponent} from './imfx.default.tab.component';
import {IMFXTextDirectionDirectiveModule} from "../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module";

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXDefaultTabComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    IMFXDefaultTabComponent,
  ]
})
export class IMFXDefaultTabModule {}
