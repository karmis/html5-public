import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {TasksWizardPriorityComponent} from './wizard';
import {OverlayModule} from '../../../../../modules/overlay';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        TasksWizardPriorityComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
    ],
    entryComponents: [
        TasksWizardPriorityComponent
    ]
})
export class TasksWizardPriorityModule {
    entry: Type<TasksWizardPriorityComponent>;

    constructor() {
        this.entry = TasksWizardPriorityComponent;
    }
}
