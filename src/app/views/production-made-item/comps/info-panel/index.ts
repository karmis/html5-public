/**
 * Created by Ivan Banan on 12.01.2019.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// ng2 views
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { ProductionInfoPanelComponent } from './production.info.panel.component';
import { LivePlayerModule } from 'app/modules/controls/live.player';
import { IMFXAccordionModule } from 'app/modules/search/detail/components/accordion.component';
import { IMFXMediaTaggingTabModule } from 'app/modules/search/detail/components/media.tagging.tab.component';
import { IMFXSubtitlesGridModule } from 'app/modules/search/detail/components/subtitles.grid.component';
import { SubtitlesPacGridModule } from 'app/modules/search/detail/components/subtitles.pac.grid.component';
import { IMFXHtmlPlayerModule } from 'app/modules/controls/html.player';
import { PanelMetadataModule } from 'app/modules/search/panel-metadata';
import { IMFXFullImageDirectiveModule } from 'app/directives/img-fullscreen/fullimage.directive.module';
import { IMFXAccordionComponent } from 'app/modules/search/detail/components/accordion.component/imfx.accordion.component';
import {IMFXSubtitlesGrid} from "../../../../modules/search/detail/components/subtitles.grid.component/subtitles.grid.component";
import {SubtitlesPacGrid} from "../../../../modules/search/detail/components/subtitles.pac.grid.component/subtitles.pac.grid.component";
import {IMFXAudioTracksTabModule} from "../../../../modules/search/detail/components/audio.tracks.tab.component";

// Pipes

@NgModule({
    declarations: [
        ProductionInfoPanelComponent,
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
        IMFXFullImageDirectiveModule,
        IMFXAudioTracksTabModule
    ],
    exports: [
        ProductionInfoPanelComponent,
    ],
    entryComponents: [
        IMFXAccordionComponent,
        IMFXSubtitlesGrid,
        SubtitlesPacGrid
    ]
})
export class SearchProductionInfoPanelModule {
}
