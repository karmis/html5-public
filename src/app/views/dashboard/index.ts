import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard.component';
import { GLDashboardComponent } from './gl.component';
import { WorkflowsDashComponent } from './comps/workflows/workwlows.dash.component';
import { ChartDashComponent } from './comps/charts/chart.dash.component';
import { GrafanaDashComponent} from './comps/grafana/grafana.dash.component';
import { ChartsModule } from 'ng2-charts';
import { OverlayModule } from '../../modules/overlay';
import { SearchSavedService } from '../../modules/search/saved/services/search.saved.service';
import { appRouter } from '../../constants/appRouter';
import { SlickGridModule } from '../../modules/search/slick-grid';
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {LayoutManagerModule} from "../../modules/controls/layout.manager";
import {SafePipeModule} from "../../modules/pipes/safePipe";

const routes: Routes = [
    {path: appRouter.empty, component: DashboardComponent},
];

@NgModule({
    declarations: [
        DashboardComponent,
        GLDashboardComponent,
        WorkflowsDashComponent,
        ChartDashComponent,
        GrafanaDashComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        ChartsModule,
        OverlayModule,
        SlickGridModule,
        LayoutManagerModule,
        IMFXTextDirectionDirectiveModule,
        SafePipeModule
    ],
    exports: [
        GLDashboardComponent,
        WorkflowsDashComponent,
        ChartDashComponent,
        GrafanaDashComponent
    ],
    providers: [
        SearchSavedService
    ]
})
export class DashboardModule {
    public static routes = routes;
}
