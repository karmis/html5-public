/**
 * Created by Ivan Banan on 18.10.2019.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {IMFXControlsSelect2Module} from '../../../../../../../../../../controls/select2';
import {TranslateModule} from '@ngx-translate/core';
// comps
import {IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent} from './custom.status..multicomponent';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent,
        // UploadComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        IMFXControlsSelect2Module,
        TranslateModule
    ],
    exports: [
        IMFXAdvancedCriteriaControlComboMultiCustomStatusComponent
    ],
    entryComponents: [

    ]
})
export class ComboMultiCustomStatusModule {
}
