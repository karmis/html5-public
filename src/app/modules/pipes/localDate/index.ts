/**
 * Created by Sergey on 09.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

// Pipes
import {LocalDate} from './localDate';

@NgModule({
  declarations: [
    LocalDate
  ],
  imports: [
    TranslateModule,
    CommonModule
  ],
  exports: [
    LocalDate
  ],
})
export class LocalDateModule {
}
