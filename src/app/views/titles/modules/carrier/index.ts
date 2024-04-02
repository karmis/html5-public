import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';

// For modal
// import {ModalModule} from "../../../../modules/modal";
import {SearchColumnsComponent} from "../../../../modules/search/columns/search.columns";
// Search
import {SearchViewsModule} from "../../../../modules/search/views";
import {SearchFormModule} from "../../../../modules/search/form";
import {SearchThumbsModule} from "../../../../modules/search/thumbs";
import {SearchSettingsModule} from "../../../../modules/search/settings";
import {SearchColumnsModule} from "../../../../modules/search/columns";
import {SlickGridModule} from "../../../../modules/search/slick-grid";
import { IMFXTextDirectionDirectiveModule } from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {MediaItemEllipsisDropdownModule} from "../../../../modules/controls/mediaItemEllipsisDropdown";
import { CarrierInsideTitlesComponent } from './carrier-inside-titles.component';


@NgModule({
    declarations: [
        CarrierInsideTitlesComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchSettingsModule,
        SearchColumnsModule,
        IMFXTextDirectionDirectiveModule,
        MediaItemEllipsisDropdownModule
        // ModalModule,
    ],
    exports: [
        CarrierInsideTitlesComponent
    ],
    entryComponents: [
        SearchColumnsComponent
    ]
})
export class CarrierInsideTitlesModule {
    // static routes = routes;
}
