/**
 * Created by Sergey K. on 09.03.2018.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {LayoutManagerComponent} from './layout.manager.component';
// import {ModalModule} from "../../modal";
// import {SaveLayoutModalComponent} from "./modals/save.layout.modal/save.layout.modal.component";
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';


@NgModule({
  declarations: [
    LayoutManagerComponent,
    // SaveLayoutModalComponent,
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      IMFXTextDirectionDirectiveModule
    // ModalModule
  ],
  exports: [
    LayoutManagerComponent,
    // SaveLayoutModalComponent,
  ],
  entryComponents: [
    // SaveLayoutModalComponent,
  ]
})
export class LayoutManagerModule {}
