import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {DocumentModalComponent} from "./document.modal.component";
import {OverlayModule} from "../../overlay";
import {PDFViewerModule} from 'app/modules/viewers/pdf';

@NgModule({
    declarations: [
        DocumentModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        ReactiveFormsModule,
        FormsModule,
        PDFViewerModule,
        OverlayModule
    ],
    exports: [
        DocumentModalComponent
    ],
    entryComponents: [
        DocumentModalComponent
    ]
})
export class DocumentModalModule {
    entry: Type<DocumentModalComponent>;

    constructor() {
        this.entry = DocumentModalComponent;
    }
}
