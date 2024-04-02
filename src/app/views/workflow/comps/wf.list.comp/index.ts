import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {OverlayModule} from '../../../../modules/overlay';
import {IMFXControlsTreeModule} from '../../../../modules/controls/tree';
import {WorkflowListComponent} from './wf.list.comp';
import {SlickGridModule} from '../../../../modules/search/slick-grid';
import {SearchViewsModule} from '../../../../modules/search/views';
import {SearchSettingsModule} from '../../../../modules/search/settings';
import {WorkflowExpandRowModule} from '../slickgrid/formatters/expand.row';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        WorkflowListComponent
    ],
    imports: [
        CommonModule,
        SlickGridModule,
        SearchViewsModule,
        SearchSettingsModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsTreeModule,
        WorkflowExpandRowModule,
        // WorkflowDecisionModule
    ],
    exports: [
        WorkflowListComponent
    ],
    entryComponents: [
        WorkflowListComponent,
    ]
})
export class WorkflowListModule {
    entry: Type<WorkflowListComponent>;

    constructor() {
        this.entry = WorkflowListComponent;
    }
}
