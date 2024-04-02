import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {WorkflowUsersComponent} from "./users";
import {OverlayModule} from "../../../../modules/overlay";
import {AppointmentModule} from "./comps/appointment";
import {IMFXControlsTreeModule} from "../../../../modules/controls/tree";
// import {ModalModule} from "../../../../modules/modal";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkflowUsersComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsTreeModule,
        AppointmentModule,
        // ModalModule
    ],
    exports: [
        WorkflowUsersComponent
    ],
    entryComponents: [
        WorkflowUsersComponent
    ]
})
export class WorkflowUsersModule {
}
