import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {EditXmlModalComponent} from "./edit";
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {CodemirrorModule} from "ng2-codemirror";

@NgModule({
    declarations: [
        EditXmlModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        CodemirrorModule
    ],
    entryComponents: [
        EditXmlModalComponent
    ]
})
export class EditXmlModalModule {
    entry: Type<EditXmlModalComponent>;

    constructor() {
        this.entry = EditXmlModalComponent;
    }
}
