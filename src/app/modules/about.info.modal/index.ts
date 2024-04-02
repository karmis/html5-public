/**
 * Created by Sergey Trizna on 27.04.2017.
 */
import {NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AboutInfoModalComponent} from './about.info.modal.component';
import {IMFXModalModule} from '../imfx-modal';
import {IMFXModalComponent} from '../imfx-modal/imfx-modal';

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        AboutInfoModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        IMFXModalModule,

    ],
    exports: [
        AboutInfoModalComponent
    ],
    entryComponents: [
        AboutInfoModalComponent,
        IMFXModalComponent
    ]
})

export class AboutInfoModalModule {
    entry: Type<AboutInfoModalComponent>;

    constructor() {
        this.entry = AboutInfoModalComponent;
    }
}

