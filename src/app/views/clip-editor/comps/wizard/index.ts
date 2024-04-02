import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MediaWizardComponent} from './wizard';
import {OverlayModule} from '../../../../modules/overlay';
import {IMFXControlsSelect2Module} from '../../../../modules/controls/select2';
import {WizardMediaTableModule} from './comps/media';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        MediaWizardComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        OverlayModule,
        IMFXControlsSelect2Module,
        WizardMediaTableModule
    ],

    entryComponents: [
        MediaWizardComponent
    ]
})

export class MediaWizardModule {
    entry: Type<MediaWizardComponent>;

    constructor() {
        this.entry = MediaWizardComponent;
    }
}
