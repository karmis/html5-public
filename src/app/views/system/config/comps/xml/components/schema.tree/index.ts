import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {TranslateModule} from "@ngx-translate/core";

import {IMFXSchemaTreeComponent} from "./schema.tree.component";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXSchemaTreeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        IMFXSchemaTreeComponent
    ]
})
export class IMFXSchemaTreeModule {
    // static routes = routes;
}
