import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {appRouter} from '../../constants/appRouter';
import {TranslateModule} from '@ngx-translate/core';
import {AcquisitionsComponent} from "./acquisitions.component";
import {IMFXControlsTreeModule} from "../../modules/controls/tree";
import {OverlayModule} from '../../modules/overlay';
import {IMFXTextDirectionDirectiveModule} from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {LocalDateModule} from "../../modules/pipes/localDate";

const routes = [
    {
        path: appRouter.empty,
        component: AcquisitionsComponent,
    }
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        AcquisitionsComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        IMFXControlsTreeModule,
        OverlayModule,
        IMFXTextDirectionDirectiveModule,
        LocalDateModule
    ],
    exports: [
        AcquisitionsComponent
    ]
})
export class AcquisitionsModule {
    public static routes = routes;
}
