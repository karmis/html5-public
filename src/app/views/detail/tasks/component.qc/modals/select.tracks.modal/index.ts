import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from "@angular/forms";
import { SelectTracksModalComponent } from "./select.tracks";

@NgModule({
    declarations: [
        SelectTracksModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        SelectTracksModalComponent
    ]
})
export class SelectTracksModalModule {
    entry: Type<SelectTracksModalComponent>;

    constructor() {
        this.entry = SelectTracksModalComponent;
    }
}
