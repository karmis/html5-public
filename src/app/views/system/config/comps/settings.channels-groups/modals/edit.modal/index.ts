import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {FormsModule} from "@angular/forms";
import {CodemirrorModule} from "ng2-codemirror";
import {ColorPickerModule} from 'ngx-color-picker';
import {IMFXControlsDateTimePickerModule} from "../../../../../../../modules/controls/datetimepicker";
import {LocalDateModule} from "../../../../../../../modules/pipes/localDate";
import {ChannelsGroupChangeModalComponent} from "./channels.group.change.modal.component";
import SettingsChannelsTabModule from "../../comps/channels_tab";

@NgModule({
    declarations: [
        ChannelsGroupChangeModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        IMFXControlsDateTimePickerModule,
        SettingsChannelsTabModule,
        FormsModule,
        LocalDateModule,
        CodemirrorModule,
        ColorPickerModule
    ],
    entryComponents: [
        ChannelsGroupChangeModalComponent
    ]
})
export class ChannelsGroupChangeModalModule {
    entry: Type<ChannelsGroupChangeModalComponent>;

    constructor() {
        this.entry = ChannelsGroupChangeModalComponent;
    }
}
