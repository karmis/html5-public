import {NgModule, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '../../../../modules/overlay';
import { appRouter } from "../../../../constants/appRouter";
import { IMFXControlsSelect2Module } from "../../../../modules/controls/select2";
import { MakeOfficerModalComponent } from './make.officer.modal.component';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MakeOfficerModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        // WorkflowDecisionModule
    ],
    exports: [
        MakeOfficerModalComponent
    ],
    entryComponents: [
        MakeOfficerModalComponent
    ]
})
export class MakeOfficerModalModule {
    entry: Type<MakeOfficerModalComponent>;

    constructor() {
        this.entry = MakeOfficerModalComponent;
    }
}
