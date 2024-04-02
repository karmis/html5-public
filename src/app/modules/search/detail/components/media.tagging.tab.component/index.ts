import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { TranslateModule } from '@ngx-translate/core';
// imfx modules
import {IMFXMediaTaggingTabComponent} from "./imfx.media.tagging.tab.component";
import {TagsModule} from "../../../../controls/tags";
import {IMFXControlsSelect2Module} from "../../../../controls/select2";
import {SlickGridModule} from "../../../slick-grid";
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXMediaTaggingTabComponent,
        // TagsComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TagsModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXMediaTaggingTabComponent,
    ]
})
export class IMFXMediaTaggingTabModule {
}
