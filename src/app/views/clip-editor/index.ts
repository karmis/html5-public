import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularSplitModule} from "angular-split";

import {TranslateModule} from '@ngx-translate/core';
import {OverlayModule} from "../../modules/overlay";
import {RCEComponent} from "./rce.component";
import {IMFXHtmlPlayerModule} from "../../modules/controls/html.player";
import {DetailModule} from "../../modules/search/detail";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {IMFXAccordionModule} from "../../modules/search/detail/components/accordion.component";
import {GLClipEditorComponent} from './gl.component';
import {SimpleListModule} from "../../modules/controls/simple.items.list";
import {MediaWizardModule} from "./comps/wizard";
import {CELocatorsModule} from './comps/locators';
import {appRouter} from '../../constants/appRouter';
// import { ModalPreviewPlayerModule } from "../../modules/modal.preview.player";
// import { ModalPreviewPlayerComponent } from "../../modules/modal.preview.player/modal.preview.player";
import {LayoutManagerModule} from "../../modules/controls/layout.manager";
import {SlickGridModule} from "../../modules/search/slick-grid";
import {IMFXClipCommentTabModule} from "../../modules/search/detail/components/clip.comment.tab.component";
import {ImfxProTimelineAdditionalButtonsWrapperModule} from "../../modules/controls/imfx.pro.timeline.additional.buttons.wrapper";
import {ModalPreviewPlayerModule} from "../../modules/modal.preview.player";

// component modules

// async components must be named routes for WebpackAsyncRoute
const routes = [
    {path: appRouter.empty, component: RCEComponent}
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        RCEComponent,
        GLClipEditorComponent
    ],
    imports: [
        OverlayModule,
        TranslateModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        DetailModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        AccordionModule.forRoot(),
        IMFXAccordionModule,
        IMFXHtmlPlayerModule,
        SimpleListModule,
        ImfxProTimelineAdditionalButtonsWrapperModule,
        // ModalModule,
        MediaWizardModule,
        ModalPreviewPlayerModule,
        CELocatorsModule,
        LayoutManagerModule,
        SlickGridModule,
        IMFXClipCommentTabModule
    ],
    exports: [],
    entryComponents: [
        // ModalPreviewPlayerComponent,
    ]
})
export class ClipEditorModule {
    public static routes = routes;
}
