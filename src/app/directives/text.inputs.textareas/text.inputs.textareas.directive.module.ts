/**
 * Created by IvanBanan on 07.08.2018.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TextDirectionDirective} from "./text.inputs.textareas.directive";


@NgModule({
  declarations: [
      TextDirectionDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  exports: [
      TextDirectionDirective
  ],
    entryComponents:[
    ]
})
export class IMFXTextDirectionDirectiveModule {
}
