/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PDFViewerComponent} from './pdf';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        PDFViewerComponent
    ],
    imports: [
        CommonModule,
        // RouterModule.forChild(routes),
        TranslateModule
    ],
    exports: [
        PDFViewerComponent
    ],
    entryComponents: [
        PDFViewerComponent
    ]
})
export class PDFViewerModule {
    entry: Type<PDFViewerComponent>;

    constructor() {
        this.entry = PDFViewerComponent;
    }
}
