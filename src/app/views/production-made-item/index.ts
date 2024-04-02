import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';

import {IMFXDropDownDirectiveModule} from '../../directives/dropdown/dropdown.directive.module';
// imfx
import {SearchViewsModule} from '../../modules/search/views';
import {SearchFormModule} from '../../modules/search/form';
import {SearchThumbsModule} from '../../modules/search/thumbs';
import {SearchColumnsModule} from '../../modules/search/columns';

import {SearchAdvancedModule} from '../../modules/search/advanced';
import {SearchSettingsModule} from '../../modules/search/settings';
import {SearchRecentModule} from '../../modules/search/recent';
// For modal
// import { ModalModule } from '../../modules/modal';
import {SearchColumnsComponent} from '../../modules/search/columns/search.columns';
import {appRouter} from '../../constants/appRouter';
import {SlickGridModule} from '../../modules/search/slick-grid';
import {IMFXModalModule} from "../../modules/imfx-modal";
import {MediaItemEllipsisDropdownModule} from "../../modules/controls/mediaItemEllipsisDropdown";
import {SearchGroupModule} from '../../modules/search/group';
import {SearchProductionInfoPanelModule} from './comps/info-panel';
import {ProductionMadeItemComponent} from './production.made.item.component';

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {
        path: appRouter.empty,
        component: ProductionMadeItemComponent,
    }
];

@NgModule({
    declarations: [
        ProductionMadeItemComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchColumnsModule,
        SearchSettingsModule,
        // DetailModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        IMFXDropDownDirectiveModule,
        IMFXModalModule,
        MediaItemEllipsisDropdownModule,
        SearchGroupModule,
        SearchProductionInfoPanelModule,

    ],
    exports: [],
    entryComponents: [
        SearchColumnsComponent,
        ProductionMadeItemComponent
    ]
})
export class ProductionMadeItemModule {
    public static routes = routes;
}
