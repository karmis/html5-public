/**
 * Created by IvanBanan 30.09.2019
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {IMFXModalModule} from '../imfx-modal';
import {IMFXModalComponent} from '../imfx-modal/imfx-modal';
import {IMFXControlsSelect2Module} from '../controls/select2';
import { CreateEpisodeTitleModalComponent } from './create.episode.title.modal.component';
import {DigitOnlyModule} from 'app/directives/digit-only/digit-only.module';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        CreateEpisodeTitleModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXModalModule,
        IMFXControlsSelect2Module,
        DigitOnlyModule
    ],
    exports: [
        CreateEpisodeTitleModalComponent
    ],
    entryComponents: [
        CreateEpisodeTitleModalComponent,
        IMFXModalComponent
    ]
})

export class CreateEpisodeTitleModalModule {
    entry: Type<CreateEpisodeTitleModalComponent>;

    constructor() {
        this.entry = CreateEpisodeTitleModalComponent;
    }
}

