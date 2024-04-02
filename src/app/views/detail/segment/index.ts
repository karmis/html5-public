import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

// component modules
import {DetailSegmentComponent} from './detail-segment.component';
import {DetailModule} from '../../../modules/search/detail'
import { appRouter } from '../../../constants/appRouter';

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {path: appRouter.empty, component: DetailSegmentComponent, routerPath: appRouter.versions.detail}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DetailSegmentComponent,
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        DetailModule
    ],
    exports: [
    ]
})
export class SegmentDetailModule {
    public static routes = routes;
}
