import {NgModule, Type} from "@angular/core";
import {WorkflowDecisionComponent} from "./comp";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {SearchSettingsModule} from "../../../../modules/search/settings";
import {SearchColumnsModule} from "../../../../modules/search/columns";
import {SlickGridModule} from "../../../../modules/search/slick-grid";
import {SearchFormModule} from "../../../../modules/search/form";
import {SearchViewsModule} from "../../../../modules/search/views";
import {TasksControlButtonsModule} from "../../../../modules/search/tasks-control-buttons";
import {TaskPendingModule} from "../../../../modules/search/tasks-control-buttons/comps/pending.modal";
import {IMFXNotAvailableModule} from "../../../../modules/controls/not.available.comp";
// import { TaskAbortModule } from "../../../../modules/search/tasks-control-buttons/comps/abort.modal";
import {IMFXModalModule} from "../../../../modules/imfx-modal";
// import {routes} from "../../../media";
import {IMFXDropDownDirectiveModule} from "../../../../directives/dropdown/dropdown.directive.module";
import {AngularSplitModule} from "angular-split";
import {IMFXAccordionModule} from "../../../../modules/search/detail/components/accordion.component";
import {IMFXNotesTabModule} from "../../../../modules/search/detail/components/notes.tab.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkflowDecisionComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchColumnsModule,
        SearchSettingsModule,
        AngularSplitModule,
        IMFXDropDownDirectiveModule,
        IMFXModalModule,
        TasksControlButtonsModule,
        IMFXNotAvailableModule,
        // TaskAbortModule,
        TaskPendingModule,
        IMFXAccordionModule,
        IMFXNotesTabModule,
        FormsModule,
        ReactiveFormsModule,
        // NotificationModule
    ],
    entryComponents: [
        WorkflowDecisionComponent
    ]
})
export class WorkflowDecisionModule {
    entry: Type<WorkflowDecisionComponent>;

    constructor() {
        this.entry = WorkflowDecisionComponent;
    }
}
