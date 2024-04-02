import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from "@angular/forms";
import { IMFXControlsSelect2Module } from '../../../../../../../../modules/controls/select2';
import { MisrComponentsModal } from './misr.components.modal';


@NgModule({
    declarations: [
        MisrComponentsModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
    ],
    entryComponents: [
        MisrComponentsModal
    ]
})
export class MisrComponentsModalModule {
    entry: Type<MisrComponentsModal>;

    constructor() {
        this.entry = MisrComponentsModal;
    }
}
