import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { LoanComponent } from './loan.component';
import { IMFXDropDownDirectiveModule } from '../../directives/dropdown/dropdown.directive.module';
// imfx
import { SearchViewsModule } from '../../modules/search/views';
import { SearchFormModule } from '../../modules/search/form';
import { SearchThumbsModule } from '../../modules/search/thumbs';
import { SearchColumnsModule } from '../../modules/search/columns';

import { SearchAdvancedModule } from '../../modules/search/advanced';
import { SearchSettingsModule } from '../../modules/search/settings';
import { SearchRecentModule } from '../../modules/search/recent';
// For modal
// import { ModalModule } from '../../modules/modal';
import { SearchColumnsComponent } from '../../modules/search/columns/search.columns';
import { appRouter } from '../../constants/appRouter';
import { SlickGridModule } from '../../modules/search/slick-grid/index';
import { IMFXModalModule } from "../../modules/imfx-modal/index";
import { MediaItemEllipsisDropdownModule } from "../../modules/controls/mediaItemEllipsisDropdown/index";
import { SearchInfoPanelModule } from '../../modules/search/info-panel';
import { FacetsModule } from '../../modules/search/facets1/facets.module';
import { VersionTabModule } from "./comps/version-tab";
import { MediaTabModule } from "./comps/media-tab";
import { CarriersTabModule } from "./comps/carriers-tab";

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {
        path: appRouter.empty,
        component: LoanComponent,
    }
];

@NgModule({
    declarations: [
        LoanComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        FacetsModule,
        SearchColumnsModule,
        SearchSettingsModule,
        // DetailModule,
        SearchInfoPanelModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        IMFXDropDownDirectiveModule,
        IMFXModalModule,
        MediaItemEllipsisDropdownModule,
        VersionTabModule,
        MediaTabModule,
        CarriersTabModule

    ],
    exports: [],
    entryComponents: [
        SearchColumnsComponent,
    ]
})
export class LoanModule {
    public static routes = routes;
}
