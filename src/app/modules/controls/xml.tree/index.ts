/**
 * Created by Pavel on 17.01.2017.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXMLTreeComponent} from './imfx.xml.tree';
import {IMFXXMLNodeComponent} from "./components/node/imfx.xml.node.component";
import { TreeModule } from 'angular-tree-component';
// import { TreeModule } from './component-overrides/dist/angular2-tree-component';
import { TranslateModule } from '@ngx-translate/core';
import {IMFXControlsDateTimePickerModule} from "../datetimepicker";
import {IMFXTristateDirectiveModule} from "../../../directives/tristate.checkbox/tristate.checkbox.module";
import {IMFXControlsSelect2Module} from "../select2";
import {MultilineTextComponent} from "./components/modals/multiline.text/multiline.text.component";
// import {ModalModule} from "../../modal";
import { CodemirrorModule } from 'ng2-codemirror';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {AutosizeModule} from 'ngx-autosize';
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';
@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXMLTreeComponent,
    IMFXXMLNodeComponent,
    MultilineTextComponent
  ],
    imports: [
        AutosizeModule,
        TranslateModule,
        IMFXTristateDirectiveModule,
        IMFXControlsDateTimePickerModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TreeModule,
        IMFXControlsSelect2Module,
        // ModalModule,
        CodemirrorModule,
        IMFXTextDirectionDirectiveModule,
        DigitOnlyModule
    ],
  entryComponents: [
    MultilineTextComponent
  ],
  exports: [
    IMFXMLTreeComponent,
  ]
})
export class IMFXXMLTreeModule {}
