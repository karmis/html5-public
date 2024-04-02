import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchThumbsModule } from '../../../thumbs';
import { SlickGridModule } from '../../../slick-grid';
import { SearchViewsModule } from '../../../views';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SearchFormModule } from '../../../form';
import { FacetsModule } from '../../../facets1/facets.module';
import { SearchColumnsModule } from '../../../columns';
import { SearchSettingsModule } from '../../../settings';
import { SearchInfoPanelModule } from '../../../info-panel';
import { SearchAdvancedModule } from '../../../advanced';
import { SearchRecentModule } from '../../../recent';
import { AngularSplitModule } from 'angular-split';
import { IMFXDropDownDirectiveModule } from '../../../../../directives/dropdown/dropdown.directive.module';
import { IMFXModalModule } from '../../../../imfx-modal';
import { MediaItemEllipsisDropdownModule } from '../../../../controls/mediaItemEllipsisDropdown';
import { TabsModule } from 'ngx-bootstrap';
import { ProductionMakeListComponent } from './production.make.list.component';
import { ProductionTableTabModule } from '../production.table.tab.component';
import { MakeItemsControlModule } from '../../../make.items.control';

@NgModule({
    declarations: [
        ProductionMakeListComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        SlickGridModule,
        SearchViewsModule,
        SearchFormModule,
        SearchThumbsModule,
        FacetsModule,
        SearchColumnsModule,
        SearchSettingsModule,
        // DetailModule,
        SearchInfoPanelModule,
        SearchAdvancedModule,
        SearchRecentModule,
        AngularSplitModule,
        // ModalModule,
        IMFXDropDownDirectiveModule,
        IMFXModalModule,
        MediaItemEllipsisDropdownModule,
        TabsModule,
        ProductionTableTabModule,
        MakeItemsControlModule
    ],
    exports: [
        ProductionMakeListComponent
    ]
})
export class ProductionMaleListTabModule {
}
