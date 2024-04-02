import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {OverlayModule} from "../../../../overlay";
import {TaskPendingComponent} from "./task.pending.component";
import { IMFXControlsSelect2Module } from '../../../../controls/select2';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        TaskPendingComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        FormsModule,
        IMFXControlsSelect2Module
    ],
    entryComponents: [
        TaskPendingComponent
    ]
})
export class TaskPendingModule {
}
