/**
 * Created by Sergey Trizna on 30.06.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GridStackItemDirective} from 'ng2-gridstack/ng2-gridstack';
import {IMFXGridStack} from "./gridstack";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        GridStackItemDirective,
        IMFXGridStack
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        GridStackItemDirective,
        IMFXGridStack
    ]
})
export class GridStackModule {
}
