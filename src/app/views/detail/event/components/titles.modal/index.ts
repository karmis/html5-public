import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { TitlesSearchModalComponent } from './titles.modal.component';
import { SearchViewsModule } from 'app/modules/search/views';
import {SearchFormModule} from 'app/modules/search/form';
import { SearchThumbsModule } from 'app/modules/search/thumbs';
import { SearchSettingsModule } from 'app/modules/search/settings';
import { SearchColumnsModule } from 'app/modules/search/columns';
import { BsDropdownModule } from 'ngx-bootstrap';
import { SlickGridModule } from 'app/modules/search/slick-grid';



@NgModule({
    declarations: [
        TitlesSearchModalComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchSettingsModule,
        SearchColumnsModule,
        BsDropdownModule,
        SlickGridModule,
    ],
    exports: [
        TitlesSearchModalComponent
    ],
    entryComponents: [
        TitlesSearchModalComponent
    ]
})
export class TitlesSearchModalModule {
    entry: Type<TitlesSearchModalComponent>;

    constructor() {
        this.entry = TitlesSearchModalComponent;
    }
}
