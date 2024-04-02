import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularSplitModule} from "angular-split";

import {TranslateModule} from '@ngx-translate/core';
// component modules
import {OverlayModule} from '../../../../modules/overlay/index';
import {ComponentQcDetailsComponent} from "./component.qc.component";
import {appRouter} from '../../../../constants/appRouter';
import {TasksControlButtonsModule} from "../../../../modules/search/tasks-control-buttons/index";
import {SlickGridModule} from "../../../../modules/search/slick-grid";
import {GLComponentQCComponent} from "./gl.component";
import {IMFXHtmlPlayerModule} from "../../../../modules/controls/html.player/index";
import {IMFXAccordionModule} from "../../../../modules/search/detail/components/accordion.component/index";
import {IMFXDefaultTabModule} from "../../../../modules/search/detail/components/default.tab.component/index";
import {IMFXMediaTaggingTabModule} from "../../../../modules/search/detail/components/media.tagging.tab.component/index";
import {IMFXSubtitlesGridModule} from "../../../../modules/search/detail/components/subtitles.grid.component/index";
import {IMFXMetadataTabModule} from "../../../../modules/search/detail/components/metadata.tab.component/index";
import {IMFXNotesTabModule} from "../../../../modules/search/detail/components/notes.tab.component/index";
import {LayoutManagerModule} from "../../../../modules/controls/layout.manager/index";
import {IMFXNotAvailableModule} from "../../../../modules/controls/not.available.comp/index";
import {MediaLanguageListModule} from "../../../../modules/search/detail/components/media.language.items.list/index";
import {IMFXMediaInfoModule} from "../../../../modules/search/detail/components/mediainfo.tab.component/index";
import {ImfxProTimelineQCWrapperModule} from "./components/imfx.pro.timeline.qc.wrapper";

// async components must be named routes for WebpackAsyncRoute
const routes:Routes = [
    {
        path: appRouter.empty,
        component: ComponentQcDetailsComponent,
    }
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ComponentQcDetailsComponent,
        GLComponentQCComponent
    ],
    imports: [
        OverlayModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        TasksControlButtonsModule,
        SlickGridModule,
        IMFXHtmlPlayerModule,
        IMFXAccordionModule,
        IMFXDefaultTabModule,
        IMFXMediaTaggingTabModule,
        IMFXSubtitlesGridModule,
        IMFXMetadataTabModule,
        IMFXNotesTabModule,
        LayoutManagerModule,
        IMFXNotAvailableModule,
        MediaLanguageListModule,
        IMFXMediaInfoModule,
        ImfxProTimelineQCWrapperModule
    ],
    exports: []
})
export class ComponentQcDetails {
    public static routes = routes;
}
