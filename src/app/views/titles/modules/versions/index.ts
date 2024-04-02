import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {VersionsInsideTitlesComponent} from './versions.component';

// For modal
// import {ModalModule} from '../../../../modules/modal';
import {SearchColumnsComponent} from '../../../../modules/search/columns/search.columns';

// Search
import {SearchViewsModule} from '../../../../modules/search/views';
import {SearchFormModule} from '../../../../modules/search/form';
import {SearchThumbsModule} from '../../../../modules/search/thumbs';
import {SearchSettingsModule} from '../../../../modules/search/settings';
import {SearchColumnsModule} from '../../../../modules/search/columns';
import {SlickGridModule} from "../../../../modules/search/slick-grid";
import { IMFXTextDirectionDirectiveModule } from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        VersionsInsideTitlesComponent,
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
        IMFXTextDirectionDirectiveModule
        // ModalModule
    ],
    exports: [
        VersionsInsideTitlesComponent,
        SearchColumnsComponent
    ]
})
export class VersionsInsideTitlesModule {
    // static routes = routes;
}
