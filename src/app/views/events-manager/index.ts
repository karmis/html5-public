import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';
import {EventsManagerComponent} from "./events.manager";
import { appRouter } from '../../constants/appRouter';
import { AngularSplitModule } from 'angular-split';
import { SearchAdvancedModule } from '../../modules/search/advanced';
import { SearchViewsModule } from '../../modules/search/views';
import { SearchFormModule } from '../../modules/search/form';
import { SearchRecentModule } from '../../modules/search/recent';
import { SearchInfoPanelModule } from '../../modules/search/info-panel';
import { SlickGridModule } from '../../modules/search/slick-grid';
import { FacetsModule } from '../../modules/search/facets1/facets.module';
import { SearchSettingsModule } from '../../modules/search/settings';

console.log('`Events Management` bundle loaded asynchronously');
// async views must be named routes for WebpackAsyncRoute
const routes: Routes = [
    { path: appRouter.empty, component: EventsManagerComponent },
];

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    EventsManagerComponent
  ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        SearchAdvancedModule,
        SearchViewsModule,
        SearchFormModule,
        SearchRecentModule,
        SearchInfoPanelModule,
        SlickGridModule,
        FacetsModule,
        SearchSettingsModule
    ]
})
export class EventsManagerModule {
  public static routes = routes;
}
