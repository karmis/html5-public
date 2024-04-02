import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

// component modules
import {DetailComponent} from './detail.component';
import {DetailModule} from '../../../modules/search/detail'
import { appRouter } from '../../../constants/appRouter';

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {path: appRouter.empty, component: DetailComponent, routerPath: appRouter.versions.detail}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DetailComponent,
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
export class VersionDetailModule {
    public static routes = routes;
}
