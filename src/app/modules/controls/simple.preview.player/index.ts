import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {SimplePreviewPlayerComponent} from "./simple.preview.player.component";
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';


@NgModule({
  declarations: [
    // Components / Directives/ Pipes
      SimplePreviewPlayerComponent
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
      SimplePreviewPlayerComponent,
  ]
})
export class SimplePreviewPlayerModule {}
