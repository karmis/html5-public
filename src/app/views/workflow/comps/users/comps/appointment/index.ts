import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';
import {AppointmentComponent} from "./appointment";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        AppointmentComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [
        AppointmentComponent
    ],
    entryComponents: [
        AppointmentComponent
    ]
})
export class AppointmentModule {
}
