import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FocusDirective} from "./focus.directive";

@NgModule({
  declarations: [
      FocusDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  exports: [
      FocusDirective
  ]
})
export class FocusDirectiveModule {
}
