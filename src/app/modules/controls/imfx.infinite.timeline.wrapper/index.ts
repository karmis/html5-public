import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';
import {IMFXInfiniteTimelineWrapperComponent} from "./imfx.infinite.timeline.wrapper";
import {IMFXInfiniteTimelineModule} from "../imfx.infinite.timeline";
import {IMFXControlsDateTimePickerModule} from "../datetimepicker";

@NgModule({
    declarations: [
        IMFXInfiniteTimelineWrapperComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        IMFXInfiniteTimelineModule,
        IMFXControlsDateTimePickerModule
    ],
    exports: [
        IMFXInfiniteTimelineWrapperComponent,
    ],
    entryComponents: []
})
export class IMFXInfiniteTimelineWrapperModule {
}
