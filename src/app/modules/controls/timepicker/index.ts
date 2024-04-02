import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// imfx modules
import {IMFXTimepickerComponent} from './timepicker';
import {TranslateModule} from "@ngx-translate/core";
import {TimepickerModule} from "ngx-bootstrap";
import {FormsModule} from "@angular/forms";
import {IMFXControlsSelect2Module} from "../select2";

@NgModule({
    declarations: [
        IMFXTimepickerComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        TimepickerModule,
        FormsModule,
        IMFXControlsSelect2Module,
    ],
    exports: [
        IMFXTimepickerComponent,
    ]
})
export class TimePickerModule {
}
