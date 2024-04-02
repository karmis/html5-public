import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// comps
import {DemoMSEComponent} from './video.component';
// IMFX modules
import {IMFXHtmlPlayerModule} from "../../../../modules/controls/html.player";
import {appRouter} from '../../../../constants/appRouter';
import {IMFXTextDirectionDirectiveModule} from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

console.log('`DemoMSEComponent` bundle loaded asynchronously');
// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: DemoMSEComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DemoMSEComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IMFXHtmlPlayerModule,
        RouterModule.forChild(routes),
        IMFXTextDirectionDirectiveModule
    ]
})
export class DemoMSEModule {
    public static routes = routes;
}
