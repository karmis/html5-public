import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {NewContactModalComponent} from "./new.contact.modal.component";

@NgModule({
    declarations: [
        NewContactModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        NewContactModalComponent
    ]
})
export class NewContactModalModule {
    entry: Type<NewContactModalComponent>;

    constructor() {
        this.entry = NewContactModalComponent;
    }
}
