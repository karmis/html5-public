/**
 * Created by Sergey Klimenko on 05.04.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TmdFullImageDirective} from "./fullimage.directive";
import {IMFXTextDirectionDirectiveModule} from "../text.inputs.textareas/text.inputs.textareas.directive.module";

@NgModule({
  declarations: [
    TmdFullImageDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    TmdFullImageDirective
  ]
})
export class IMFXFullImageDirectiveModule {
}
