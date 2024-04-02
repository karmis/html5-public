import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChangeQueueIdModalComponent} from "./change.queue.id.modal";

@NgModule({
    declarations: [
        ChangeQueueIdModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        ChangeQueueIdModalComponent
    ]
})
export class ChangeQueueIdModalModule {
    entry: Type<ChangeQueueIdModalComponent>;

    constructor() {
        this.entry = ChangeQueueIdModalComponent;
    }
}
