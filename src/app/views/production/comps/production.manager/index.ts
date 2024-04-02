import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

// component modules
import { appRouter } from "../../../../constants/appRouter";
import { AngularSplitModule } from "angular-split";
import { ReactiveFormsModule } from "@angular/forms";
import { ProductionManagerComponent } from './production.manager.component';
import { SearchFormModule } from '../../../../modules/search/form';
import { SearchViewsModule } from '../../../../modules/search/views';
import { SearchSettingsModule } from '../../../../modules/search/settings';
import { SearchAdvancedModule } from '../../../../modules/search/advanced';
import { SearchRecentModule } from '../../../../modules/search/recent';
import { FacetsModule } from '../../../../modules/search/facets1/facets.module';
import { SlickGridModule } from '../../../../modules/search/slick-grid';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: ProductionManagerComponent}
];

@NgModule({
    declarations: [
        ProductionManagerComponent,
    ],
    imports: [

        TranslateModule,
        CommonModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        ReactiveFormsModule,
        SearchFormModule,
        SearchViewsModule,
        SearchSettingsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        FacetsModule,
        SlickGridModule,
    ],
    providers: [
    ],
    exports: [
    ],
    entryComponents: [
    ]
})
export class ProductionManagerModule {
    public static routes = routes;
}
