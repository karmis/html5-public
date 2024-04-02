/**
 * Created by IvanBanan on 09.04.2018.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SaveSplitStateDirective} from "./savesplitstate.directive";
import { IMFXTextDirectionDirectiveModule } from '../text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
  declarations: [
    SaveSplitStateDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    SaveSplitStateDirective
  ]
})
export class IMFXSaveSplitStateDirectiveModule {
}
