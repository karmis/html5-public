import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { CarriersTabModule } from '../../loan/comps/carriers-tab';
import { LoanWizardModule } from '../../loan/comps/wizard';
import { DetailModule } from '../../../modules/search/detail';
import { AngularSplitModule } from 'angular-split';
import { appRouter } from '../../../constants/appRouter';
import { VersionTabModule } from '../../loan/comps/version-tab';
import { IMFXControlsSelect2Module } from '../../../modules/controls/select2';
import { MediaTabModule } from '../../loan/comps/media-tab';
import { ReactiveFormsModule } from '@angular/forms';
import { IMFXControlsDateTimePickerModule } from '../../../modules/controls/datetimepicker';
import { LoanDetailComponent } from './detail.component';

// component modules

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: LoanDetailComponent}
];

@NgModule({
    declarations: [
        LoanDetailComponent,
    ],
    imports: [

        TranslateModule,
        CommonModule,
        RouterModule.forChild(routes),
        DetailModule,
        AngularSplitModule,
        VersionTabModule,
        ReactiveFormsModule,
        MediaTabModule,
        CarriersTabModule,

        LoanWizardModule,
        IMFXControlsDateTimePickerModule,
        IMFXControlsSelect2Module,
    ],
    providers: [
    ],
    exports: [
    ],
    entryComponents: [
    ]
})
export class LoanDetailModule {
    public static routes = routes;
}
