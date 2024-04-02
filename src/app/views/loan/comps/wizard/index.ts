import {NgModule, Type} from "@angular/core";
import { CommonModule } from "@angular/common";

import { TranslateModule } from "@ngx-translate/core";
import { OverlayModule } from "../../../../modules/overlay";
import { IMFXControlsSelect2Module } from "../../../../modules/controls/select2";
import WizardMediaTableModule from "./comps/media";
import { LoanWizardComponent } from "./wizard";
import WizardNameTableModule from "./comps/names";
import {TaxonomyComponent} from "../../../../modules/search/taxonomy/taxonomy";
import { TaxonomyModule } from "../../../../modules/search/taxonomy";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        LoanWizardComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        WizardMediaTableModule,
        WizardNameTableModule,
        TaxonomyModule
    ],
    // exports: [
    //     LoanWizardComponent
    // ],
    entryComponents: [
        LoanWizardComponent,
    ]
})

export class LoanWizardModule {
    entry: Type<LoanWizardComponent>;

    constructor() {
        this.entry = LoanWizardComponent;
    }
}
