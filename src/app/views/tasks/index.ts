import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { TasksComponent } from './tasks.component';
import { SearchViewsModule } from '../../modules/search/views';
import { SearchFormModule } from '../../modules/search/form';
import { SearchSettingsModule } from '../../modules/search/settings';
import { SearchColumnsModule } from '../../modules/search/columns';
import { SearchAdvancedModule } from '../../modules/search/advanced';
import { SearchRecentModule } from '../../modules/search/recent';
// For modal
// import { ModalModule } from '../../modules/modal';
import { SearchColumnsComponent } from '../../modules/search/columns/search.columns';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { appRouter } from '../../constants/appRouter';
import { ProgressModule } from '../../modules/controls/progress';
import { SlickGridModule } from '../../modules/search/slick-grid';
import { TasksUsersModule } from './comps/users';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {
        path: appRouter.empty,
        component: TasksComponent
    }
];

@NgModule({
    declarations: [
        TasksComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        // TaskWizardAbortModule,
        RouterModule.forChild(routes),
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchSettingsModule,
        SearchColumnsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        BsDropdownModule,
        ProgressModule,
        TasksUsersModule,
        // WorkflowWizardInfoModule,
    ],
    exports: [],
    entryComponents: [
        SearchColumnsComponent,
        // TasksWizardPriorityComponent,
        // TasksWizardAbortComponent,
    ]
})
export class TasksModule {
    public static routes = routes;
}
