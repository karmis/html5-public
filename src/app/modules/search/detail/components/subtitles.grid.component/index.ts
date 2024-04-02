import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IMFXTextMarkerModule} from "../../../../controls/text.marker";
// imfx modules
import {IMFXSubtitlesGrid} from "./subtitles.grid.component";
import {OverlayModule} from "../../../../overlay";
import { SlickGridModule } from '../../../slick-grid';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXSubtitlesGrid
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        IMFXTextMarkerModule,
        OverlayModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXSubtitlesGrid,
    ]
})
export class IMFXSubtitlesGridModule {
}
