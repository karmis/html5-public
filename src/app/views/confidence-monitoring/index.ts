import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { appRouter } from '../../constants/appRouter';
import {ConfidenceMonitoringComponent} from "./confidence.monitoring.component";

const routes: Routes = [
    {path: appRouter.empty, component: ConfidenceMonitoringComponent},
];

@NgModule({
    declarations: [
        ConfidenceMonitoringComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        RouterModule
    ],
    exports: [
        ConfidenceMonitoringComponent
    ]
})
export class ConfidenceMonitoringModule {
}
