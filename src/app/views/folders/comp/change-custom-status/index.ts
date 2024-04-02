import {NgModule, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '../../../../modules/overlay';
import { appRouter } from "../../../../constants/appRouter";
import { ChangeCustomStatusComponent } from "./change-custom-status.comp";
import { IMFXControlsSelect2Module } from "../../../../modules/controls/select2";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ChangeCustomStatusComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        // WorkflowDecisionModule
    ],
    exports: [
        ChangeCustomStatusComponent
    ],
    entryComponents: [
        ChangeCustomStatusComponent
    ]
})
export class ChangeCustomStatusModule {
    entry: Type<ChangeCustomStatusComponent>;

    constructor() {
        this.entry = ChangeCustomStatusComponent;
    }
}
