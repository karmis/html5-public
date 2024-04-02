/**
 * Created by Sergey on 09.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { KeysPipe } from './keysPipe';

// Pipes

@NgModule({
  declarations: [
    KeysPipe
  ],
  imports: [
    TranslateModule,
    CommonModule
  ],
  exports: [
    KeysPipe
  ],
})
export class KeysPipeModule {
}
