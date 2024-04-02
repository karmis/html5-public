import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
// components
import { BrandingSearchComponent } from "./branding.search.component";

import {BrandingSearchFormModule} from "./components/search";
import { appRouter } from '../../constants/appRouter';

const routes: Routes = [
    {path: appRouter.empty, component: BrandingSearchComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        BrandingSearchComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        BrandingSearchFormModule // moved to separate module to reuse in settings groups and simple search
    ],
    exports: []
})
export class BrandingSearchModule {
    public static routes = routes;
}
