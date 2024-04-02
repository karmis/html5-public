import {NgModule} from '@angular/core';
import {FlowChartComponent} from "./flow-chart";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [
        FlowChartComponent
    ],
    imports: [
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    exports: [
        FlowChartComponent
    ],
})
export class FlowChartModule {
}
