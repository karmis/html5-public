import { NgModule, Type } from '@angular/core';
import { TaxonomyModule } from '../search/taxonomy';
import { CommonModule } from '@angular/common';
import { ProductionSelectVersionModalComponent } from './production.select.version.modal.component';
import { IMFXControlsSelect2Module } from '../controls/select2';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '../overlay';
import ItemTableModule from '../choose.item.modal/comps/item.table';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ProductionSelectVersionModalComponent
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
        ProductionSelectVersionModalComponent,
    ]
})

export class ChooseItemModalModule {
    entry: Type<ProductionSelectVersionModalComponent>;

    constructor() {
        this.entry = ProductionSelectVersionModalComponent;
    }
}
