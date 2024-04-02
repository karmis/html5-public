import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {ColorPickerModule} from 'ngx-color-picker';
import {ChoosingRowsModalComponent} from './choosing.rows.modal.component';

@NgModule({
    declarations: [
        ChoosingRowsModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ColorPickerModule
    ],
    entryComponents: [
        ChoosingRowsModalComponent
    ]
})
export class ChoosingRowsModalModule {
    entry: Type<ChoosingRowsModalComponent>;

    constructor() {
        this.entry = ChoosingRowsModalComponent;
    }
}
