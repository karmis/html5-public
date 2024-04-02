import {NgModule, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowWizardPriorityComponent } from './wizard';
import { OverlayModule } from '../../../../../modules/overlay';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkflowWizardPriorityComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
    ],
    entryComponents: [
        WorkflowWizardPriorityComponent
    ]
})
export class WorkflowWizardPriorityModule {
    entry: Type<WorkflowWizardPriorityComponent>;

    constructor() {
        this.entry = WorkflowWizardPriorityComponent;
    }
}
