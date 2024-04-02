import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {AddLocationModalComponent} from "./add-location";
import {IMFXControlsTreeModule} from "../../../../../../../modules/controls/tree";

@NgModule({
    declarations: [
        AddLocationModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXControlsTreeModule
    ],
    entryComponents: [
        AddLocationModalComponent
    ]
})
export class AddLocationModalModule {
    entry: Type<AddLocationModalComponent>;

    constructor() {
        this.entry = AddLocationModalComponent;
    }
}
