import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

// component modules
import { AngularSplitModule } from "angular-split";
import { ReactiveFormsModule } from "@angular/forms";
import { ProductionDetailComponent } from './production.detail.component';
import { appRouter } from '../../../constants/appRouter';
import { ProductionMaleListTabModule } from '../../../modules/search/detail/components/production.make.list.component';
import { LayoutManagerModule } from '../../../modules/controls/layout.manager';
import { SimpleListModule } from '../../../modules/controls/simple.items.list';
import { IMFXDefaultTabModule } from '../../../modules/search/detail/components/default.tab.component';
import { IMFXNotesTabModule } from '../../../modules/search/detail/components/notes.tab.component';
import { ProductionInfoTabModule } from "../../../modules/search/detail/components/production.info.tab.component";
import { ProductionSourceTabModule } from '../../../modules/search/detail/components/production.source.tab.component';
import { ProductionTableTabModule } from '../../../modules/search/detail/components/production.table.tab.component';
import { ProductionAudioTabModule } from '../../../modules/search/detail/components/production.audio.tab.component';
import { IMFXSegmentsTabModule } from '../../../modules/search/detail/components/segments.tab.component';
import { UnsavedChangesGuard } from "./providers/unsaved.changes.guard";
import { PromptDialogComponent } from "../../../modules/prompt.dialog/prompt.dialog.component";
import { PromptDialogModule } from "../../../modules/prompt.dialog";
import { ProductionEventsTabModule } from "../../../modules/search/detail/components/production.events.tab.component";
import { IMFXMetadataTabModule } from "../../../modules/search/detail/components/metadata.tab.component";
import { ProductionSegmentsTabModule } from "../../../modules/search/detail/components/production.segments.tab.component";
import { ProductionSubtitlesTabModule } from '../../../modules/search/detail/components/production.subtitles.tab.component';

// async components must be named routes for WebpackAsyncRoute
const routes: Routes = [
    {
        path: appRouter.empty,
        component: ProductionDetailComponent,
        canDeactivate: [UnsavedChangesGuard]
    }
];

@NgModule({
    declarations: [
        ProductionDetailComponent,
    ],
    imports: [

        TranslateModule,
        CommonModule,
        RouterModule.forChild(routes),
        AngularSplitModule,
        ReactiveFormsModule,
        ProductionMaleListTabModule,
        ProductionInfoTabModule,
        ProductionSourceTabModule,
        ProductionTableTabModule,
        ProductionAudioTabModule,
        ProductionSubtitlesTabModule,
        ProductionEventsTabModule,
        ProductionSegmentsTabModule,
        LayoutManagerModule,
        SimpleListModule,
        IMFXDefaultTabModule,
        IMFXNotesTabModule,
        IMFXMetadataTabModule,
        PromptDialogModule
    ],
    providers: [
        UnsavedChangesGuard
    ],
    entryComponents: [
        PromptDialogComponent
    ]
})
export class ProductionDetailModule {
    public static routes = routes;
}
