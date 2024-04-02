import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from "@angular/forms";
import { CacheManagerChannelTemplatesModal } from "./cm.ct.modal";
import { IMFXControlsSelect2Module } from '../../../../../../../../modules/controls/select2';
import { CollectionLookupModule } from '../../../../../../../../modules/controls/collection.lookup';
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';


@NgModule({
    declarations: [
        CacheManagerChannelTemplatesModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        CollectionLookupModule,
        DigitOnlyModule,
    ],
    entryComponents: [
        CacheManagerChannelTemplatesModal
    ]
})
export class CacheManagerDestinationDevicesModalModule {
    entry: Type<CacheManagerChannelTemplatesModal>;

    constructor() {
        this.entry = CacheManagerChannelTemplatesModal;
    }
}
