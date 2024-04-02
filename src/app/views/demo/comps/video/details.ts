import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// IMFX modules
import { IMFXHtmlPlayerModule } from "../../../../modules/controls/html.player";
import { DemoVideoDetailsComponent } from "./video.details.component";
import { appRouter } from '../../../../constants/appRouter';
import { IMFXTextDirectionDirectiveModule } from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { TranslateModule } from '@ngx-translate/core';
import { IMFXControlsSelect2Module } from "../../../../modules/controls/select2";
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';

const routes = [
    {path: appRouter.empty, component: DemoVideoDetailsComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        DemoVideoDetailsComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        IMFXHtmlPlayerModule,
        RouterModule.forChild(routes),
        IMFXTextDirectionDirectiveModule,
        IMFXControlsSelect2Module,
        DigitOnlyModule
    ]
})
export class DemoVideoDetailsModule {
    public static routes = routes;
}
