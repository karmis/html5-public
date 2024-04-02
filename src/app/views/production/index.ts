import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { ProductionComponent } from './production.component';
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
// async components must be named routes for WebpackAsyncRoute
const routes = [
    {
        path: appRouter.empty,
        component: ProductionComponent,
    }
];

@NgModule({
    declarations: [
        ProductionComponent,
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

    ],
    exports: [],
    entryComponents: [
        SearchColumnsComponent,
    ]
})
export class ProductionModule {
    public static routes = routes;
}
