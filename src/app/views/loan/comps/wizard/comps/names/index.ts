import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

import { WizardNameTableComponent } from "./wizard.name.table.component";
import { SlickGridModule } from "../../../../../../modules/search/slick-grid";
import { SearchViewsModule } from "../../../../../../modules/search/views";
import { SearchThumbsModule } from "../../../../../../modules/search/thumbs";
import { FocusDirectiveModule } from "../../../../../../directives/focus/focus.module";
import { IMFXDropDownDirectiveModule } from "../../../../../../directives/dropdown/dropdown.directive.module";
import { IMFXControlsTreeComponent } from "../../../../../../modules/controls/tree/imfx.tree";
import { IMFXControlsTreeModule } from "../../../../../../modules/controls/tree";

@NgModule({
    declarations: [
        WizardNameTableComponent,
        // IMFXControlsTreeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchThumbsModule,
        IMFXDropDownDirectiveModule,
        FocusDirectiveModule,
        IMFXControlsTreeModule
    ],
    exports: [
        IMFXDropDownDirectiveModule,
        WizardNameTableComponent
    ]
})
export default class WizardNameTableModule {
}
