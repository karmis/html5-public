import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { MediaInsideSupplierPortalComponent } from './media.component';
import { IMFXDropDownDirectiveModule } from '../../../../directives/dropdown/dropdown.directive.module';

// imfx
import { SearchViewsModule } from '../../../../modules/search/views';
import { SearchFormModule } from '../../../../modules/search/form';
import { SearchThumbsModule } from '../../../../modules/search/thumbs';
import { SearchColumnsModule } from '../../../../modules/search/columns';

import { SearchAdvancedModule } from '../../../../modules/search/advanced';
import { SearchSettingsModule } from '../../../../modules/search/settings';
import { SearchRecentModule } from '../../../../modules/search/recent';
import { DetailModule } from '../../../../modules/search/detail';

// For modal
// import { ModalModule } from '../../../../modules/modal';
import { SearchColumnsComponent } from '../../../../modules/search/columns/search.columns';
// import { appRouter } from '../../../../constants/appRouter';
import { SlickGridModule } from '../../../../modules/search/slick-grid';
import { FormsModule } from '@angular/forms';
import {MediaItemEllipsisDropdownModule} from "../../../../modules/controls/mediaItemEllipsisDropdown";


@NgModule({
    declarations: [
        MediaInsideSupplierPortalComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchColumnsModule,
        SearchSettingsModule,
        DetailModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        IMFXDropDownDirectiveModule,
        MediaItemEllipsisDropdownModule
    ],
    exports: [
        MediaInsideSupplierPortalComponent
    ],
    entryComponents: [
        MediaInsideSupplierPortalComponent,
        SearchColumnsComponent
    ]
})
export default class MediaInsideSupplierPortalModule {
    // static routes = routes;
}
