import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXVersionsTabComponent} from './imfx.versions.tab.component';
import {SlickGridModule} from "../../../slick-grid";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {SearchViewsModule} from "../../../views";
import {TranslateModule} from "@ngx-translate/core";
import {SearchThumbsModule} from "../../../thumbs";

@NgModule({
    declarations: [
    // Components / Directives/ Pipes
        IMFXVersionsTabComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule,
        SearchViewsModule,
        TranslateModule,
        SearchThumbsModule
    ],
    exports: [
        IMFXVersionsTabComponent
    ]
})
export class IMFXVersionsTabModule {}
