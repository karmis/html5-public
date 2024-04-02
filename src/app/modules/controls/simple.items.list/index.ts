import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SimpleListComponent} from "./simple.items.list";
import {ThumbModule} from "../thumb";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SimpleListComponent,
  ],
  imports: [
    CommonModule,
    ThumbModule,
    TranslateModule
  ],
  exports: [
    SimpleListComponent,
  ]
})
export class SimpleListModule {}
