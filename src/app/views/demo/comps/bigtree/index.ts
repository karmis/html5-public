/**
 * Created by Sergey Trizna on 16.02.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {IMFXLanguageSwitcherModule} from '../../../../modules/language.switcher';
import {IMFXControlsDateTimePickerModule} from '../../../../modules/controls/datetimepicker';
import {TranslateModule} from '@ngx-translate/core';
// comps
import {BigtreeComponent} from './bigtree.component';
import { appRouter } from '../../../../constants/appRouter';
import { IMFXControlsTreeModule } from '../../../../modules/controls/tree';
import { FormsModule } from '@angular/forms';
import { SearchGroupModule } from '../../../../modules/search/group';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: BigtreeComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        BigtreeComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsDateTimePickerModule,
        IMFXLanguageSwitcherModule,
        RouterModule.forChild(routes),
        IMFXControlsTreeModule,
        FormsModule,
        SearchGroupModule
    ],
    exports: [
        BigtreeComponent
    ]
})
export class BigTreeModule {
    public static routes = routes;
}
