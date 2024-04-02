import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {ColorPickerModule} from 'ngx-color-picker';
import {TabDataUsersModalComponent} from "./tab.add-data-users.modal.component";

@NgModule({
    declarations: [
        TabDataUsersModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ColorPickerModule
    ],
    entryComponents: [
        TabDataUsersModalComponent
    ]
})
export class TabDataUsersModalModule {
    entry: Type<TabDataUsersModalComponent>;

    constructor() {
        this.entry = TabDataUsersModalComponent;
    }
}
