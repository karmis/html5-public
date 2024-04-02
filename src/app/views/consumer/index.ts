import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import { IMFXControlsDateTimePickerModule } from '../../modules/controls/datetimepicker';
import { IMFXHtmlPlayerModule } from '../../modules/controls/html.player';
import { IMFXSubtitlesGridModule } from '../../modules/search/detail/components/subtitles.grid.component';
// components
import { ConsumerSearchComponent } from './consumer.search.component';
import { ConsumerDetailModule } from './components/consumer.detail';
import { ConsumerItemModule } from './components/consumer.item';

import { GridStackModule } from '../../modules/controls/gridstack';
import { OverlayModule } from '../../modules/overlay';
import { BrandingSearchFormModule } from '../branding/components/search';
import { appRouter } from '../../constants/appRouter';
import { SearchFormBrandingModule } from '../../modules/search/form-branding';
import { FacetsModule } from '../../modules/search/facets1/facets.module';

// async components must be named routes for WebpackAsyncRoute

const routes: Routes = [
    {path: appRouter.empty, component: ConsumerSearchComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ConsumerSearchComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        IMFXControlsDateTimePickerModule,
        IMFXSubtitlesGridModule,
        IMFXHtmlPlayerModule,
        TranslateModule,
        ReactiveFormsModule,
        FormsModule,
        SearchFormBrandingModule,
        BrandingSearchFormModule,
        ConsumerDetailModule,
        ConsumerItemModule,
        GridStackModule,
        // SearchRecentModule,
        OverlayModule,
        FacetsModule,
    ],
    exports: [
        // RouterModule
        // BrandingSearchComponent,
        // ConsumerItemSettingsComponent
    ]
})
export class ConsumerModule {
    public static routes = routes;
}
