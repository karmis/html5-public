import { NgModule } from '@angular/core';


import { CarriersTabComponent } from "./carriers-tab.component";
import { appRouter } from "../../../../constants/appRouter";
import { Routes } from "@angular/router";
import { SlickGridModule } from "../../../../modules/search/slick-grid";
import { SearchViewsModule } from "../../../../modules/search/views";
import { CommonModule } from "@angular/common";

const routes: Routes = [
    {path: appRouter.empty, component: CarriersTabComponent},
];

@NgModule({
    declarations: [
        CarriersTabComponent,
    ],
    imports: [
        SlickGridModule,
        SearchViewsModule,
        CommonModule
    ],
    exports: [
        CarriersTabComponent
    ],
    entryComponents: [
    ]
})
export class CarriersTabModule {
    public static routes = routes;
}
