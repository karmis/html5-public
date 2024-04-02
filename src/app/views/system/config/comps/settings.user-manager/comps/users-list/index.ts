/**
 * Created by Sergey Trizna on 16.02.2017.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// comps
import {
    SettingGroupUsersListComponent,
} from './comp';
import {TranslateModule} from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { FilterPipeModule } from '../../../../../../../modules/pipes/filterPipe';
import { SlickGridModule } from '../../../../../../../modules/search/slick-grid';
import { IMFXTextDirectionDirectiveModule } from '../../../../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';


@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        SettingGroupUsersListComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        AngularSplitModule,
        FilterPipeModule,
        SlickGridModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        SettingGroupUsersListComponent
    ]
})
export class SettingGroupUsersListModule {
}
