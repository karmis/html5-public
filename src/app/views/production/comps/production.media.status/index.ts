import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// imfx modules
import { ProductionMediaChangeStatusComponent } from './comp.ts';
import {RouterModule, Routes} from "@angular/router";
import {appRouter} from "../../../../constants/appRouter";
import {IMFXControlsSelect2Module} from "../../../../modules/controls/select2";
import {TranslateModule} from "@ngx-translate/core";

const routes: Routes = [
    {
        path: appRouter.empty,
        component: ProductionMediaChangeStatusComponent,
    }
];

@NgModule({
    declarations: [
        ProductionMediaChangeStatusComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        IMFXControlsSelect2Module
    ],
    exports: [
        // MediaStatusComponent,
    ],
    entryComponents: [
        ProductionMediaChangeStatusComponent
    ]
})
export class ProductionMediaChangeStatusModule {
    public static routes = routes
}
