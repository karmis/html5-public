import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// imfx modules
import { TranslateModule } from '@ngx-translate/core';
import {IMFXClipCommentTabComponent} from "./imfx.clip.comment.tab.component";
import {SlickGridModule} from "../../../slick-grid";


@NgModule({
    declarations: [
        IMFXClipCommentTabComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        SlickGridModule
    ],
    exports: [
        IMFXClipCommentTabComponent
    ]
})
export class IMFXClipCommentTabModule {}
