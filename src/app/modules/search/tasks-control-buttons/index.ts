import {NgModule, Type} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';
import {TasksControlButtonsComponent} from "./tcb";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        TasksControlButtonsComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [
        TasksControlButtonsComponent
    ],
    entryComponents: [
        TasksControlButtonsComponent
    ]
})
export class TasksControlButtonsModule {
    entry: Type<TasksControlButtonsComponent>;

    constructor() {
        this.entry = TasksControlButtonsComponent;
    }
}
