import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { CarrierComponent } from './carrier.component';
// Search
import { SearchViewsModule } from '../../modules/search/views';
import { SearchFormModule } from '../../modules/search/form';
import { SearchThumbsModule } from '../../modules/search/thumbs';
import { SearchSettingsModule } from '../../modules/search/settings';
import { SearchColumnsModule } from '../../modules/search/columns';
import { SearchAdvancedModule } from '../../modules/search/advanced';
import { SearchRecentModule } from '../../modules/search/recent';
import { DetailModule } from '../../modules/search/detail';
// import {ModalModule} from '../../modules/modal';
import { SearchColumnsComponent } from '../../modules/search/columns/search.columns';
import { appRouter } from '../../constants/appRouter';
import { SlickGridModule } from '../../modules/search/slick-grid';
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { FacetsModule } from '../../modules/search/facets1/facets.module';

const routes: Routes = [
    {path: appRouter.empty, component: CarrierComponent},
];

@NgModule({
    declarations: [
        CarrierComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchSettingsModule,
        SearchColumnsModule,
        DetailModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        RouterModule
    ],
    entryComponents: [
        SearchColumnsComponent
    ]
})
export class CarrierModule {
    public static routes = routes;
}
