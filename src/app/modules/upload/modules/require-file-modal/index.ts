import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXRequireFileComp} from "./comp";


@NgModule({
    declarations: [
        // Comps
        IMFXRequireFileComp,
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [
        IMFXRequireFileComp,
    ],
    entryComponents: [
        IMFXRequireFileComp
    ]
})

export class IMFXRequireFileModule {
    entry: Type<IMFXRequireFileComp>;

    constructor() {
        this.entry = IMFXRequireFileComp;
    }
}
