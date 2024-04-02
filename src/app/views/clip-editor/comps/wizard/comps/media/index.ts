import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {SearchViewsModule} from "../../../../../../modules/search/views";
import {SearchThumbsModule} from "../../../../../../modules/search/thumbs";
import {IMFXDropDownDirectiveModule} from "../../../../../../directives/dropdown/dropdown.directive.module";
import {WizardMediaTableComponent} from "./wizard.media.table.component";
import {FormsModule} from "@angular/forms";
import {SlickGridModule} from "../../../../../../modules/search/slick-grid";
import {FocusDirectiveModule} from "../../../../../../directives/focus/focus.module";

@NgModule({
    declarations: [
        WizardMediaTableComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchThumbsModule,
        IMFXDropDownDirectiveModule,
        FocusDirectiveModule
    ],
    exports: [
        IMFXDropDownDirectiveModule,
        WizardMediaTableComponent
    ]
})
export class WizardMediaTableModule {
}
