
import ItemTableModule from './comps/item.table';
import { NgModule, Type } from '@angular/core';
import { TaxonomyModule } from '../search/taxonomy';
import { CommonModule } from '@angular/common';
import { ChooseItemModalComponent } from './choose.item.modal.component';
import { IMFXControlsSelect2Module } from '../controls/select2';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '../overlay';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ChooseItemModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        ItemTableModule,
        TaxonomyModule,
    ],
    // exports: [
    //     LoanWizardComponent
    // ],
    entryComponents: [
        ChooseItemModalComponent,
    ]
})

export class ChooseItemModalModule {
    entry: Type<ChooseItemModalComponent>;

    constructor() {
        this.entry = ChooseItemModalComponent;
    }
}
