/**
 * Created by Sergey Trizna on 29.05.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

// imfx modules
import {RangeDateTimePickerComponent} from './range.date.time.picker';
import {IMFXControlsDateTimePickerModule} from "../datetimepicker";
import { TranslateModule } from '@ngx-translate/core';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        RangeDateTimePickerComponent,
    ],
    imports: [
        FormsModule,
        CommonModule,
        IMFXControlsDateTimePickerModule,
        TranslateModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        RangeDateTimePickerComponent,
    ]
})
export class RangeDateTimePickerModule {
}
