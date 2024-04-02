import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {AngularSplitModule} from 'angular-split';
import {IMFXDropDownDirectiveModule} from '../../directives/dropdown/dropdown.directive.module';
import {SearchFormModule} from '../../modules/search/form';
import {SearchAdvancedModule} from '../../modules/search/advanced';
import {SearchSettingsModule} from '../../modules/search/settings';
import {SearchRecentModule} from '../../modules/search/recent';
import {appRouter} from '../../constants/appRouter';
import {NamesComponent} from "./names.component";
import {IMFXControlsTreeModule} from "../../modules/controls/tree";
import {KeysPipeModule} from "../../modules/pipes/keysPipe";
import {LocalDateModule} from "../../modules/pipes/localDate";
import {NamesModalModule} from "./modals/names.modal";
import {FormsModule} from "@angular/forms";
import {NamesTreeModule} from "./comps/names.tree";


const routes: Routes = [
    {path: appRouter.empty, component: NamesComponent},
];

@NgModule({
    declarations: [
        NamesComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SearchFormModule,
        SearchSettingsModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        IMFXControlsTreeModule,
        KeysPipeModule,
        LocalDateModule,
        IMFXDropDownDirectiveModule,
        NamesModalModule,
        FormsModule,
        NamesTreeModule
    ],
    exports: [
        RouterModule
    ]
})
export class NamesModule {
    public static routes = routes;
}
