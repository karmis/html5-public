import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {SubtitlesPacGrid} from './subtitles.pac.grid.component';
import { SlickGridModule } from '../../../slick-grid';
import { IMFXTextDirectionDirectiveModule } from '../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import {IMFXTextMarkerModule} from "../../../../controls/text.marker";

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SubtitlesPacGrid
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule,
        IMFXTextMarkerModule
    ],
    exports: [
        SubtitlesPacGrid,
    ]
})
export class SubtitlesPacGridModule {}
