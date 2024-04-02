import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ImfxProTimelineQCWrapperComponent} from "./imfx.pro.timeline.qc.wrapper.component";
import {IMFXProTimelineModule} from "../../../../../../modules/controls/imfx.pro.timeline";


@NgModule({
  declarations: [
    // Components / Directives/ Pipes
      ImfxProTimelineQCWrapperComponent
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXProTimelineModule
  ],
  exports: [
      ImfxProTimelineQCWrapperComponent,
  ]
})
export class ImfxProTimelineQCWrapperModule {}


