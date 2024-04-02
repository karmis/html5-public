import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AssessmentComponent } from './assessment.component';
import { GLAssessmentComponent } from './gl.component';
import { appRouter } from "../../../../constants/appRouter";
import { IMFXHtmlPlayerModule } from "../../../../modules/controls/html.player";
import { IMFXSimpleTreeModule } from "../../../../modules/controls/simple.tree";
import { IMFXXMLTreeModule } from "../../../../modules/controls/xml.tree";
import { IMFXAccordionModule } from "../../../../modules/search/detail/components/accordion.component";
import { IMFXQcReportsModule } from '../../../../modules/search/detail/components/qc.reports.component'
import { IMFXLocatorsModule } from "../../../../modules/controls/locators";
import { IMFXVideoInfoModule } from "../../../../modules/search/detail/components/video.info.component";
import { IMFXMediaTaggingTabModule } from "../../../../modules/search/detail/components/media.tagging.tab.component";
import { IMFXDefaultTabModule } from "../../../../modules/search/detail/components/default.tab.component";
import { SimpleListModule } from "../../../../modules/controls/simple.items.list";
import { IMFXSegmentsTabModule } from "../../../../modules/search/detail/components/segments.tab.component";
import { IMFXMediaInfoModule } from "../../../../modules/search/detail/components/mediainfo.tab.component";
import { TasksControlButtonsModule } from "../../../../modules/search/tasks-control-buttons";
import { CELocatorsModule } from "../../../clip-editor/comps/locators";
import { IMFXSubtitlesGridModule } from "../../../../modules/search/detail/components/subtitles.grid.component";
import { IMFXMetadataTabModule } from "../../../../modules/search/detail/components/metadata.tab.component";
import { IMFXNotesTabModule } from "../../../../modules/search/detail/components/notes.tab.component";
import { IMFXEventsTabModule } from "../../../../modules/search/detail/components/events.tab.component";
import { LayoutManagerModule } from "../../../../modules/controls/layout.manager";
import { IMFXAudioTracksTabModule } from "../../../../modules/search/detail/components/audio.tracks.tab.component";
import { IMFXAiTabModule } from "../../../../modules/search/detail/components/ai.tab.component";
import { IMFXImageModule } from "../../../../modules/search/detail/components/image.component";
import { IMFXNotAvailableModule } from "../../../../modules/controls/not.available.comp";
// import { TaskAbortModule } from "../../../../modules/search/tasks-control-buttons/comps/abort.modal";
import { TaskPendingModule } from "../../../../modules/search/tasks-control-buttons/comps/pending.modal";
// import {AVFaultsTabComponent} from "../../../../modules/search/detail/components/av.faults.tab.component/av.faults.tab.component";
import {SlickGridModule} from "../../../../modules/search/slick-grid";
import {AVFaultsTabModule} from "../../../../modules/search/detail/components/av.faults.tab.component";
import {SubtitlesPacGridModule} from "../../../../modules/search/detail/components/subtitles.pac.grid.component";
import {DOCXViewerModule} from "../../../../modules/viewers/docx";
import {TIFViewerModule} from "../../../../modules/viewers/tif";
import {PDFViewerModule} from "../../../../modules/viewers/pdf";
import {TGAViewerModule} from "../../../../modules/viewers/tga";
import {FlashViewerModule} from "../../../../modules/viewers/flash";
import {CodePrettifyViewerModule} from "../../../../modules/viewers/codeprettify";
import {DownloadViewerModule} from "../../../../modules/viewers/download";
import {IMFXProTimelineModule} from "../../../../modules/controls/imfx.pro.timeline";
import {ImfxProTimelineWrapperModule} from "../../../../modules/controls/imfx.pro.timeline.wrapper";
import {IMFXDropDownDirectiveModule} from "../../../../directives/dropdown/dropdown.directive.module";

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {path: appRouter.empty, component: AssessmentComponent},
];

@NgModule({
    declarations: [
        AssessmentComponent,
        GLAssessmentComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        IMFXHtmlPlayerModule,
        IMFXXMLTreeModule,
        IMFXSimpleTreeModule,
        IMFXAccordionModule,
        IMFXImageModule,
        IMFXDefaultTabModule,
        IMFXMediaTaggingTabModule,
        IMFXVideoInfoModule,
        IMFXLocatorsModule,
        SimpleListModule,
        IMFXSegmentsTabModule,
        IMFXProTimelineModule,
        IMFXAudioTracksTabModule,
        IMFXMediaInfoModule,
        TasksControlButtonsModule,
        CELocatorsModule,
        IMFXSubtitlesGridModule,
        IMFXMetadataTabModule,
        IMFXNotesTabModule,
        IMFXEventsTabModule,
        LayoutManagerModule,
        IMFXAiTabModule,
        IMFXNotAvailableModule,
        // TaskAbortModule,
        TaskPendingModule,
        SlickGridModule,
        AVFaultsTabModule,
        SubtitlesPacGridModule,
        DOCXViewerModule,
        TIFViewerModule,
        PDFViewerModule,
        TGAViewerModule,
        FlashViewerModule,
        CodePrettifyViewerModule,
        DownloadViewerModule,
        ImfxProTimelineWrapperModule,
        IMFXDropDownDirectiveModule,
        IMFXQcReportsModule
    ],
    exports: [
    ],
    entryComponents: [
    ]
})
export class AssessmentModule {
    public static routes = routes;
}
