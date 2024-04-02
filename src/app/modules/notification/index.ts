/**
 * Created by Sergey on 03.08.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ModalModule as ng2Module} from 'ngx-bootstrap/modal';
import {NotificationComponent} from './notification.component';


@NgModule({
  declarations: [
    // Comps
    NotificationComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    ng2Module
  ],
  exports: [
    NotificationComponent,
  ]
})
export class NotificationModule {
}
