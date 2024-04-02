/**
 * Created by Sergey Trizna on 27.06.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '../../../../modules/overlay';
// components
import { ConsumerDetailComponent } from './consumer.detail.component';
import { IMFXSubtitlesGridModule } from '../../../../modules/search/detail/components/subtitles.grid.component/index';
import { IMFXHtmlPlayerModule } from '../../../../modules/controls/html.player/index';
import { GridStackModule } from '../../../../modules/controls/gridstack/index';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ConsumerDetailComponent,
    ],
    imports: [
        IMFXSubtitlesGridModule,
        IMFXHtmlPlayerModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        GridStackModule,
        OverlayModule
    ],
    exports: [
        ConsumerDetailComponent
    ]
})
export class ConsumerDetailModule {
}
