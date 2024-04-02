/**
 * Created by Sergey Trizna on 22.05.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// comps
import {ReportsComponent} from './reports';
// import { ReportParamsModalComponent } from './report.params';
import {TranslateModule} from '@ngx-translate/core';
import {FilterPipeModule} from '../../modules/pipes/filterPipe';
// import {ModalModule} from '../../modules/modal';
import {PDFViewerModule} from '../../modules/viewers/pdf';
import {OverlayModule} from '../../modules/overlay';
import {appRouter} from '../../constants/appRouter';
import {TGAViewerModule} from '../../modules/viewers/tga';
// import { ReportParamsModalModule } from './modules';
import {IMFXControlsTreeModule} from '../../modules/controls/tree';
// import { ReportParamsModalComponent } from './modules/report.params';
// import { ReportParamsModalModule } from './modules';
import {BaseProfileComponent} from '../base/components/base.profile/base.profile.component';
// import { ReportParamsModalComponent } from './modules/report.params';

const routes: Routes = [
    {path: appRouter.empty, component: ReportsComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ReportsComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        // AngularSplitModule,
        FilterPipeModule,
        PDFViewerModule,
        TGAViewerModule,
        OverlayModule,
        IMFXControlsTreeModule,
    ],
    exports: [
        RouterModule,
        // ReportParamsModalComponent
    ],
    entryComponents: [],
    providers: [BaseProfileComponent],
})
export class ReportsModule {
    public static routes = routes;
}
