import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularSplitModule} from "angular-split";

import {TranslateModule} from '@ngx-translate/core';
// component modules
import {OverlayModule} from 'app/modules/overlay/index';
import {OutgestDetailComponent} from "./outgest.detail.component";
import {appRouter} from 'app/constants/appRouter';
import {TasksControlButtonsModule} from "app/modules/search/tasks-control-buttons/index";
import {SlickGridModule} from "app/modules/search/slick-grid";
import {OutgestGLComponent} from "./gl.component";
import {IMFXHtmlPlayerModule} from "app/modules/controls/html.player/index";
import {IMFXAccordionModule} from "app/modules/search/detail/components/accordion.component/index";
import {IMFXDefaultTabModule} from "app/modules/search/detail/components/default.tab.component/index";
import {IMFXMediaTaggingTabModule} from "app/modules/search/detail/components/media.tagging.tab.component/index";
import {IMFXMetadataTabModule} from "app/modules/search/detail/components/metadata.tab.component/index";
import {LayoutManagerModule} from "app/modules/controls/layout.manager/index";
import {IMFXNotAvailableModule} from "app/modules/controls/not.available.comp/index";
import {SimpleListModule} from "../../../../modules/controls/simple.items.list";
import {TelestreamModule} from "../../../../modules/controls/telestream";

// async components must be named routes for WebpackAsyncRoute
const routes:Routes = [
    {
        path: appRouter.empty,
        component: OutgestDetailComponent,
    }
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        OutgestDetailComponent,
        OutgestGLComponent
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
        // IMFXSubtitlesGridModule,
        IMFXMetadataTabModule,
        // IMFXNotesTabModule,
        LayoutManagerModule,
        IMFXNotAvailableModule,
        SimpleListModule,
        TelestreamModule
        // MediaLanguageListModule,
        // IMFXMediaInfoModule,
        // ImfxProTimelineQCWrapperModule
    ],
    exports: []
})
export class OutgestDetailModule {
    public static routes = routes;
}
