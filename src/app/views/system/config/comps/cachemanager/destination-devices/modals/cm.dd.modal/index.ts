import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {CacheManagerDestinationDevicesModal} from "./cm.dd.modal";
import { IMFXControlsSelect2Module } from '../../../../../../../../modules/controls/select2';
import { DigitOnlyModule } from 'app/directives/digit-only/digit-only.module';



@NgModule({
    declarations: [
        CacheManagerDestinationDevicesModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        DigitOnlyModule
    ],
    entryComponents: [
        CacheManagerDestinationDevicesModal
    ]
})
export class CacheManagerDestinationDevicesModalModule {
    entry: Type<CacheManagerDestinationDevicesModal>;

    constructor() {
        this.entry = CacheManagerDestinationDevicesModal;
    }
}
