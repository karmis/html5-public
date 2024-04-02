import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {CopyFromModalComponent} from "./copy-from";

@NgModule({
    declarations: [
        CopyFromModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        CopyFromModalComponent
    ]
})
export class CopyFromModalModule {
    entry: Type<CopyFromModalComponent>;

    constructor() {
        this.entry = CopyFromModalComponent;
    }
}
