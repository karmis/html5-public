/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodePrettiffyViewerComponent} from './codeprettify';
import { TranslateModule } from '@ngx-translate/core';
import {JsonViewerComponent} from "./jsonviewer";
import {CodemirrorModule} from "ng2-codemirror";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        JsonViewerComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        CodemirrorModule
    ],
    exports: [
        JsonViewerComponent
    ],
    entryComponents: [
    ]
})
export class JsonViewerModule {
}
