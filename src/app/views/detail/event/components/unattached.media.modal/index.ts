import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { UnattachedMediaSearchModalComponent } from './unattached.media.modal.component';
import { SearchViewsModule } from 'app/modules/search/views';
import {SearchFormModule} from 'app/modules/search/form';
import { SearchThumbsModule } from 'app/modules/search/thumbs';
import { SearchSettingsModule } from 'app/modules/search/settings';
import { SearchColumnsModule } from 'app/modules/search/columns';
import { BsDropdownModule } from 'ngx-bootstrap';
import { SlickGridModule } from 'app/modules/search/slick-grid';



@NgModule({
    declarations: [
        UnattachedMediaSearchModalComponent,
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
    ],
    exports: [
        UnattachedMediaSearchModalComponent,
        // SearchColumnsComponent
    ],
    entryComponents: [
        UnattachedMediaSearchModalComponent,
        // SearchColumnsComponent,
    ]
})
export class UnattachedMediaSearchModalModule {
    entry: Type<UnattachedMediaSearchModalComponent>;

    constructor() {
        this.entry = UnattachedMediaSearchModalComponent;
    }
}
