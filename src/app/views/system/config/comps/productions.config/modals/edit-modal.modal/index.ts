import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {CodemirrorModule} from "ng2-codemirror";
import {EditProductionTemplateModalComponent} from "./edit";
import SettingsUserChannelsTabModule from "../../../settings.user-manager/comps/channels_tab";
import {ProductionConfigEditModalTabsComponent} from "./components/tabs.component/production.config.edit.modal.tabs.component";
import {ProductionMakeWorkflowsTabComponent} from "./components/make.workflows.component/make.workflows.tab.component";
import {ProductionMakeActionsTabComponent} from "./components/make.actions.component/make.actions.tab.component";
import { ProductionConfigTabGridComponent } from './components/tab.grid/production.config.tab.grid.component';
import { SlickGridModule } from 'app/modules/search/slick-grid';
import {ProductionTemplateFieldsComponent} from "./components/template.fields.component/template.fields.component";
import {LocalDateModule} from "../../../../../../../modules/pipes/localDate";
import {IMFXControlsDateTimePickerModule} from "../../../../../../../modules/controls/datetimepicker";
import { ProductionPredefinedCleansVersionsTabComponent } from './components/predefined.cleans.versions.component/predefined.cleans.versions.tab.component';
import { DigitOnlyModule } from 'app/directives/digit-only/digit-only.module';

@NgModule({
    declarations: [
        ProductionTemplateFieldsComponent,
        ProductionMakeActionsTabComponent,
        ProductionMakeWorkflowsTabComponent,
        ProductionPredefinedCleansVersionsTabComponent,
        ProductionConfigEditModalTabsComponent,
        ProductionConfigTabGridComponent,
        EditProductionTemplateModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        LocalDateModule,
        IMFXControlsSelect2Module,
        IMFXControlsDateTimePickerModule,
        CodemirrorModule,
        SettingsUserChannelsTabModule,
        SlickGridModule,
        DigitOnlyModule
    ],
    entryComponents: [
        EditProductionTemplateModalComponent
    ]
})
export class EditProductionTemplateModalModule {
    entry: Type<EditProductionTemplateModalComponent>;

    constructor() {
        this.entry = EditProductionTemplateModalComponent;
    }
}
