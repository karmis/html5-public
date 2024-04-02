// async components must be named routes for WebpackAsyncRoute
import { CommonModule } from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from "@angular/router";
import { SafePipeModule } from "../../modules/pipes/safePipe";
import { IMFXNotAvailableModule } from "../../modules/controls/not.available.comp";
import { OverlayModule } from "../../modules/overlay";
import { NgModule } from "@angular/core";
import { WorkflowDesignerComponent } from "./comp";
import { appRouter } from '../../constants/appRouter';

const routes: Routes = [
    {path: appRouter.empty, component: WorkflowDesignerComponent},
];

@NgModule({
    declarations: [
        WorkflowDesignerComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SafePipeModule,
        IMFXNotAvailableModule,
        OverlayModule
    ],
})
export class WorkflowDesignerModule {
    public static routes = routes;
}
