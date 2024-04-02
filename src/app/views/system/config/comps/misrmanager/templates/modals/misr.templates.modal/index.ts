import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import { IMFXControlsSelect2Module } from '../../../../../../../../modules/controls/select2';
import { MisrTemplatesModal } from './misr.templates.modal';
import { CollectionLookupModule } from '../../../../../../../../modules/controls/collection.lookup';
import { IMFXControlsDateTimePickerModule } from '../../../../../../../../modules/controls/datetimepicker';
import { CollectionLookupsModule } from '../../../../../../../../modules/controls/collection.lookups';


@NgModule({
    declarations: [
        MisrTemplatesModal
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        CollectionLookupModule,
        IMFXControlsDateTimePickerModule,
        CollectionLookupsModule,
    ],
    entryComponents: [
        MisrTemplatesModal
    ]
})
export class MisrTemplatesModalModule {
    entry: Type<MisrTemplatesModal>;

    constructor() {
        this.entry = MisrTemplatesModal;
    }
}
