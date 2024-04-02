import {RouterModule, Routes} from "@angular/router";
import {appRouter} from "../../../../constants/appRouter";
import {NgModule} from "@angular/core";
import {NamesTreeComponent} from "./names.tree.component";
import {TranslateModule} from "@ngx-translate/core";
import {CommonModule} from "@angular/common";
import {SearchFormModule} from "../../../../modules/search/form";
import {SearchSettingsModule} from "../../../../modules/search/settings";
import {SearchAdvancedModule} from "../../../../modules/search/advanced";
import {SearchRecentModule} from "../../../../modules/search/recent";
import {AngularSplitModule} from "angular-split";
import {IMFXControlsTreeModule} from "../../../../modules/controls/tree";
import {KeysPipeModule} from "../../../../modules/pipes/keysPipe";
import {LocalDateModule} from "../../../../modules/pipes/localDate";
import {IMFXDropDownDirectiveModule} from "../../../../directives/dropdown/dropdown.directive.module";
import {NamesModalModule} from "../../modals/names.modal";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        NamesTreeComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        IMFXControlsTreeModule,
        KeysPipeModule,
        LocalDateModule,
        IMFXDropDownDirectiveModule,
        NamesModalModule,
        FormsModule
    ],
    exports: [
        RouterModule,
        NamesTreeComponent
    ]
})
export class NamesTreeModule {

}
