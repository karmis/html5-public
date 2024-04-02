/**
 * Created by Sergey Trizna on 22.05.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
// comps
import {ReportParamsModalComponent} from './report.params';
import {TranslateModule} from '@ngx-translate/core';
// import {ModalModule} from '../../modules/modal';
import {IMFXControlsDateTimePickerModule} from '../../../modules/controls/datetimepicker';
import {IMFXControlsNumberboxModule} from '../../../modules/controls/numberbox';
import {RangeDateTimePickerModule} from '../../../modules/controls/range.date.time.picker';
import {OverlayModule} from '../../../modules/overlay';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ReportParamsModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        RangeDateTimePickerModule,
        IMFXControlsDateTimePickerModule,
        IMFXControlsNumberboxModule,
    ],
    exports: [
        // ReportParamsModalComponent
    ],
    entryComponents: [
        ReportParamsModalComponent
    ]
})
export class ReportParamsModalModule {
    entry: Type<ReportParamsModalComponent>;

    constructor() {
        this.entry = ReportParamsModalComponent;
    }
}
