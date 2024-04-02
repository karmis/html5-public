import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IMFXModalComponent } from 'app/modules/imfx-modal/imfx-modal';
import { ProductionConfigTabGridEditModalComponent } from './production.config.tab.grid.edit.modal.component';
import { CodemirrorModule } from 'ng2-codemirror';
import { LocalDateModule } from 'app/modules/pipes/localDate';
import { IMFXModalModule } from 'app/modules/imfx-modal';
import { ColorPickerModule } from 'ngx-color-picker';
import { IMFXControlsSelect2Module } from 'app/modules/controls/select2';
import { IMFXControlsDateTimePickerModule } from 'app/modules/controls/datetimepicker';
import { TimecodeInputModule } from 'app/modules/controls/timecode';


@NgModule({
    declarations: [
        ProductionConfigTabGridEditModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        IMFXControlsDateTimePickerModule,
        FormsModule,
        LocalDateModule,
        CodemirrorModule,
        IMFXModalModule,
        ColorPickerModule,
        TimecodeInputModule
    ],
    entryComponents: [
        ProductionConfigTabGridEditModalComponent,
        IMFXModalComponent
    ]
})
export class ProductionConfigTabGridEditModalModule {
    entry: Type<ProductionConfigTabGridEditModalComponent>;

    constructor() {
        this.entry = ProductionConfigTabGridEditModalComponent;
    }
}
