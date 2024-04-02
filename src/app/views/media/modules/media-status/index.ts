import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
// imfx modules
import {MediaChangeStatusComponent} from './comp';
import {IMFXControlsSelect2Module} from "../../../../modules/controls/select2";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [
        MediaChangeStatusComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module
    ],
    exports: [
        // MediaStatusComponent,
    ],
    entryComponents: [
        MediaChangeStatusComponent
    ]
})
export class MediaChangeStatusModule {
    entry: Type<MediaChangeStatusComponent>;

    constructor() {
        this.entry = MediaChangeStatusComponent;
    }
}
