/**
 * Created by Sergey Trizna on 27.06.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import { GridStackModule } from '../../../../modules/controls/gridstack/index';

// components
import { ConsumerItemComponent } from './consumer.item.component';
import { IMFXSubtitlesGridModule } from '../../../../modules/search/detail/components/subtitles.grid.component/index';
import { IMFXHtmlPlayerModule } from '../../../../modules/controls/html.player/index';

import { RouterModule } from '@angular/router';

import { ThumbModule } from '../../../../modules/controls/thumb'


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ConsumerItemComponent,
    ],
    imports: [
        IMFXSubtitlesGridModule,
        IMFXHtmlPlayerModule,
        TranslateModule,
        CommonModule,
        GridStackModule,
        RouterModule,
        ThumbModule
    ],
    exports: [
        ConsumerItemComponent
    ]
})
export class ConsumerItemModule {
}
