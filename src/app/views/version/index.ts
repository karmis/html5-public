import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { VersionComponent } from './version.component';
// Search
import { SearchViewsModule } from "../../modules/search/views";
import { SearchFormModule } from "../../modules/search/form";
import { SearchThumbsModule } from "../../modules/search/thumbs";
import { SearchSettingsModule } from "../../modules/search/settings";
import { SearchColumnsModule } from "../../modules/search/columns";
import { SearchAdvancedModule } from "../../modules/search/advanced";
import { SearchRecentModule } from "../../modules/search/recent";
// import {ModalModule} from "../../modules/modal";
import { SearchColumnsComponent } from "../../modules/search/columns/search.columns";

import { UploadModule } from "../../modules/upload";

import { BsDropdownModule } from "ngx-bootstrap/dropdown";

import { appRouter } from "../../constants/appRouter";
import { SlickGridModule } from "../../modules/search/slick-grid";
import { VersionWizardModule } from "../../modules/version-wizard";
import { VersionWizardComponent } from "../../modules/version-wizard/wizard";
import { SearchInfoPanelModule } from '../../modules/search/info-panel';
import { FacetsModule } from '../../modules/search/facets1/facets.module';
// async components must be named routes for WebpackAsyncRoute

const routes: Routes = [
    {path: appRouter.empty, component: VersionComponent},
];

@NgModule({
    declarations: [
        VersionComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        FacetsModule,
        SearchSettingsModule,
        SearchColumnsModule,
        // DetailModule,
        SearchInfoPanelModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        BsDropdownModule,
        VersionWizardModule,
        SlickGridModule
    ],
    exports: [RouterModule],
    entryComponents: [
        VersionWizardComponent,
        SearchColumnsComponent,
    ]
})
export class VersionModule {
    // public static routes = routes;
}
