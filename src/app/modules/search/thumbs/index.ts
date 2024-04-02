/**
 * Created by Sergey Trizna on 06.03.2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SearchThumbsComponent} from './search.thumbs';
@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SearchThumbsComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
    ],
    exports: [
        SearchThumbsComponent
    ],
})
export class SearchThumbsModule {
}
