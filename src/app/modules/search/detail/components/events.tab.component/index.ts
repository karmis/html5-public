import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IMFXEventsTabComponent} from "./imfx.events.tab.component";
import {SlickGridModule} from "../../../slick-grid";
import { TranslateModule } from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { TimecodeInputModule } from '../../../../controls/timecode';

// imfx modules


@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXEventsTabComponent,
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SlickGridModule,
      TimecodeInputModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    IMFXEventsTabComponent,
  ],
  entryComponents: [
  ]
})
export class IMFXEventsTabModule {}
