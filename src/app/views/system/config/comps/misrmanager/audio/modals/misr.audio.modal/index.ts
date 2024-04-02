import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from "@angular/forms";
import { IMFXControlsSelect2Module } from '../../../../../../../../modules/controls/select2';
import { MisrAudioModal } from './misr.audio.modal';
import {IMFXControlsDateTimePickerModule} from "../../../../../../../../modules/controls/datetimepicker";

@NgModule({
    declarations: [
        MisrAudioModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        IMFXControlsDateTimePickerModule
    ],
    entryComponents: [
        MisrAudioModal
    ]
})
export class MisrAudioModalModule {
    entry: Type<MisrAudioModal>;

    constructor() {
        this.entry = MisrAudioModal;
    }
}
