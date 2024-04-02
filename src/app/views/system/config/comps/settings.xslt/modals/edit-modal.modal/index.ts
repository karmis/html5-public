import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {EditXsltModalComponent} from "./edit";
import {IMFXControlsSelect2Module} from "../../../../../../../modules/controls/select2";
import {CodemirrorModule} from "ng2-codemirror";

@NgModule({
    declarations: [
        EditXsltModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsSelect2Module,
        CodemirrorModule
    ],
    entryComponents: [
        EditXsltModalComponent
    ]
})
export class EditXsltModalModule {
    entry: Type<EditXsltModalComponent>;

    constructor() {
        this.entry = EditXsltModalComponent;
    }
}
