import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
// Search
import { SearchViewsModule } from '../../modules/search/views';
import { SearchFormModule } from '../../modules/search/form';
import { SearchThumbsModule } from '../../modules/search/thumbs';
import { SearchSettingsModule } from '../../modules/search/settings';
import { SearchColumnsModule } from '../../modules/search/columns';
import { SearchAdvancedModule } from '../../modules/search/advanced';
import { SearchRecentModule } from '../../modules/search/recent';
import { SearchColumnsComponent } from '../../modules/search/columns/search.columns';
import { UploadModule } from '../../modules/upload';
import { appRouter } from '../../constants/appRouter';
import { SlickGridModule } from '../../modules/search/slick-grid';
import { SupplierPortalComponent } from './supplier.portal.component';
import MediaInsideSupplierPortalModule from './modules/media-inside-supplier-portal';
import { VersionWizardComponent } from '../../modules/version-wizard/wizard';
import { VersionWizardModule } from '../../modules/version-wizard';
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { SearchInfoPanelModule } from '../../modules/search/info-panel';
import {FacetsModule} from "../../modules/search/facets1/facets.module";
// async components must be named routes for WebpackAsyncRoute

const routes: Routes = [
    {
        path: appRouter.empty,
        component: SupplierPortalComponent,
    }
];

@NgModule({
    declarations: [
        SupplierPortalComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
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
        // ModalModule,
        // UploadModule,
        // BsDropdownModule,
        VersionWizardModule,
        SlickGridModule,
        MediaInsideSupplierPortalModule,
        IMFXTextDirectionDirectiveModule,
    ],
    exports: [
        RouterModule
    ],
    entryComponents: [
        SupplierPortalComponent,
        VersionWizardComponent,
        SearchColumnsComponent,
    ]
})

export class SupplierPortalModule {
    public static routes = routes;
}
