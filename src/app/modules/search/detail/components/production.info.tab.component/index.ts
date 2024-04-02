import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {ProductionInfoTabComponent} from "./production.info.tab.component";
import {IMFXControlsSelect2Module} from "../../../../controls/select2";
import {IMFXControlsDateTimePickerModule} from "../../../../controls/datetimepicker";
import {LocalDateModule} from "../../../../pipes/localDate";
import {CodemirrorModule} from "ng2-codemirror";
import {IMFXModalModule} from "../../../../imfx-modal";
import {ColorPickerModule} from "ngx-color-picker";
import {IMFXModalComponent} from "../../../../imfx-modal/imfx-modal";

@NgModule({
    declarations: [
        ProductionInfoTabComponent
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
    exports: [
        ProductionInfoTabComponent
    ],
    entryComponents: [
        IMFXModalComponent
    ]
})
export class ProductionInfoTabModule {
}
