import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import {IMFXMetadataTabComponent} from "./imfx.metadata.tab.component";
import {IMFXXMLTreeModule} from "../../../../controls/xml.tree";
import {IMFXSimpleTreeModule} from "../../../../controls/simple.tree";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {LocalDateModule} from "../../../../pipes/localDate";
// import {ModalModule} from "../../../../modal";

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXMetadataTabComponent
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IMFXXMLTreeModule,
    IMFXSimpleTreeModule,
      IMFXTextDirectionDirectiveModule,
      LocalDateModule
    // ModalModule
  ],
  exports: [
    IMFXMetadataTabComponent,
  ]
})
export class IMFXMetadataTabModule {}
