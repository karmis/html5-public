import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {NamesModalComponent} from "./names.modal.component";
import {IMFXControlsSelect2Module} from "../../../../modules/controls/select2";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        NamesModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        FormsModule
    ],
    entryComponents: [
        NamesModalComponent
    ]
})
export class NamesModalModule {
    entry: Type<NamesModalComponent>;

    constructor() {
        this.entry = NamesModalComponent;
    }
}
