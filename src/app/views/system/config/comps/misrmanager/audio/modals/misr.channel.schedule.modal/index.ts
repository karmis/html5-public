import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from "@angular/forms";
import { MisrChannelScheduleModal } from './misr.channel.schedule.modal';
import { IMFXControlsSelect2Module } from 'app/modules/controls/select2';
import { IMFXControlsDateTimePickerModule } from 'app/modules/controls/datetimepicker';
import { CollectionLookupsModule } from 'app/modules/controls/collection.lookups';
import { CollectionLookupModule } from 'app/modules/controls/collection.lookup';

@NgModule({
    declarations: [
        MisrChannelScheduleModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        IMFXControlsDateTimePickerModule,
        CollectionLookupsModule,
        CollectionLookupModule
    ],
    entryComponents: [
        MisrChannelScheduleModal
    ]
})
export class MisrChannelScheduleModalModule {
    entry: Type<MisrChannelScheduleModal>;

    constructor() {
        this.entry = MisrChannelScheduleModal;
    }
}
