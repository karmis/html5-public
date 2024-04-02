/**
 * Created by dvvla on 28.08.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropDownDirective} from "./dropdown.directive";
import {IMFXTextDirectionDirectiveModule} from "../text.inputs.textareas/text.inputs.textareas.directive.module";

@NgModule({
  declarations: [
    DropDownDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    DropDownDirective
  ]
})
export class IMFXDropDownDirectiveModule {
}
