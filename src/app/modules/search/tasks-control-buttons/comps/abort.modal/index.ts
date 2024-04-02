import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {OverlayModule} from "../../../../overlay";
import {TaskAbortComponent} from "./task.abort.component";

@NgModule({
    declarations: [
        TaskAbortComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        FormsModule
    ],
    entryComponents: [
        TaskAbortComponent
    ]
})

export class TaskAbortModule {
    entry: Type<TaskAbortComponent>;

    constructor() {
        this.entry = TaskAbortComponent;
    }
}
