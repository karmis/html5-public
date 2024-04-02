import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from "angular-split";
import { WorkOrdersComponent } from "./work.orders.component";
// Search
import { SearchViewsModule } from "../../modules/search/views";
import { SearchFormModule } from "../../modules/search/form";
import { SearchSettingsModule } from "../../modules/search/settings";
import { SearchColumnsModule } from "../../modules/search/columns";
import { SearchAdvancedModule } from "../../modules/search/advanced";
import { SearchRecentModule } from "../../modules/search/recent";
// For modal
// import {ModalModule} from "../../modules/modal";
import { SearchColumnsComponent } from "../../modules/search/columns/search.columns";
import { appRouter } from "../../constants/appRouter";
import { SlickGridModule } from "../../modules/search/slick-grid";
import { FormsModule } from "@angular/forms";
import { MediaItemEllipsisDropdownModule } from '../../modules/controls/mediaItemEllipsisDropdown';
import { WorkOrdersExpandRowModule } from './modules/slickgrid/formatters/expand.row';
import { WorkOrdersExpandRowComponent } from './modules/slickgrid/formatters/expand.row/expand.row.formatter';
import { WorkOrderItemEllipsisDropdownModule } from './modules/slickgrid/elipsis';
import { WorkOrderItemEllipsisDropdownComponent } from './modules/slickgrid/elipsis/work.order.item.ellipsis.dropdown';
import { WorkOrderStatusFormatterComp } from '../../modules/search/slick-grid/formatters/work-order-status/work.order.status.formatter';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {
        path: appRouter.empty, component: WorkOrdersComponent,
    }
];

@NgModule({
    declarations: [
        WorkOrdersComponent
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
        FormsModule,
        WorkOrdersExpandRowModule,
        MediaItemEllipsisDropdownModule,
        WorkOrderItemEllipsisDropdownModule
    ],
    entryComponents: [
        WorkOrdersExpandRowComponent,
        WorkOrderStatusFormatterComp,
        WorkOrderItemEllipsisDropdownComponent,
        SearchColumnsComponent
    ]
})
export class WorkOrdersModule {
    static routes = routes;
}
