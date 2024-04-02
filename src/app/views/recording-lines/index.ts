import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {TranslateModule} from '@ngx-translate/core';
import { appRouter } from '../../constants/appRouter';
import { RecordingLinesComponent } from "./recording.lines.component";
import {OverlayModule} from "../../modules/overlay";
import {AngularSplitModule} from "angular-split";
import {LocalDateModule} from "../../modules/pipes/localDate";
import { EventInfoComponent } from './comps/event-info/event.info.component';
import { IMFXControlsSelect2Module } from '../../modules/controls/select2';
import { IMFXControlsDateTimePickerModule } from '../../modules/controls/datetimepicker';
import {IMFXInfiniteTimelineWrapperModule} from "../../modules/controls/imfx.infinite.timeline.wrapper";
import {SlickGridModule} from "../../modules/search/slick-grid";
import {SearchViewsModule} from "../../modules/search/views";
import {SearchColumnsModule} from "../../modules/search/columns";
import {SearchSettingsModule} from "../../modules/search/settings";
import {IMFXModalModule} from "../../modules/imfx-modal";
import {MediaItemEllipsisDropdownModule} from "../../modules/controls/mediaItemEllipsisDropdown";

const routes: Routes = [
    { path: appRouter.empty, component: RecordingLinesComponent },
];

@NgModule({
    declarations: [
        RecordingLinesComponent,
        EventInfoComponent
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        OverlayModule,
        AngularSplitModule,
        LocalDateModule,
        IMFXControlsSelect2Module,
        IMFXControlsDateTimePickerModule,
        IMFXInfiniteTimelineWrapperModule,
        LocalDateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchColumnsModule,
        SearchSettingsModule,
        IMFXModalModule,
        MediaItemEllipsisDropdownModule
    ]
})
export class RecordingLinesModule {
  public static routes = routes;
}
