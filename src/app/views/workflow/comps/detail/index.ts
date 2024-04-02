import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { TranslateModule } from '@ngx-translate/core';
// component modules
import { WorkflowDetailComponent } from './detail.component';
import { MediaItemComponent } from './comps/media.item/media.item.component';
import { OverlayModule } from '../../../../modules/overlay';
import { appRouter } from '../../../../constants/appRouter';
import { SlickGridModule } from '../../../../modules/search/slick-grid';
import { LocalDateModule } from '../../../../modules/pipes/localDate';
import { FlowChartModule } from '../../../../modules/flow-chart';
import { AngularResizedEventModule } from 'angular-resize-event';
import {TasksControlButtonsModule} from "../../../../modules/search/tasks-control-buttons";
// import {TaskAbortModule} from "../../../../modules/search/tasks-control-buttons/comps/abort.modal";
import {TaskPendingModule} from "../../../../modules/search/tasks-control-buttons/comps/pending.modal";

const routes: Routes = [
    {path: appRouter.empty, component: WorkflowDetailComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkflowDetailComponent,
        MediaItemComponent
    ],
    imports: [
        OverlayModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        SlickGridModule,
        LocalDateModule,
        FlowChartModule,
        AngularResizedEventModule,
        TasksControlButtonsModule,
        // TaskAbortModule,
        TaskPendingModule
    ],
    exports: []
})
export class WorkflowDetailsModule {
    public static routes = routes;
}
