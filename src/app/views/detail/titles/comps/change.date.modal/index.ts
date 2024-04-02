import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ChangeDateByModalComponent} from "./change.date.modal";
import {IMFXControlsDateTimePickerModule} from "../../../../../modules/controls/datetimepicker";

@NgModule({
    declarations: [
        ChangeDateByModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsDateTimePickerModule
    ],
    entryComponents: [
        ChangeDateByModalComponent
    ]
})
export class ChangeDateByModalModule {
    entry: Type<ChangeDateByModalComponent>;

    constructor() {
        this.entry = ChangeDateByModalComponent;
    }
}
