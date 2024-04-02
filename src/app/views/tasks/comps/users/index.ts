import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {TasksUsersComponent} from "./users";
import {OverlayModule} from "../../../../modules/overlay";
import {AppointmentModule} from "./comps/appointment";
import {IMFXControlsTreeModule} from "../../../../modules/controls/tree";
// import {ModalModule} from "../../../../modules/modal";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        TasksUsersComponent
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
        TasksUsersComponent
    ],
    entryComponents: [
        TasksUsersComponent
    ]
})
export class TasksUsersModule {
}
