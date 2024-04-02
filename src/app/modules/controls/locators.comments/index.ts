import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TranslateModule } from '@ngx-translate/core';
// imfx modules
import {IMFXLocatorsCommentsComponent} from "./imfx.locators.comments.component";
import {IMFXGridModule} from "app/modules/controls/grid";
import {IMFXControlsSelect2Module} from "app/modules/controls/select2";
import {SlickGridModule} from '../../search/slick-grid';
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXLocatorsCommentsComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXLocatorsCommentsComponent,
    ]
})
export class IMFXLocatorsCommentsModule {
}
