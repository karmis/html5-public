import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXProTimelineModule} from "../imfx.pro.timeline";
import {ImfxProTimelineWrapperComponent} from "./imfx.pro.timeline.wrapper.component";


@NgModule({
    declarations: [
    // Components / Directives/ Pipes
        ImfxProTimelineWrapperComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        IMFXProTimelineModule
    ],
    exports: [
        ImfxProTimelineWrapperComponent,
    ]
})
export class ImfxProTimelineWrapperModule {}


