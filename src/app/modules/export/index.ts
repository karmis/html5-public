import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ExportComponent} from './export';
import {OverlayModule} from '../overlay';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        ExportComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        // ModalModule,
        OverlayModule
    ],
    exports: [],
    entryComponents: [
        ExportComponent
    ]
})
export class ExportModule {
    entry: Type<ExportComponent>;

    constructor() {
        this.entry = ExportComponent;
    }
}
