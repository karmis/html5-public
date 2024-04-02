import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXVideoInfoComponent} from './video.info.component';
import {IMFXFrameSelectorComponent} from "./components/frame.selector.component/frame.selector.component";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXVideoInfoComponent,
    IMFXFrameSelectorComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXTextDirectionDirectiveModule
  ],
  exports: [
    IMFXVideoInfoComponent,
  ]
})
export class IMFXVideoInfoModule {}
