import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from "angular-split";
import { MisrComponent } from "./misr.component";
// Search
import { SearchViewsModule } from "../../modules/search/views";
import { SearchFormModule } from "../../modules/search/form";
import { SearchSettingsModule } from "../../modules/search/settings";
import { SearchColumnsModule } from "../../modules/search/columns";
import { SearchAdvancedModule } from "../../modules/search/advanced";
import { SearchRecentModule } from "../../modules/search/recent";

import { SearchChartModule } from "../../modules/search/chart";
// For modal
// import {ModalModule} from "../../modules/modal";
import { SearchColumnsComponent } from "../../modules/search/columns/search.columns";
import { appRouter } from "../../constants/appRouter";
import { MisrExpandRowComponent } from "./comps/grid/formatters/expand.row/expand.row.formatter";
import { SlickGridModule } from "../../modules/search/slick-grid";
import { FormsModule } from "@angular/forms";

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {
        path: appRouter.empty, component: MisrComponent,
    }
];

@NgModule({
    declarations: [
        MisrComponent,
        MisrExpandRowComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchColumnsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        SearchChartModule,
        FormsModule,
        // WorkflowListModule
    ],
    entryComponents: [
        SearchColumnsComponent,
        MisrExpandRowComponent,
        // WorkflowListComponent
    ]
})
export class MisrModule {
    static routes = routes;
}
