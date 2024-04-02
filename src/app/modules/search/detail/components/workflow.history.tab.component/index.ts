import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import {IMFXWFHistoryTabComponent} from './imfx.wf.history.tab.component';
import {SlickGridModule} from "../../../slick-grid";
import {SearchViewsModule} from "../../../views";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [
    // Components / Directives/ Pipes
        IMFXWFHistoryTabComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule,
        SearchViewsModule,
        TranslateModule
    ],
    exports: [
        IMFXWFHistoryTabComponent
    ]
})
export class IMFXWFHistoryTabModule {}
