/**
 * Created by Sergey Trizna on 04.03.2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { SearchSettingsComponent } from './search.settings';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { IMFXDropDownDirectiveModule } from '../../../directives/dropdown/dropdown.directive.module'
import { IMFXModalModule } from '../../imfx-modal';

@NgModule({
    declarations: [
      SearchSettingsComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        BsDropdownModule,
        IMFXDropDownDirectiveModule,
        IMFXModalModule
    ],
    exports: [
      SearchSettingsComponent
    ],
})
export class SearchSettingsModule {
}
