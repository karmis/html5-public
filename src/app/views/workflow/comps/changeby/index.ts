import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {WorkflowChangeByModalComponent} from './changeby';
import {RouterModule, Routes} from '@angular/router';
import {appRouter} from "../../../../constants/appRouter";
import {OverlayModule} from "../../../../modules/overlay";
import {IMFXControlsDateTimePickerComponent} from "../../../../modules/controls/datetimepicker/imfx.datetimepicker";
import {IMFXControlsDateTimePickerModule} from "../../../../modules/controls/datetimepicker";


const routes: Routes = [
    {path: appRouter.empty, component: WorkflowChangeByModalComponent},
];


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkflowChangeByModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        IMFXControlsDateTimePickerModule
    ],
    entryComponents: [
        WorkflowChangeByModalComponent
    ]
})
export class WorkflowChangeByModalModule {
    entry: Type<WorkflowChangeByModalComponent>;

    constructor() {
        this.entry = WorkflowChangeByModalComponent;
    }
}
