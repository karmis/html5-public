/**
 * Created by Sergey Trizna on 13.01.2017.
 */
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// comps
import {DemoXmlComponent} from './xml.component';

// IMFX modules
import {IMFXControlsTreeModule} from '../../../../modules/controls/tree';
import {IMFXXMLTreeModule} from "../../../../modules/controls/xml.tree";
import { appRouter } from '../../../../constants/appRouter';
import { IMFXTextDirectionDirectiveModule } from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

console.log('`DemoXmlComponent` bundle loaded asynchronously');
// async components must be named routes for WebpackAsyncRoute
const routes:Routes = [
    {path: appRouter.empty, component: DemoXmlComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DemoXmlComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        IMFXXMLTreeModule,
        IMFXTextDirectionDirectiveModule
    ]
})
export class DemoTreeModule {
    public static routes = routes;
}
