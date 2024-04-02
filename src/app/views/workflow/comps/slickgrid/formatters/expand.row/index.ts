/**
 * Created by Sergey Trizna on 30.03.2018.
 */

import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WorkflowExpandRowComponent} from "./expand.row.formatter";
import {DragDropFormatterModule} from "../../../../../../modules/search/slick-grid/formatters/dragdrop";
import {ProgressModule} from "../../../../../../modules/controls/progress";
import {DragDropFormatterComp} from "../../../../../../modules/search/slick-grid/formatters/dragdrop/dragdrop.comp";
import {TranslateModule} from "@ngx-translate/core";
@NgModule({
    declarations: [
        WorkflowExpandRowComponent,
        // DragDropFormatterComp
    ],
    imports: [
        CommonModule,
        ProgressModule,
        DragDropFormatterModule,
        TranslateModule
    ],
    exports: [
        WorkflowExpandRowComponent,
        // DragDropFormatterComp
        // DragDropFormatterComp
    ],
    entryComponents: [
        WorkflowExpandRowComponent
    ]
})
export class WorkflowExpandRowModule {
    entry: Type<WorkflowExpandRowComponent>;

    constructor() {
        this.entry = WorkflowExpandRowComponent;
    }
}
