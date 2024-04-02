import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {TagsComponent} from './tags.component';
import {IMFXControlsSelect2Module} from "../select2";

@NgModule({
    declarations: [
        TagsComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        IMFXControlsSelect2Module
    ],
    exports: [
        TagsComponent,
    ],
    entryComponents: [
        TagsComponent
    ]
})
export class TagsModule {}
