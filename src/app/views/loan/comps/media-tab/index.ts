import { NgModule } from '@angular/core';
import { Routes } from "@angular/router";

import { MediaTabComponent } from "./media-tab.component";
import { appRouter } from "../../../../constants/appRouter";
import { SlickGridModule } from "../../../../modules/search/slick-grid";
import { SearchViewsModule } from "../../../../modules/search/views";
import { CommonModule } from "@angular/common";

const routes: Routes = [
    {path: appRouter.empty, component: MediaTabComponent},
];

@NgModule({
    declarations: [
        MediaTabComponent,
    ],
    imports: [
        SlickGridModule,
        SearchViewsModule,
        CommonModule
    ],
    exports: [
        MediaTabComponent
    ],
    entryComponents: [
    ]
})
export class MediaTabModule {
    public static routes = routes;
}
