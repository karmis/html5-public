/**
 * Created by Sergey Trizna on 13.01.2017.
 */
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
// comps
import {SystemConfigXmlComponent} from './xml.component';
// IMFX modules
import {IMFXXMLTreeModule} from "../../../../../modules/controls/xml.tree/";
import {IMFXSimpleTreeModule} from "../../../../../modules/controls/simple.tree";
import {OverlayModule} from "../../../../../modules/overlay";
import {IMFXSchemaTreeModule} from "./components/schema.tree";

console.log('`SystemConfigXmlComponent` bundle loaded asynchronously');
// async components must be named routes for WebpackAsyncRoute
// const routes = [
// {path: '', component: SystemConfigXmlComponent, routerPath: 'system/config/xml'}
// ];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SystemConfigXmlComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        OverlayModule,
        // RouterModule.forChild(routes),
        IMFXXMLTreeModule,
        IMFXSimpleTreeModule,
        IMFXSchemaTreeModule
    ],
    exports: [
        SystemConfigXmlComponent
    ]
})
export default class SystemConfigXmlModule {
    // static routes = routes;
}
