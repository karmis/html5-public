import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {FormsModule} from "@angular/forms";
import {LoadMasterChangeModalComponent} from "./load-master.change.modal.component";

@NgModule({
    declarations: [
        LoadMasterChangeModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        FormsModule,
    ],
    entryComponents: [
        LoadMasterChangeModalComponent
    ]
})
export class LoadMasterChangeModalModule {
    entry: Type<LoadMasterChangeModalComponent>;

    constructor() {
        this.entry = LoadMasterChangeModalComponent;
    }
}
