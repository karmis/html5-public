/**
 * Created by Sergey Trizna on 17.04.2018.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { ModalModule as ng2Module } from 'ngx-bootstrap/modal';
import { IMFXModalComponent } from './imfx-modal';
// import {IMFXModalPromptModule} from "./comps/prompt";
import {OverlayModule} from "../overlay";
import { IMFXTextDirectionDirectiveModule } from '../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Comps
        IMFXModalComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        ng2Module,
        // IMFXModalPromptModule,
        OverlayModule,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXModalComponent,
    ],
    entryComponents: [
        IMFXModalComponent
    ]
})

export class IMFXModalModule {
}
