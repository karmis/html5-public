import {NgModule, Type} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';
import {WorkflowAssessmentHistoryModalComponent} from './workflow.assessment.history.component';
import {RouterModule, Routes} from '@angular/router';
import {IMFXTaskHistoryGridModule} from '../../../../../../modules/controls/task.history.grid';
import {appRouter} from '../../../../../../constants/appRouter';


@NgModule({
    declarations: [
        WorkflowAssessmentHistoryModalComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXTaskHistoryGridModule,
    ],
    exports: [
        // WorkflowAssessmentHistoryModalComponent
    ],
    entryComponents: [
        WorkflowAssessmentHistoryModalComponent
    ]
})
export class WorkflowAssessmentHistoryModule {
    entry: Type<WorkflowAssessmentHistoryModalComponent>;

    constructor() {
        this.entry = WorkflowAssessmentHistoryModalComponent;
    }
}

