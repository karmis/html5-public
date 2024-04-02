import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import { TimecodeInputModule } from '../../../../../controls/timecode';
import {SaveDefaultLayoutModalComponent} from "./save.default.layout.modal.component";

@NgModule({
    declarations: [
        SaveDefaultLayoutModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        TimecodeInputModule
    ],
    entryComponents: [
        SaveDefaultLayoutModalComponent
    ]
})
export default class SaveDefaultLayoutModalModule {
    entry: Type<SaveDefaultLayoutModalComponent>;

    constructor() {
        this.entry = SaveDefaultLayoutModalComponent;
    }
}
