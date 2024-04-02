/**
 * Created by Sergey Trizna on 13.01.2017.
 */
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// comps
import {DemoComponent} from './demo.component';
import { appRouter } from '../../constants/appRouter';
import {SimplePreviewPlayerModule} from "../../modules/controls/simple.preview.player";
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {FlowChartComponent} from "../../modules/flow-chart/flow-chart";
import {FlowChartModule} from "../../modules/flow-chart";

import {
    GoogleApiModule,
    GoogleApiService,
    GoogleAuthService,
    NgGapiClientConfig,
    NG_GAPI_CONFIG,
    GoogleApiConfig
} from "ng-gapi";
import { BigTreeModule } from './comps/bigtree';

console.log('`DemoComponent` bundle loaded asynchronously');
// async components must be named routes for WebpackAsyncRoute
const routes:Routes = [
    {path: appRouter.empty, component: DemoComponent}
];

let gapiClientConfig: any = {
    client_id: "991039352385-94rp980emi567l2n8aq1sj4ucnt7vki0.apps.googleusercontent.com",
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
    scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.upload'
    ].join(" "),
    client_secret:"2DYFBEsadxrloolUPkSdge0M"
};

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DemoComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        FlowChartModule,
        IMFXTextDirectionDirectiveModule,
        GoogleApiModule.forRoot({
            provide: NG_GAPI_CONFIG,
            useValue: gapiClientConfig
        }),
        BigTreeModule
        // IMFXControlsTreeModule,
    ],
    exports: [
        // IMFXControlsTreeModule
    ]
})
export class DemoModule {
    static routes = routes;
}
