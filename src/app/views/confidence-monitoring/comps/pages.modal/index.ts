import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PagesModalComponent} from "./pages.modal";

@NgModule({
    declarations: [
        PagesModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        PagesModalComponent
    ]
})
export class PagesModalModule {
    entry: Type<PagesModalComponent>;

    constructor() {
        this.entry = PagesModalComponent;
    }
}
