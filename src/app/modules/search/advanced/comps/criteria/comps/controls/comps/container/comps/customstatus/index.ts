/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {IMFXControlsSelect2Module} from '../../../../../../../../../../controls/select2';
import {TranslateModule} from '@ngx-translate/core';
// comps
import {IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent} from './custom.status.component';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent,
        // UploadComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        IMFXControlsSelect2Module,
        TranslateModule
    ],
    exports: [
        IMFXAdvancedCriteriaControlComboSingleCustomStatusComponent
    ],
    entryComponents: [

    ]
})
export class ComboSingleCustomStatusModule {
}
