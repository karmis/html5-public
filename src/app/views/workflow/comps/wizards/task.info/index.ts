import {NgModule, Type} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';
import {IMFXTaskHistoryGridModule} from '../../../../../modules/controls/task.history.grid';
import {WorkflowWizardInfoComponent} from './wizard';
import {IMFXTaskAdvancedLogGridModule} from '../../../../../modules/controls/task.advanced.log.grid';

@NgModule({
    declarations: [
        WorkflowWizardInfoComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXTaskHistoryGridModule,
        IMFXTaskAdvancedLogGridModule,
    ],
    exports: [],
    entryComponents: [
        WorkflowWizardInfoComponent
    ]
})

export class WorkflowWizardInfoModule {
    entry: Type<WorkflowWizardInfoComponent>;

    constructor() {
        this.entry = WorkflowWizardInfoComponent;
    }
}

