import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXProTimelineModule} from "../imfx.pro.timeline";
import {ImfxProTimelineAdditionalButtonsWrapperComponent} from "./imfx.pro.timeline.additional.buttons.wrapper.component";


@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    ImfxProTimelineAdditionalButtonsWrapperComponent
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXProTimelineModule
  ],
  exports: [
      ImfxProTimelineAdditionalButtonsWrapperComponent,
  ]
})
export class ImfxProTimelineAdditionalButtonsWrapperModule {}


