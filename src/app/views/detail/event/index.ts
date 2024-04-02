import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { TranslateModule } from '@ngx-translate/core';
// component modules
import { OverlayModule } from '../../../modules/overlay';
import { appRouter } from '../../../constants/appRouter';
import { SlickGridModule } from '../../../modules/search/slick-grid';
import { LocalDateModule } from '../../../modules/pipes/localDate';
import { AngularResizedEventModule } from 'angular-resize-event';
import { EventRequestDetailComponent } from './detail.component';
import {SearchViewsModule} from "../../../modules/search/views";
import { EventTableModule } from "./components/event.table";
import { MultiEventTableModule } from "./components/multi.event.table";
import { ProductionInfoTabModule } from "../../../modules/search/detail/components/production.info.tab.component";

const routes: Routes = [
    {path: appRouter.empty, component: EventRequestDetailComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        EventRequestDetailComponent
    ],
    imports: [
        OverlayModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        SlickGridModule,
        LocalDateModule,
        AngularResizedEventModule,
        SearchViewsModule,
        EventTableModule,
        MultiEventTableModule,
        ProductionInfoTabModule
    ],
    exports: []
})
export class EventRequestDetailsModule {
    public static routes = routes;
}
