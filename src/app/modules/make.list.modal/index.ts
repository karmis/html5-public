
import { NgModule, Type } from '@angular/core';
import { TaxonomyModule } from '../search/taxonomy';
import { CommonModule } from '@angular/common';
import { IMFXControlsSelect2Module } from '../controls/select2';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '../overlay';
import { MakeListModalComponent } from "./make.list.modal.component";
import { FormsModule } from "@angular/forms";
import { IMFXControlsDateTimePickerModule } from "../controls/datetimepicker";


@NgModule({
    declarations: [
        MakeListModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        TaxonomyModule,
        FormsModule,
        IMFXControlsDateTimePickerModule,
    ],
    // exports: [
    //     LoanWizardComponent
    // ],
    entryComponents: [
        MakeListModalComponent,
    ]
})

export class MakeListModalModule {
    entry: Type<MakeListModalComponent>;

    constructor() {
        this.entry = MakeListModalComponent;
    }
}
