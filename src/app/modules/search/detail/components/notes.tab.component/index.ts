import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IMFXNotesTabComponent} from "./imfx.notes.tab.component";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXNotesTabComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    IMFXNotesTabComponent,
  ]
})
export class IMFXNotesTabModule {}
