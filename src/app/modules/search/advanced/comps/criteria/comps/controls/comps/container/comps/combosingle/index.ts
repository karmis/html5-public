/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {IMFXControlsSelect2Module} from '../../../../../../../../../../controls/select2';
import {TranslateModule} from '@ngx-translate/core';
// comps
import {IMFXAdvancedCriteriaControlComboSingleComponent} from './combosingle.component';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        IMFXAdvancedCriteriaControlComboSingleComponent,
        // UploadComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        IMFXControlsSelect2Module,
        TranslateModule
    ],
    exports: [
        IMFXAdvancedCriteriaControlComboSingleComponent
    ],
    entryComponents: [

    ]
})
export class ComboSingleModule {
}
