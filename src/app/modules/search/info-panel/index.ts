/**
 * Created by Ivan Banan on 12.01.2019.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// ng2 views
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { SubtitlesPacGridModule } from '../detail/components/subtitles.pac.grid.component';
import { IMFXSubtitlesGridModule } from '../detail/components/subtitles.grid.component';
import { IMFXMediaTaggingTabModule } from '../detail/components/media.tagging.tab.component';
import { IMFXAccordionComponent } from '../detail/components/accordion.component/imfx.accordion.component';
import { IMFXSubtitlesGrid } from '../detail/components/subtitles.grid.component/subtitles.grid.component';
import { SubtitlesPacGrid } from '../detail/components/subtitles.pac.grid.component/subtitles.pac.grid.component';
import { InfoPanelComponent } from './info.panel.component';
import { IMFXHtmlPlayerModule } from "../../controls/html.player";
import { IMFXAccordionModule } from '../detail/components/accordion.component';
import { LivePlayerModule } from '../../controls/live.player';
import { PanelMetadataModule } from "../panel-metadata";
import { IMFXFullImageDirectiveModule } from "../../../directives/img-fullscreen/fullimage.directive.module";

// Pipes

@NgModule({
    declarations: [
        InfoPanelComponent,
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        AccordionModule.forRoot(),
        IMFXAccordionModule,
        LivePlayerModule,
        IMFXMediaTaggingTabModule,
        IMFXSubtitlesGridModule,
        SubtitlesPacGridModule,
        IMFXHtmlPlayerModule,
        PanelMetadataModule,
        IMFXFullImageDirectiveModule
    ],
    exports: [
        InfoPanelComponent,
    ],
    entryComponents: [
        IMFXAccordionComponent,
        IMFXSubtitlesGrid,
        SubtitlesPacGrid
    ]
})
export class SearchInfoPanelModule {
}
