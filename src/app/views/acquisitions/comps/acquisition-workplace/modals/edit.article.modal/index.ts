import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";
import {EditArticleModalComponent} from "./edit.article.modal.component";

@NgModule({
    declarations: [
        EditArticleModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule
    ],
    entryComponents: [
        EditArticleModalComponent
    ]
})
export class EditArticleModalModule {
    entry: Type<EditArticleModalComponent>;

    constructor() {
        this.entry = EditArticleModalComponent;
    }
}
