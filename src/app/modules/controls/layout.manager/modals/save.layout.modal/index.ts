import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {SaveLayoutModalComponent} from "./save.layout.modal.component";
import {FocusDirectiveModule} from "../../../../../directives/focus/focus.module";

@NgModule({
    declarations: [
        SaveLayoutModalComponent
    ],
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        FocusDirectiveModule
    ],
    exports: [],
    entryComponents: [
        SaveLayoutModalComponent
    ]
})
export class SaveLayoutModalModule {
    entry: Type<SaveLayoutModalComponent>;

    constructor() {
        this.entry = SaveLayoutModalComponent;
    }
}
