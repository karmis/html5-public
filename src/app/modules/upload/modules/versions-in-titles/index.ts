import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { VersionsInTitlesComponent } from './versions-in-titles.component';

import { SearchViewsModule } from '../../../search/views';
import { SearchFormModule } from '../../../search/form';
import { SearchThumbsModule } from '../../../search/thumbs';
import { SearchSettingsModule } from '../../../search/settings';
import { SearchColumnsModule } from '../../../search/columns';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SlickGridModule } from '../../../search/slick-grid';
import { AngularSplitModule } from 'angular-split';


@NgModule({
    declarations: [
        VersionsInTitlesComponent,
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
        AngularSplitModule,
    ],
    exports: [
        VersionsInTitlesComponent,
    ]
})
export class VersionsInTitlesModule {
}
