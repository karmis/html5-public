/**
 * Created by Sergey Trizna on 09.03.2018.
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from "angular-split";
import { WorkflowComponent } from "./workflow.component";
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
// Accordion
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { appRouter } from "../../constants/appRouter";
import { ProgressModule } from "../../modules/controls/progress";
import { SlickGridModule } from "../../modules/search/slick-grid";
import { WorkflowUsersModule } from "./comps/users";
//import {DragDropFormatterModule} from "../../modules/search/slick-grid/formatters/dragdrop";
import { WorkflowExpandRowModule } from "./comps/slickgrid/formatters/expand.row";
import { WorkflowExpandRowComponent } from "./comps/slickgrid/formatters/expand.row/expand.row.formatter";
import { DragDropFormatterModule } from "../../modules/search/slick-grid/formatters/dragdrop";
import { FormsModule } from "@angular/forms";
import { IMFXDropDownDirectiveModule } from "../../directives/dropdown/dropdown.directive.module";
import { NotificationModule } from "../../modules/notification";

const routes: Routes = [
    {
        path: appRouter.empty,
        component: WorkflowComponent
    }
];

@NgModule({
    declarations: [
        WorkflowComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchColumnsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        BsDropdownModule,
        ProgressModule,
        WorkflowUsersModule,
        DragDropFormatterModule,
        WorkflowExpandRowModule,
        FormsModule,
        IMFXDropDownDirectiveModule,
        NotificationModule,
    ],
    exports: [
        // DragDropFormatterComp
    ],
    entryComponents: [
        SearchColumnsComponent,
        // WorkflowWizardPriorityComponent,
        WorkflowExpandRowComponent
        // WorkflowWizardInfoComponent
        // DragDropFormatterComp
    ]
})

export class WorkflowModule {
    public static routes = routes;
}
