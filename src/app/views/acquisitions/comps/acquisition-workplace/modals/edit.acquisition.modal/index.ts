import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {EditAcquisitionModalComponent} from "./edit.acquisition.modal.component";

@NgModule({
    declarations: [
        EditAcquisitionModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        EditAcquisitionModalComponent
    ]
})
export class EditAcquisitionModalModule {
    entry: Type<EditAcquisitionModalComponent>;

    constructor() {
        this.entry = EditAcquisitionModalComponent;
    }
}
