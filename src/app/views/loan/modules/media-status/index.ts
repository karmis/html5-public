import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IMFXHtmlPlayerModule} from '../html.player/index'
// imfx modules
import {MediaChangeStatusComponent} from './comp.ts';
import {RouterModule, Routes} from "@angular/router";
import {appRouter} from "../../../../constants/appRouter";
import {IMFXControlsSelect2Module} from "../../../../modules/controls/select2";
import {TranslateModule} from "@ngx-translate/core";

const routes: Routes = [
    {
        path: appRouter.empty,
        component: MediaChangeStatusComponent,
    }
];

@NgModule({
    declarations: [
        MediaChangeStatusComponent,
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
        MediaChangeStatusComponent
    ]
})
export class MediaChangeStatusModule {
    public static routes = routes
}
