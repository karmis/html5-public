/**
 * Created by Pavel on 25.04.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TristateDirective} from "./tristate.checkbox.directive";
import { IMFXTextDirectionDirectiveModule } from '../text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
  declarations: [
    TristateDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    TristateDirective
  ]
})
export class IMFXTristateDirectiveModule {
}
