import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

// component modules
import {MediaDetailComponent} from './detail.component';
import {DetailModule} from '../../../modules/search/detail';
import {SearchThumbsModule} from '../../../modules/search/thumbs';
import { appRouter } from '../../../constants/appRouter';

// async components must be named routes for WebpackAsyncRoute
const routes:Routes = [
    {path: appRouter.empty, component: MediaDetailComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MediaDetailComponent,
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        DetailModule,
        SearchThumbsModule
    ],
    exports: [
    ]
})
export class MediaDetailModule {
    public static routes = routes;
}
