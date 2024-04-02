import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from "@angular/forms";
import { EditSomEomModalComponent } from './edit.som.eom.modal.component';
import { TimecodeInputModule } from '../../../../../controls/timecode';

@NgModule({
    declarations: [
        EditSomEomModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        TimecodeInputModule
    ],
    // exports:[
    //     EditSomEomModalComponent
    // ],
    entryComponents: [
        EditSomEomModalComponent
    ]
})

export default class EditSomEomModalModule {
    entry: Type<EditSomEomModalComponent>;

    constructor() {
        this.entry = EditSomEomModalComponent;
    }
}
