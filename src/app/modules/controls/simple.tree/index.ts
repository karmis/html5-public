/**
 * Created by Pavel on 17.01.2017.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXMLTreeComponent} from './imfx.xml.tree';
import {IMFXXMLNodeComponent} from "./components/node/imfx.xml.node.component";
// import { TreeModule } from 'angular2-tree-component';
import { TranslateModule } from '@ngx-translate/core';
import {IMFXSimpleTreeComponent} from "./simple.tree.component";
import {LocalDateModule} from "../../pipes/localDate";


@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    IMFXSimpleTreeComponent
  ],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
      LocalDateModule
  ],
  exports: [
    IMFXSimpleTreeComponent,
  ]
})
export class IMFXSimpleTreeModule {}
