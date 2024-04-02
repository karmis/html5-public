import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { SearchViewsModule } from '../../modules/search/views';
import { SearchFormModule } from '../../modules/search/form';
import { SearchSettingsModule } from '../../modules/search/settings';
import { SearchColumnsModule } from '../../modules/search/columns';
import { SearchAdvancedModule } from '../../modules/search/advanced';
import { SearchRecentModule } from '../../modules/search/recent';

import { SearchChartModule } from '../../modules/search/chart';
import { SearchColumnsComponent } from '../../modules/search/columns/search.columns';
import { appRouter } from '../../constants/appRouter';
import { CacheManagerExpandRowComponent } from './comps/grid/formatters/expand.row/expand.row.formatter';
import { SlickGridModule } from '../../modules/search/slick-grid';
import { CacheManagerComponent } from './cachemanager.component';
import { CacheManagerStatusModule } from './modules/status';


const routes: Routes = [
    {path: appRouter.empty, component: CacheManagerComponent},
];

@NgModule({
    declarations: [
        CacheManagerComponent,
        CacheManagerExpandRowComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchColumnsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        SearchChartModule,
        // ModalModule,
        CacheManagerStatusModule
    ],
    entryComponents: [
        SearchColumnsComponent,
        CacheManagerExpandRowComponent
    ]
})
export class CacheManagerModule {
    public static routes = routes;
}
