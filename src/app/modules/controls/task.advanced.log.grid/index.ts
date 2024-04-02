import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TranslateModule } from '@ngx-translate/core';
import { SlickGridModule } from '../../search/slick-grid';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { IMFXTaskAdvancedLogGridComponent } from './task.advanced.log.grid.component';
// imfx modules


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXTaskAdvancedLogGridComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        SlickGridModule,
    ],
    exports: [
        IMFXTaskAdvancedLogGridComponent,
    ],
    providers:[
        WorkflowService
    ]
})
export class IMFXTaskAdvancedLogGridModule {
}
