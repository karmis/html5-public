import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TranslateModule } from '@ngx-translate/core';
import { SlickGridModule } from '../../search/slick-grid';
import { IMFXTaskHistoryGridComponent } from './task.history.grid.component';
import { WorkflowService } from '../../../services/workflow/workflow.service';
// imfx modules


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXTaskHistoryGridComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        SlickGridModule,
    ],
    exports: [
        IMFXTaskHistoryGridComponent,
    ],
    providers:[
        WorkflowService
    ]
})
export class IMFXTaskHistoryGridModule {
}
