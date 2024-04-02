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
import {DateFormatsComponent} from './dateformats.component';
import { appRouter } from '../../../../constants/appRouter';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: DateFormatsComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DateFormatsComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsDateTimePickerModule,
        IMFXLanguageSwitcherModule,
        RouterModule.forChild(routes),
    ],
    exports: [
        DateFormatsComponent
    ]
})
export class DateFormatsModule {
    public static routes = routes;
}
