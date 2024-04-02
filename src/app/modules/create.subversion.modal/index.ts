/**
 * Created by IvanBanan 30.09.2019
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {CreateSubversionModalComponent} from './create.subversion.modal.component';
import {IMFXModalModule} from '../imfx-modal';
import {IMFXModalComponent} from '../imfx-modal/imfx-modal';
import {IMFXControlsSelect2Module} from '../controls/select2';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        CreateSubversionModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXModalModule,
        IMFXControlsSelect2Module
    ],
    exports: [
        CreateSubversionModalComponent
    ],
    entryComponents: [
        CreateSubversionModalComponent,
        IMFXModalComponent
    ]
})

export class CreateSubversionModalModule {
    entry: Type<CreateSubversionModalComponent>;

    constructor() {
        this.entry = CreateSubversionModalComponent;
    }
}

