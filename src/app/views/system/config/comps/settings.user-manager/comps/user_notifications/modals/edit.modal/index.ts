import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {NotificationsEditModalComponent} from "./notifications.modal.component";
import {IMFXControlsSelect2Module} from "../../../../../../../../../modules/controls/select2";

@NgModule({
    declarations: [
        NotificationsEditModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module,
        FormsModule
    ],
    exports: [
        NotificationsEditModalComponent
    ],
    entryComponents: [
        NotificationsEditModalComponent
    ]
})
export class NotificationsEditModalModule {
    entry: Type<NotificationsEditModalComponent>;

    constructor() {
        this.entry = NotificationsEditModalComponent;
    }
}
