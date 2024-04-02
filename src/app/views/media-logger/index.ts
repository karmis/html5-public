import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MediaLoggerComponent } from './media.logger.component';
import { GLLoggerComponent } from './gl.component';
// component modules
import { IMFXHtmlPlayerModule } from '../../modules/controls/html.player';

import { IMFXDefaultTabModule } from '../../modules/search/detail/components/default.tab.component';
import { IMFXAccordionModule } from '../../modules/search/detail/components/accordion.component';
import { IMFXImageModule } from '../../modules/search/detail/components/image.component';
import { IMFXMediaTaggingTabModule } from "../../modules/search/detail/components/media.tagging.tab.component";
import { IMFXLocatorsModule } from '../../modules/controls/locators';

import { IMFXXMLTreeModule } from "../../modules/controls/xml.tree";
import { IMFXSimpleTreeModule } from "../../modules/controls/simple.tree";

import { IMFXVideoInfoModule } from '../../modules/search/detail/components/video.info.component';
import { IMFXFullImageDirectiveModule } from '../../directives/img-fullscreen/fullimage.directive.module';
import { IMFXTaxonomyModule } from '../../modules/search/detail/components/taxonomy.tab.component';
import { appRouter } from '../../constants/appRouter';
import { LayoutManagerModule } from "../../modules/controls/layout.manager";
import { SimpleListModule } from "../../modules/controls/simple.items.list";
import {IMFXProTimelineModule} from "../../modules/controls/imfx.pro.timeline";
import {IMFXNotAvailableModule} from "../../modules/controls/not.available.comp";

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {
        path: appRouter.empty,
        component: MediaLoggerComponent
    }
];

@NgModule({
    declarations: [
        MediaLoggerComponent,
        GLLoggerComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        IMFXHtmlPlayerModule,
        IMFXProTimelineModule,
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
        IMFXNotAvailableModule
    ],
    exports: [
        // GLLoggerComponent,
        MediaLoggerComponent
    ]
})
export class MediaLoggerModule {
    public static routes = routes;
}
