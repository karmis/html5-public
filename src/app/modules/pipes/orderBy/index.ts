/**
 * Created by Sergey on 09.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// Pipes
import {OrderBy} from './orderBy';

@NgModule({
  declarations: [
    OrderBy
  ],
  imports: [
    TranslateModule,
    CommonModule
  ],
  exports: [
    OrderBy
  ],
})
export class OrderByModule {
}
