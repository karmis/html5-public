import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SafePipeModule } from '../../../../modules/pipes/safePipe/index';
import { OverlayModule } from '../../../../modules/overlay/index';
import { appRouter } from '../../../../constants/appRouter';
import { MediaLoggerTaskComponent } from './media-logger-task';
import { IMFXHtmlPlayerModule } from '../../../../modules/controls/html.player/index';
import { IMFXXMLTreeModule } from '../../../../modules/controls/xml.tree/index';
import { IMFXSimpleTreeModule } from '../../../../modules/controls/simple.tree/index';
import { IMFXFullImageDirectiveModule } from '../../../../directives/img-fullscreen/fullimage.directive.module';
import { IMFXAccordionModule } from '../../../../modules/search/detail/components/accordion.component/index';
import { IMFXImageModule } from '../../../../modules/search/detail/components/image.component/index';
import { IMFXLocatorsModule } from '../../../../modules/controls/locators/index';
import { IMFXMediaTaggingTabModule } from '../../../../modules/search/detail/components/media.tagging.tab.component/index';
import { IMFXVideoInfoModule } from '../../../../modules/search/detail/components/video.info.component/index';
import { IMFXTaxonomyModule } from '../../../../modules/search/detail/components/taxonomy.tab.component/index';
import { LayoutManagerModule } from '../../../../modules/controls/layout.manager/index';
import { IMFXDefaultTabModule } from '../../../../modules/search/detail/components/default.tab.component/index';
import { SimpleListModule } from '../../../../modules/controls/simple.items.list/index';
import { GLTaskLoggerComponent } from './gl.component';
import { TasksControlButtonsModule } from '../../../../modules/search/tasks-control-buttons/index';
import {IMFXProTimelineModule} from '../../../../modules/controls/imfx.pro.timeline/index';
import { IMFXMediaInfoModule } from 'app/modules/search/detail/components/mediainfo.tab.component';

// async components must be named routes for WebpackAsyncRoute
export const routes = [
    {
        path: appRouter.empty,
        component: MediaLoggerTaskComponent,
        routerPath: appRouter.workflow.media_logger_task,
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        MediaLoggerTaskComponent,
        GLTaskLoggerComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        SafePipeModule,
        OverlayModule,
        IMFXHtmlPlayerModule,
        IMFXXMLTreeModule,
        IMFXSimpleTreeModule,
        IMFXFullImageDirectiveModule,
        IMFXAccordionModule,
        IMFXImageModule,
        IMFXDefaultTabModule,
        IMFXMediaTaggingTabModule,
        IMFXVideoInfoModule,
        IMFXLocatorsModule,
        IMFXTaxonomyModule,
        LayoutManagerModule,
        SimpleListModule,
        TasksControlButtonsModule,
        IMFXProTimelineModule,
        IMFXMediaInfoModule
        // MediaLoggerModule
    ],
    entryComponents: [
        MediaLoggerTaskComponent,
        // MediaLoggerComponent
    ]
})
export class MediaLoggerTaskModule {
    static routes = routes;
}
