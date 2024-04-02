import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {ClipEditorTaskComponent} from "./clip-editor-task";
import {appRouter} from "../../../../constants/appRouter";
import {GLTaskClipEditorComponent} from "./gl.component";
import {SafePipeModule} from "../../../../modules/pipes/safePipe";
import {IMFXHtmlPlayerModule} from "../../../../modules/controls/html.player";
import {OverlayModule} from "../../../../modules/overlay";
import {IMFXXMLTreeModule} from "../../../../modules/controls/xml.tree";
import {IMFXSimpleTreeModule} from "../../../../modules/controls/simple.tree";
import {IMFXFullImageDirectiveModule} from "../../../../directives/img-fullscreen/fullimage.directive.module";
import {IMFXAccordionModule} from "../../../../modules/search/detail/components/accordion.component";
import {SimpleListModule} from "../../../../modules/controls/simple.items.list";
import {IMFXDefaultTabModule} from "../../../../modules/search/detail/components/default.tab.component";
import {IMFXImageModule} from "../../../../modules/search/detail/components/image.component";
import {IMFXMediaTaggingTabModule} from "../../../../modules/search/detail/components/media.tagging.tab.component";
import {IMFXLocatorsModule} from "../../../../modules/controls/locators";
import {LayoutManagerModule} from "../../../../modules/controls/layout.manager";
import {TasksControlButtonsModule} from "../../../../modules/search/tasks-control-buttons";
import {CELocatorsModule} from "../../../clip-editor/comps/locators";
import {IMFXClipCommentTabModule} from "../../../../modules/search/detail/components/clip.comment.tab.component";
import { IMFXNotesTabModule } from "../../../../modules/search/detail/components/notes.tab.component";
import {ImfxProTimelineAdditionalButtonsWrapperModule} from "../../../../modules/controls/imfx.pro.timeline.additional.buttons.wrapper";

// async components must be named routes for WebpackAsyncRoute
export const routes = [
    {
        path: appRouter.empty,
        component: ClipEditorTaskComponent,
        routerPath: appRouter.workflow.clip_editor_task,
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        ClipEditorTaskComponent,
        GLTaskClipEditorComponent
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
        IMFXLocatorsModule,
        LayoutManagerModule,
        SimpleListModule,
        TasksControlButtonsModule,
        ImfxProTimelineAdditionalButtonsWrapperModule,
        CELocatorsModule,
        IMFXClipCommentTabModule,
        IMFXNotesTabModule
    ],
    entryComponents: [
        ClipEditorTaskComponent
    ]
})
export class ClipEditorTaskModule {
    static routes = routes;
}
