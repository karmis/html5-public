/**
 * Created by Sergey Trizna on 03.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SearchChartComponent} from './chart';

import {ChartModule} from "../../../modules/controls/chart";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SearchChartComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        ChartModule
    ],
    exports: [
        SearchChartComponent
    ],
    entryComponents: [
    ]
})
export class SearchChartModule {
}
