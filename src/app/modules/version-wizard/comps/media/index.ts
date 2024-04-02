import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';
import {SearchViewsModule} from "../../../search/views";
import {SearchThumbsModule} from "../../../search/thumbs";
import {IMFXDropDownDirectiveModule} from "../../../../directives/dropdown/dropdown.directive.module";
import {VersionWizardMediaComponent} from "./version.wizard.media.component";
import {SlickGridModule} from "../../../search/slick-grid";

@NgModule({
    declarations: [
        VersionWizardMediaComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        // RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchThumbsModule,
        IMFXDropDownDirectiveModule
    ],
    exports: [
        // IMFXDropDownDirectiveModule,
        VersionWizardMediaComponent
    ],
    entryComponents: [
        VersionWizardMediaComponent
    ]
})
export class VersionWizardMediaModule {
    // static routes = routes;
}
