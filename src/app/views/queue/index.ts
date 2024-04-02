import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import {AngularSplitModule} from "angular-split";
import {FormsModule} from "@angular/forms";
import {OverlayModule} from "../../modules/overlay";
// Search
import {SearchViewsModule} from "../../modules/search/views";
import {SearchFormModule} from "../../modules/search/form";
import {SearchSettingsModule} from "../../modules/search/settings";
import {SearchColumnsModule} from "../../modules/search/columns";
import {SearchAdvancedModule} from "../../modules/search/advanced";
import {SearchRecentModule} from "../../modules/search/recent";
import {DetailModule} from "../../modules/search/detail";
// Queue
import {QueueComponent} from "./queue.component";
import {QueueParamsComponent} from "./components/queue.params.component/queue.params.component";
// For modal
// import {ModalModule} from "../../modules/modal";
import {SearchColumnsComponent} from "../../modules/search/columns/search.columns";
import { appRouter } from '../../constants/appRouter';
import {SlickGridModule} from "../../modules/search/slick-grid";
import {OrderByModule} from "../../modules/pipes/orderBy";

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {
        path: appRouter.empty, component: QueueComponent,
    }
];

@NgModule({
    declarations: [
        QueueComponent,
        QueueParamsComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        FormsModule,
        SearchViewsModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchColumnsModule,
        DetailModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        OverlayModule,
        SlickGridModule,
        OrderByModule
    ],
    exports: [],
    entryComponents: [
        SearchColumnsComponent
    ]
})

export class QueueModule {
    public static routes = routes;
}
