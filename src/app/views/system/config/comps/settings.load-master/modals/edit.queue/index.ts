import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {LoadMasterChangeQueueModalComponent} from "./edit.queue.modal.component";
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';

@NgModule({
    declarations: [
        LoadMasterChangeQueueModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        DigitOnlyModule,
    ],
    entryComponents: [
        LoadMasterChangeQueueModalComponent
    ]
})
export class LoadMasterChangeQueueModalModule {
    entry: Type<LoadMasterChangeQueueModalComponent>;

    constructor() {
        this.entry = LoadMasterChangeQueueModalComponent;
    }
}
