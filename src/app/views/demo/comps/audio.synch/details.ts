
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// IMFX modules
import {IMFXHtmlPlayerModule} from "../../../../modules/controls/html.player";
import {DemoAudioSynchDetailsComponent} from "./audio.synch.details.component";
import { appRouter } from '../../../../constants/appRouter';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: DemoAudioSynchDetailsComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
      DemoAudioSynchDetailsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IMFXHtmlPlayerModule,
        RouterModule.forChild(routes),
    ]
})
export class DemoAudioSynchDetailsModule {
    public static routes = routes;
}
