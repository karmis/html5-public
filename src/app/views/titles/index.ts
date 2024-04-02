import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from "angular-split";
import { TitlesComponent } from "./titles.component";
// Search
import { SearchViewsModule } from "../../modules/search/views";
import { SearchFormModule } from "../../modules/search/form";
import { SearchThumbsModule } from "../../modules/search/thumbs";
import { SearchSettingsModule } from "../../modules/search/settings";
import { SearchColumnsModule } from "../../modules/search/columns";
import { SearchAdvancedModule } from "../../modules/search/advanced";
import { SearchRecentModule } from "../../modules/search/recent";
import { SearchColumnsComponent } from "../../modules/search/columns/search.columns";
// Modules inside titles
import { MediaInsideTitlesModule } from "./modules/media";
import { VersionsInsideTitlesModule } from "./modules/versions";
import { IMFXControlsSelect2Module } from "../../modules/controls/select2";
import { appRouter } from "../../constants/appRouter";
import { SlickGridModule } from "../../modules/search/slick-grid";
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { CarrierInsideTitlesModule } from './modules/carrier';

const routes: Routes = [
    {path: appRouter.empty, component: TitlesComponent},
];

@NgModule({
    declarations: [
        TitlesComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchSettingsModule,
        SearchColumnsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        IMFXControlsSelect2Module,

        // inside
        MediaInsideTitlesModule,
        VersionsInsideTitlesModule,
        IMFXTextDirectionDirectiveModule,
        CarrierInsideTitlesModule
    ],
    exports: [
        TitlesComponent,
        RouterModule
    ],
    entryComponents: [
        TitlesComponent,
        SearchColumnsComponent,
    ]
})
export class TitlesModule {
    public static routes = routes;
}
