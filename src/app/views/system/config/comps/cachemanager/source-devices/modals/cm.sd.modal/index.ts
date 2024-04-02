import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {CacheManagerSourceDevicesModal} from "./cm.sd.modal";
import { IMFXControlsSelect2Module } from '../../../../../../../../modules/controls/select2';
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';


@NgModule({
    declarations: [
        CacheManagerSourceDevicesModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        DigitOnlyModule,
    ],
    entryComponents: [
        CacheManagerSourceDevicesModal
    ]
})
export class CacheManagerDestinationDevicesModalModule {
    entry: Type<CacheManagerSourceDevicesModal>;

    constructor() {
        this.entry = CacheManagerSourceDevicesModal;
    }
}
