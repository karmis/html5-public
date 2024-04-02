import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {VersionsInsideUploadComponent} from './versions.component';
// For modal
// import { ModalModule } from '../../../../modules/modal';
// Search
import {SearchViewsModule} from '../../../search/views';
import {SearchFormModule} from '../../../search/form';
import {SearchThumbsModule} from '../../../search/thumbs';
import {SearchSettingsModule} from '../../../search/settings';
import {SearchColumnsModule} from '../../../search/columns';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {SlickGridModule} from '../../../search/slick-grid';
import { AngularSplitModule } from 'angular-split';
import { VersionsInsideTitlesModule } from '../../../../views/titles/modules/versions';
import { VersionsInTitlesModule } from '../versions-in-titles';


@NgModule({
    declarations: [
        VersionsInsideUploadComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        SearchSettingsModule,
        SearchColumnsModule,
        // ModalModule,
        BsDropdownModule,
        SlickGridModule,
        AngularSplitModule,
        VersionsInTitlesModule
    ],
    exports: [
        VersionsInsideUploadComponent,
        // SearchColumnsComponent
    ],
    entryComponents: [
        VersionsInsideUploadComponent,
        // SearchColumnsComponent,
    ]
})
export class VersionsInsideUploadModule {
    entry: Type<VersionsInsideUploadComponent>;

    constructor() {
        this.entry = VersionsInsideUploadComponent;
    }
}
