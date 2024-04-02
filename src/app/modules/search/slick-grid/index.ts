/**
 * Created by Sergey Trizna on 03.03.2017.
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {SlickGridComponent} from "./slick-grid";
import {BsDropdownModule} from "ngx-bootstrap/dropdown";
import {ProgressModule} from "../../controls/progress";
import {ProgressComponent} from "../../controls/progress/progress";
import {OverlayModule} from "../../overlay";
import {ThumbnailFormatterComp} from "./formatters/thumbnail/thumbnail.formatter";
import {TagFormatterComp} from "./formatters/tag/tag.formatter";
import {ThumbModule} from "../../controls/thumb";
import {TagsModule} from "../../controls/tags";
import {StatusFormatterComp} from "./formatters/status/status.formatter";
import {ProgressFormatterComp} from "./formatters/progress/progress.formatter";
import {SettingsFormatterComp} from "./formatters/settings/settings.formatter";
import {TileFormatterComp} from "./formatters/tile/tile.formatter";
import {BasketFormatterComp} from "./formatters/basket/basket.formatter";
import {IconsFormatterComp} from "./formatters/icons/icons.formatter";
import {IsLiveFormatterComp} from "./formatters/islive/islive.formatter";
import {JobStatusFormatterComp} from "./formatters/job-status/job-status";
// import {TreeFormatterComp} from "./formatters/tree/tree.formatter";
import {SafePipeModule} from "../../pipes/safePipe";
import {DatetimeFormatterComp} from "./formatters/datetime/datetime.formatter";
import {LocalDateModule} from "../../pipes/localDate";
import {TaskStatusFormatterComp} from "./formatters/task-status/task-status";
import {TaskProgressFormatterComp} from "./formatters/task-progress/task-progress";
import {Select2FormatterComp} from "./formatters/select2/select2.formatter";
import {IMFXControlsSelect2Module} from "../../controls/select2";
import {TextFormatterComp} from "./formatters/text/text.formatter";
import {PlayButtonFormatterComp} from "./formatters/play-button/play-button.formatter";

import {SubtitleFormatterComp} from './formatters/subtitle/subtitle.formatter';

import {DragDropFormatterComp} from "./formatters/dragdrop/dragdrop.comp";
import {DragDropFormatterModule} from "./formatters/dragdrop";
import {ColorIndicatorFormatterComp} from "./formatters/color-indicator/color.indicator.formatter";
import {SlickGridPanelBottomModule} from "./comps/panels/bottom";
import {SlickGridPanelTopModule} from "./comps/panels/top";
import {VersionIconsFormatterComp} from "./formatters/versions.icons/versions.icons.formatter";
import {PreviewImfDetailsFormatterComp} from "./formatters/preview-imf-details/preview-imf-details.formatter";
// import {ModalModule} from "../../modal";
import {CacheManagerStatusComp} from "../../../views/cachemanager/modules/status/cm-status";
import {CacheManagerStatusModule} from "../../../views/cachemanager/modules/status";
import {DocViewerFormatterComp} from "./formatters/docviewer/docviewer.formatter";
// import {PDFViewerModule} from "../../viewers/pdf";
import {TGAViewerModule} from "../../viewers/tga";
import {CodePrettifyViewerModule} from "../../viewers/codeprettify";
import {ReportStatusFormatterComp} from "./formatters/report-status/report-status";
import {DownloadViewerModule} from "../../viewers/download";
import {CheckBoxFormatterComp} from "./formatters/checkBox/checkbox.formatter";
import {TaskInfoFormatterComp} from './formatters/task-info/task.info.formatter';
import {LogTypeIndicatorFormatterComp} from './formatters/log-type-indicator/log.type.indicator.formatter';
import {LookupFormatterComp} from "./formatters/lookup/lookup.formatter";
import {DoActionFormatterComp} from "./formatters/doaction/doaction.formatter";
import {ColorFormatterComp} from "./formatters/color/color.formatter";
import {DropFormatterModule} from "./formatters/drop";
import {DropFormatterComp} from "./formatters/drop/drop.comp";
import {LinkFormatterComp} from './formatters/link/link.formatter';
import {ImageLinkFormatterComp} from './formatters/image-link/image.link.formatter';
import {RouterModule} from '@angular/router';
import {DeleteFormatterComp} from "./formatters/delete/delete.formatter";
import {DownloadFormatterComp} from "./formatters/download/download.formatter";
import {PreviewFilesFormatterComp} from "./formatters/preview-files/preview-files.formatter";
import {TimecodeInputFormatterComp} from "./formatters/timecode-input/timecode.input.formatter";
import {TimecodeInputModule} from "../../controls/timecode";
import {IMFXFullImageDirectiveModule} from "../../../directives/img-fullscreen/fullimage.directive.module";
import {PresetsFormatterComp} from "./formatters/presets/presets.formatter";
import {QueuesFormatterComp} from "./formatters/queues/queues.formatter";
import {ValidationFormatterComp} from "./formatters/validation/validation.formatter";
import { WorkOrderStatusFormatterComp } from './formatters/work-order-status/work.order.status.formatter';
import { CustomStatusFormatterComp } from './formatters/custom-status/custom.status.formatter';
import {TimecodeStringFormatterComp} from "./formatters/timecode-string/timecode.string.formatter";
import { SectorsChannelsFormatterComp } from './formatters/sectors-channels/sectors.channels.formatter';
import { PgmMediaStatusFormatterComp } from './formatters/pgm-media-status/pgm.media.status.formatter';
import {SystemSettingFormatterComp} from "./formatters/system-setting/system-setting.formatter";
import {FormsModule} from "@angular/forms";
import { LookupCollectionFormatterComp } from './formatters/lookup-collection/lookup.collection.formatter';
import { ArrayFormatterComp } from './formatters/array/array.formatter';
import { ProductionStatusFormatterComp } from './formatters/production-status/production-status';
import { ProductionMediaTypeFormatterComp } from "./formatters/production-media-type/production-media-type";
import { FolderLinkFormatterComp } from './formatters/folder-link/folder.link.formatter';
import { TableFormatterComp } from './formatters/table/table.formatter';
import { ProductionMultiSelectFormatterComp } from './formatters/production-multiselect/production-multiselect';
// import {PDFViewerComponent} from "../../viewers/pdf/pdf";


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SlickGridComponent,
        ThumbnailFormatterComp,
        StatusFormatterComp,
        SettingsFormatterComp,
        TileFormatterComp,
        BasketFormatterComp,
        IconsFormatterComp,
        IsLiveFormatterComp,
        ProgressFormatterComp,
        JobStatusFormatterComp,
        ProductionStatusFormatterComp,
        ProductionMediaTypeFormatterComp,
        ProductionMultiSelectFormatterComp,
        TaskStatusFormatterComp,
        TagFormatterComp,
        DoActionFormatterComp,
        DatetimeFormatterComp,
        TaskProgressFormatterComp,
        Select2FormatterComp,
        TextFormatterComp,
        PlayButtonFormatterComp,
        SubtitleFormatterComp,
        ColorIndicatorFormatterComp,
        VersionIconsFormatterComp,
        PreviewImfDetailsFormatterComp,
        DocViewerFormatterComp,
        ReportStatusFormatterComp,
        CheckBoxFormatterComp,
        ValidationFormatterComp,
        PresetsFormatterComp,
        SystemSettingFormatterComp,
        QueuesFormatterComp,
        LookupFormatterComp,
        TaskInfoFormatterComp,
        LogTypeIndicatorFormatterComp,
        ColorFormatterComp,
        LinkFormatterComp,
        ImageLinkFormatterComp,
        DeleteFormatterComp,
        DownloadFormatterComp,
        PreviewFilesFormatterComp,
        TimecodeInputFormatterComp,
        WorkOrderStatusFormatterComp,
        CustomStatusFormatterComp,
        PgmMediaStatusFormatterComp,
        TimecodeStringFormatterComp,
        SectorsChannelsFormatterComp,
        LookupCollectionFormatterComp,
        ArrayFormatterComp,
        FolderLinkFormatterComp,
        TableFormatterComp
        // TreeFormatterComp,
    ],
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        BsDropdownModule.forRoot(),
        ProgressModule,
        OverlayModule,
        ThumbModule,
        TagsModule,
        SafePipeModule,
        LocalDateModule,
        IMFXControlsSelect2Module,
        DragDropFormatterModule,
        SlickGridPanelBottomModule,
        SlickGridPanelTopModule,
        // ModalModule,
        CacheManagerStatusModule,
        // PDFViewerModule,
        TGAViewerModule,
        CodePrettifyViewerModule,
        DownloadViewerModule,
        DropFormatterModule,
        RouterModule,
        TimecodeInputModule,
        IMFXFullImageDirectiveModule,
    ],
    exports: [
        SlickGridComponent,
        ThumbnailFormatterComp,
        StatusFormatterComp,
        TileFormatterComp,
        BasketFormatterComp,
        IconsFormatterComp,
        IsLiveFormatterComp,
        ProgressFormatterComp,
        JobStatusFormatterComp,
        ProductionStatusFormatterComp,
        ProductionMediaTypeFormatterComp,
        ProductionMultiSelectFormatterComp,
        TaskStatusFormatterComp,
        TagFormatterComp,
        DatetimeFormatterComp,
        TaskProgressFormatterComp,
        Select2FormatterComp,
        TextFormatterComp,
        PlayButtonFormatterComp,
        DragDropFormatterComp,
        ColorIndicatorFormatterComp,
        VersionIconsFormatterComp,
        PreviewImfDetailsFormatterComp,
        DocViewerFormatterComp,
        ReportStatusFormatterComp,
        CheckBoxFormatterComp,
        ValidationFormatterComp,
        PresetsFormatterComp,
        SystemSettingFormatterComp,
        QueuesFormatterComp,
        DoActionFormatterComp,
        LookupFormatterComp,
        TaskInfoFormatterComp,
        LogTypeIndicatorFormatterComp,
        ColorFormatterComp,
        LinkFormatterComp,
        ImageLinkFormatterComp,
        TimecodeInputFormatterComp,
        WorkOrderStatusFormatterComp,
        CustomStatusFormatterComp,
        PgmMediaStatusFormatterComp,
        TimecodeStringFormatterComp,
        SectorsChannelsFormatterComp,
        LookupCollectionFormatterComp,
        ArrayFormatterComp,
        FolderLinkFormatterComp,
        TableFormatterComp
        // TreeFormatterComp
    ],
    entryComponents: [
        // StatusColumnComponent,
        // LabelStatusColumnComponent,
        // LiveStatusColumnComponent,
        // IconsColumnComponent,
        // PlayIconColumnComponent,
        // BasketColumnComponent,
        // ProgressColumnComponent,
        ProgressComponent,
        // SettingsColumnComponent,
        // GridRowsDetailComponent,
        ThumbnailFormatterComp,
        StatusFormatterComp,
        SettingsFormatterComp,
        TileFormatterComp,
        BasketFormatterComp,
        IconsFormatterComp,
        IsLiveFormatterComp,
        ProgressFormatterComp,
        JobStatusFormatterComp,
        ProductionStatusFormatterComp,
        ProductionMediaTypeFormatterComp,
        ProductionMultiSelectFormatterComp,
        TaskStatusFormatterComp,
        TagFormatterComp,
        DatetimeFormatterComp,
        TaskProgressFormatterComp,
        Select2FormatterComp,
        TextFormatterComp,
        PlayButtonFormatterComp,
        SubtitleFormatterComp,
        DragDropFormatterComp,
        ColorIndicatorFormatterComp,
        VersionIconsFormatterComp,
        PreviewImfDetailsFormatterComp,
        CacheManagerStatusComp,
        DocViewerFormatterComp,
        ReportStatusFormatterComp,
        CheckBoxFormatterComp,
        ValidationFormatterComp,
        PresetsFormatterComp,
        SystemSettingFormatterComp,
        QueuesFormatterComp,
        DoActionFormatterComp,
        LookupFormatterComp,
        TaskInfoFormatterComp,
        LogTypeIndicatorFormatterComp,
        ColorFormatterComp,
        DropFormatterComp,
        LinkFormatterComp,
        ImageLinkFormatterComp,
        DeleteFormatterComp,
        DownloadFormatterComp,
        PreviewFilesFormatterComp,
        TimecodeInputFormatterComp,
        WorkOrderStatusFormatterComp,
        CustomStatusFormatterComp,
        PgmMediaStatusFormatterComp,
        TimecodeStringFormatterComp,
        SectorsChannelsFormatterComp,
        LookupCollectionFormatterComp,
        ArrayFormatterComp,
        FolderLinkFormatterComp,
        TableFormatterComp
        // PDFViewerComponent
        // TreeFormatterComp
    ],
})
export class SlickGridModule {
}
