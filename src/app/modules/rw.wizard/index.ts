import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
// import { ModalModule } from '../modal';
import {RaiseWorkflowWizzardComponent} from './rw.wizard';
import {IMFXXMLTreeModule} from '../controls/xml.tree';
import {IMFXTextDirectionDirectiveModule} from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {WorkflowListModule} from '../../views/workflow/comps/wf.list.comp';
import {IMFXControlsDateTimePickerModule} from '../controls/datetimepicker';
import {OrderPresetsGroupedModule} from '../order-presets-grouped';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        RaiseWorkflowWizzardComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        // ModalModule,
        IMFXXMLTreeModule,
        IMFXTextDirectionDirectiveModule,
        WorkflowListModule,
        IMFXControlsDateTimePickerModule,
        OrderPresetsGroupedModule
    ],
    exports: [
        // SingleUploadComponent,
        // RemoteUploadComponent
    ],
    entryComponents: [
        RaiseWorkflowWizzardComponent
    ]
})

export class RaiseWorkflowWizardModule {
    entry: Type<RaiseWorkflowWizzardComponent>;

    constructor() {
        this.entry = RaiseWorkflowWizzardComponent;
    }
}
