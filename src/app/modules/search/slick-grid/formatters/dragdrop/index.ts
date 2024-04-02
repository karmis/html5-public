/**
 * Created by Sergey Trizna on 30.03.2018.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DragDropFormatterComp} from "./dragdrop.comp";
@NgModule({
    declarations: [
        DragDropFormatterComp,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        DragDropFormatterComp,
    ],
    entryComponents: [
        DragDropFormatterComp
    ]
})
export class DragDropFormatterModule {
}

