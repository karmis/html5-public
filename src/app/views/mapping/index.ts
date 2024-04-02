import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
// Search
import {SearchViewsModule} from '../../modules/search/views';
import {SearchFormModule} from '../../modules/search/form';
import {SearchThumbsModule} from '../../modules/search/thumbs';
import {SearchSettingsModule} from '../../modules/search/settings';
import {SearchColumnsModule} from '../../modules/search/columns';
import {SearchAdvancedModule} from '../../modules/search/advanced';
import {SearchRecentModule} from '../../modules/search/recent';
import {SearchColumnsComponent} from '../../modules/search/columns/search.columns';
import {UploadModule} from '../../modules/upload';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {appRouter} from '../../constants/appRouter';
import {SlickGridModule} from '../../modules/search/slick-grid';
import {MappingComponent} from './mapping.component';
import {MediaInsideMappingModule} from './modules/media-inside-mapping';
import {VersionWizardComponent} from '../../modules/version-wizard/wizard';
import {VersionWizardModule} from '../../modules/version-wizard';
import {IMFXTextDirectionDirectiveModule} from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {SearchInfoPanelModule} from '../../modules/search/info-panel';
import {FacetsModule} from '../../modules/search/facets1/facets.module';

const routes: Routes = [
    {
        path: appRouter.empty,
        component: MappingComponent,
    }
];

@NgModule({
    declarations: [
        MappingComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchSettingsModule,
        FacetsModule,
        SearchColumnsModule,
        // DetailModule,
        SearchInfoPanelModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        // UploadModule,
        BsDropdownModule,
        VersionWizardModule,
        SlickGridModule,
        MediaInsideMappingModule,
        IMFXTextDirectionDirectiveModule,
    ],
    exports: [
        // RouterModule
    ],
    entryComponents: [
        MappingComponent,
        VersionWizardComponent,
        SearchColumnsComponent,
    ]
})

export class MappingModule {
    public static routes = routes;
}
