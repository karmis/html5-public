import {NgModule, Type} from '@angular/core';
import {SystemAboutComponent} from "./system-about.component";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {SlickGridModule} from "../search/slick-grid";


@NgModule({
    declarations: [
        SystemAboutComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule
    ],
    exports: [
        SystemAboutComponent
    ],
    entryComponents: [
        SystemAboutComponent
    ]
})
export class SystemAboutModule {
    entry: Type<SystemAboutComponent>;

    constructor() {
        this.entry = SystemAboutComponent;
    }
}
