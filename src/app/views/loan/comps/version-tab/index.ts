import { NgModule } from '@angular/core';


import { VersionTabComponent } from "./version-tab.component";
import { appRouter } from "../../../../constants/appRouter";
import { Routes } from "@angular/router";
import { SlickGridModule } from "../../../../modules/search/slick-grid";
import { SearchViewsModule } from "../../../../modules/search/views";
import { CommonModule } from "@angular/common";

const routes: Routes = [
    {path: appRouter.empty, component: VersionTabComponent},
];

@NgModule({
    declarations: [
        VersionTabComponent,
    ],
    imports: [
        SlickGridModule,
        SearchViewsModule,
        CommonModule
    ],
    exports: [
        VersionTabComponent
    ],
    entryComponents: [
    ]
})
export class VersionTabModule {
    public static routes = routes;
}
