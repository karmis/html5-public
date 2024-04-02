import { EventTableComponent } from "./event.table.component";
import { AngularSplitModule } from "angular-split";
import { AngularResizedEventModule } from "angular-resize-event";
import { SlickGridModule } from "../../../../../modules/search/slick-grid";
import { CommonModule } from "@angular/common";
import { LocalDateModule } from "../../../../../modules/pipes/localDate";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { SearchViewsModule } from "../../../../../modules/search/views";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        EventTableComponent
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        AngularSplitModule,
        SlickGridModule,
        LocalDateModule,
        AngularResizedEventModule,
        SearchViewsModule
    ],
    exports: [
        EventTableComponent
    ]
})
export class EventTableModule {
}
