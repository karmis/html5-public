import { IMFXDropDownDirectiveModule } from '../../../../directives/dropdown/dropdown.directive.module';
import { SearchThumbsModule } from '../../../search/thumbs';
import { SlickGridModule } from '../../../search/slick-grid';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SearchViewsModule } from '../../../search/views';
import { ItemTableComponent } from './item.table.component';
import { FormsModule } from '@angular/forms';
import { FocusDirectiveModule } from '../../../../directives/focus/focus.module';


@NgModule({
    declarations: [
        ItemTableComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchThumbsModule,
        IMFXDropDownDirectiveModule,
        FocusDirectiveModule
    ],
    exports: [
        IMFXDropDownDirectiveModule,
        ItemTableComponent
    ]
})
export default class ItemTableModule {
}
