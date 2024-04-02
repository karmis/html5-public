/**
 * Created by Sergey Klimenko on 10.03.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// ng2 views
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TranslateModule } from '@ngx-translate/core';
// Pipes
import { LocalDateModule } from '../../pipes/localDate/index';
import { ShowItemsModule } from '../../pipes/showItems/index';
// component modules
// import { IMFXHtmlPlayerModule } from '../../controls/html.player/index';
import { IMFXNotAvailableModule } from '../../controls/not.available.comp/index';

import { IMFXDefaultTabModule } from './components/default.tab.component/index';
import { IMFXAccordionModule } from './components/accordion.component/index';
import { IMFXImageModule } from './components/image.component/index';
import { IMFXMediaTaggingTabModule } from './components/media.tagging.tab.component/index';
import { IMFXMediaTabModule } from './components/media.tab.component/index';
import { IMFXVersionsTabModule } from './components/versions.tab.component/index';
import { DOCXViewerModule } from '../../viewers/docx/index';
import { TIFViewerModule } from "../../viewers/tif/index";
import { PDFViewerModule } from '../../viewers/pdf/index';
import { FlashViewerModule } from '../../viewers/flash/index';
import { CodePrettifyViewerModule } from '../../viewers/codeprettify/index';
import { DownloadViewerModule } from '../../viewers/download/index';
import { DetailComponent } from "./detail";

import { IMFXXMLTreeModule } from "../../controls/xml.tree/index";
import { IMFXSimpleTreeModule } from "../../controls/simple.tree/index";

import { GLComponent } from './gl.component';
import { IMFXVideoInfoModule } from "./components/video.info.component/index";
import { IMFXHistoryTabComponent } from './components/history.tab.component/imfx.history.tab.component';
import { IMFXSubtitlesGridModule } from "./components/subtitles.grid.component/index";
import { CodePrettiffyViewerComponent } from "../../viewers/codeprettify/codeprettify";
import { DownloadViewerComponent } from "../../viewers/download/download";
import { TGAViewerComponent } from "../../viewers/tga/tga";
import { DOCXViewerComponent } from "../../viewers/docx/docx";
import { TIFViewerComponent } from "../../viewers/tif/tif";
import { IMFXNotAvailableComponent } from "../../controls/not.available.comp/imfx.not.available.comp";
import { IMFXMediaTaggingTabComponent } from "./components/media.tagging.tab.component/imfx.media.tagging.tab.component";
import { IMFXMediaTabComponent } from "./components/media.tab.component/imfx.media.tab.component";
import { IMFXImageComponent } from "./components/image.component/imfx.image.component";
import { IMFXSubtitlesGrid } from "./components/subtitles.grid.component/subtitles.grid.component";
import { IMFXVideoInfoComponent } from "./components/video.info.component/video.info.component";
import { IMFXDefaultTabComponent } from "./components/default.tab.component/imfx.default.tab.component";
import { IMFXAccordionComponent } from "./components/accordion.component/imfx.accordion.component";
import { IMFXHtmlPlayerComponent } from "../../controls/html.player/imfx.html.player";
import { IMFXReportTabComponent } from './components/report.tab.component/imfx.report.tab.component';
import { OverlayModule } from "../../overlay/index";
import { SubtitlesPacGridModule } from "./components/subtitles.pac.grid.component/index";
import { SubtitlesPacGrid } from "./components/subtitles.pac.grid.component/subtitles.pac.grid.component";
import { LivePlayerModule } from "../../controls/live.player/index";
import { LivePlayerComponent } from "../../controls/live.player/live.player";
import { IMFXAttachmentsComponent } from "./components/attachments.tab.component/imfx.attachments.tab.component";
import { SlickGridModule } from "../slick-grid/index";
import { DownloadFormatterComp } from "../slick-grid/formatters/download/download.formatter";
// import {ModalModule} from "../../modal/index";
import { IMFXSegmentsTabModule } from "./components/segments.tab.component/index";
import { IMFXMetadataTabModule } from "./components/metadata.tab.component/index";
import { IMFXNotesTabModule } from "./components/notes.tab.component/index";
import { IMFXEventsTabModule } from "./components/events.tab.component/index";
import { IMFXDropDownDirectiveModule } from '../../../directives/dropdown/dropdown.directive.module';
import { IMFXAudioTracksTabModule } from "./components/audio.tracks.tab.component/index";
import { DeleteFormatterComp } from "../slick-grid/formatters/delete/delete.formatter";
import { IMFXAiTabModule } from "./components/ai.tab.component/index";
import { IMFTabModule } from "./components/imf.tab.component/index";
import { IMFXTextDirectionDirectiveModule } from '../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';
import { TGAViewerModule } from "../../viewers/tga/index";
import { AVFaultsTabModule } from "./components/av.faults.tab.component/index";
import { PDFViewerComponent } from '../../viewers/pdf/pdf';
import { PreviewFilesFormatterComp } from '../slick-grid/formatters/preview-files/preview-files.formatter';
import SaveDefaultLayoutModalModule from "./components/modals/save.default.layout.modal/index";
import {SaveDefaultLayoutModalComponent} from "./components/modals/save.default.layout.modal/save.default.layout.modal.component";
import {GeoLocationModule} from "./components/geo.location.tab.component/index";
import { IMFXMisrTabComponent } from './components/misr.tab.component/imfx.misr.tab.component';
import { SearchViewsModule } from '../views';
import {IMFXProTimelineModule} from "../../controls/imfx.pro.timeline/index";
import {JsonViewerModule} from "../../viewers/jsonviewer/index";
import {IMFXTitlesTabComponent} from "./components/titles.tab.component/imfx.titles.tab.component";
import {IMFXTitlesTabModule} from "./components/titles.tab.component/index";
import {IMFXTasksTabComponent} from "./components/tasks.tab.component/imfx.tasks.tab.component";
import {IMFXHtmlPlayerModule} from "../../controls/html.player";
import EditSomEomModalModule from "./components/modals/edit.som.eom.modal";
import { EditSomEomModalComponent } from "./components/modals/edit.som.eom.modal/edit.som.eom.modal.component";
import {IMFXFileExplorerTabComponent} from "./components/file.explorer.tab.component/imfx.file.explorer.tab.component";
import { IMFXFileExplorerTabModule } from './components/file.explorer.tab.component';
import { IMFXWFHistoryTabModule } from './components/workflow.history.tab.component';
import {IMFXWFHistoryTabComponent} from "./components/workflow.history.tab.component/imfx.wf.history.tab.component";

@NgModule({
    declarations: [
        IMFXHistoryTabComponent,
        IMFXReportTabComponent,
        IMFXAttachmentsComponent,
        IMFXMisrTabComponent,
        GLComponent,
        DetailComponent,
        IMFXTasksTabComponent
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        IMFXHtmlPlayerModule,
        LivePlayerModule,
        IMFXNotAvailableModule,
        AccordionModule.forRoot(),
        TabsModule.forRoot(),
        IMFXXMLTreeModule,
        IMFXSimpleTreeModule,
        LocalDateModule,
        ShowItemsModule,
        IMFXAccordionModule,
        IMFXImageModule,
        IMFXDefaultTabModule,
        IMFXMediaTaggingTabModule,
        IMFXMediaTabModule,
        IMFXVersionsTabModule,
        IMFXVideoInfoModule,
        IMFXSubtitlesGridModule,
        SubtitlesPacGridModule,
        DOCXViewerModule,
        TIFViewerModule,
        PDFViewerModule,
        TGAViewerModule,
        FlashViewerModule,
        CodePrettifyViewerModule,
        JsonViewerModule,
        DownloadViewerModule,
        OverlayModule,
        // ModalModule,
        SlickGridModule,
        IMFXSegmentsTabModule,
        IMFXAudioTracksTabModule,
        IMFXMetadataTabModule,
        IMFXNotesTabModule,
        IMFXEventsTabModule,
        IMFXDropDownDirectiveModule,
        IMFXAiTabModule,
        IMFTabModule,
        IMFXTextDirectionDirectiveModule,
        AVFaultsTabModule,
        SaveDefaultLayoutModalModule,
        GeoLocationModule,
        SearchViewsModule,
        IMFXProTimelineModule,
        IMFXTitlesTabModule,
        EditSomEomModalModule,
        IMFXFileExplorerTabModule,
        IMFXWFHistoryTabModule
        // PreviewFilesFormatterModule
    ],
    exports: [
        IMFXHistoryTabComponent,
        IMFXReportTabComponent,
        LocalDateModule,
        ShowItemsModule,
        GLComponent,
        DetailComponent,
        IMFXTasksTabComponent
    ],
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        LivePlayerComponent,
        IMFXDefaultTabComponent,
        IMFXHistoryTabComponent,
        IMFXReportTabComponent,
        IMFXVideoInfoComponent,
        IMFXSubtitlesGrid,
        SubtitlesPacGrid,
        IMFXImageComponent,
        IMFXMediaTaggingTabComponent,
        IMFXMediaTabComponent,
        IMFXNotAvailableComponent,
        DOCXViewerComponent,
        TIFViewerComponent,
        PDFViewerComponent,
        TGAViewerComponent,
        DownloadViewerComponent,
        CodePrettiffyViewerComponent,
        DownloadFormatterComp,
        PreviewFilesFormatterComp,
        DeleteFormatterComp,
        IMFXMisrTabComponent,
        IMFXTitlesTabComponent,
        IMFXTasksTabComponent,
        IMFXFileExplorerTabComponent,
        IMFXWFHistoryTabComponent
    ]
})
export class DetailModule {
}
