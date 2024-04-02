/**
 * Created by Sergey on 09.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// Pipes
import {ShowItems} from './showItems';

@NgModule({
  declarations: [
    ShowItems
  ],
  imports: [
    TranslateModule,
    CommonModule
  ],
  exports: [
    ShowItems
  ],
})
export class ShowItemsModule {
}
