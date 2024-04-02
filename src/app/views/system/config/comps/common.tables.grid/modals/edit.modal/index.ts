import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IMFXControlsSelect2Module } from 'app/modules/controls/select2';
import { FormsModule } from '@angular/forms';
import { CommonTablesGridChangeModalComponent } from './common.tables.grid.change.modal.component';
import { CodemirrorModule } from 'ng2-codemirror';
import { ColorPickerModule } from 'ngx-color-picker';
import { IMFXControlsDateTimePickerModule } from 'app/modules/controls/datetimepicker';
import { LocalDateModule } from 'app/modules/pipes/localDate';
import { IMFXModalComponent } from 'app/modules/imfx-modal/imfx-modal';
import { IMFXModalModule } from 'app/modules/imfx-modal';


@NgModule({
    declarations: [
        CommonTablesGridChangeModalComponent
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
        ColorPickerModule
    ],
    entryComponents: [
        CommonTablesGridChangeModalComponent,
        IMFXModalComponent
    ]
})
export class CommonTablesGridChangeModalModule {
    entry: Type<CommonTablesGridChangeModalComponent>;

    constructor() {
        this.entry = CommonTablesGridChangeModalComponent;
    }
}
