import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {LoadLayoutModalComponent} from "./load.layout.modal.component";
import {FocusDirectiveModule} from "../../../../../directives/focus/focus.module";

@NgModule({
    declarations: [
        LoadLayoutModalComponent
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
        LoadLayoutModalComponent
    ]
})
export class LoadLayoutModalModule {
    entry: Type<LoadLayoutModalComponent>;

    constructor() {
        this.entry = LoadLayoutModalComponent;
    }
}
