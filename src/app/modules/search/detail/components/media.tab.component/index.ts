import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {IMFXMediaTabComponent} from './imfx.media.tab.component';
// For modal
// import {ModalModule} from '../../../../../modules/modal';
import {SearchColumnsComponent} from '../../../../../modules/search/columns/search.columns';
// Search
import {SearchViewsModule} from '../../../../../modules/search/views';
import {SearchFormModule} from '../../../../../modules/search/form';
import {SearchThumbsModule} from '../../../../../modules/search/thumbs';
import {SearchSettingsModule} from '../../../../../modules/search/settings';
import {SearchColumnsModule} from '../../../../../modules/search/columns';
import {SlickGridModule} from "../../../slick-grid";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {MediaItemEllipsisDropdownModule} from "../../../../controls/mediaItemEllipsisDropdown";
import {IMFXDropDownDirectiveModule} from "../../../../../directives/dropdown/dropdown.directive.module";

@NgModule({
    declarations: [
        IMFXMediaTabComponent,
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
        IMFXDropDownDirectiveModule,
        MediaItemEllipsisDropdownModule
        // ModalModule,
    ],
    exports: [
        IMFXMediaTabComponent
    ],
    entryComponents: [
        SearchColumnsComponent
    ]
})
export class IMFXMediaTabModule {
    // static routes = routes;
}

