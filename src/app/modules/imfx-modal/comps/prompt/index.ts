
import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import { ModalModule as ng2Module } from 'ngx-bootstrap/modal';
import { IMFXModalComponent } from './imfx-modal';
import {IMFXModalPromptComponent} from "./prompt";
import { IMFXTextDirectionDirectiveModule } from '../../../../directives/text.inputs.textareas/text.inputs.textareas.directive.module';

@NgModule({
    declarations: [
        // Comps
        IMFXModalPromptComponent,
    ],
    imports: [
        TranslateModule,
        CommonModule,
        ng2Module,
        IMFXTextDirectionDirectiveModule
    ],
    exports: [
        IMFXModalPromptComponent,
    ],
    entryComponents: [
        IMFXModalPromptComponent
    ]
})

export class IMFXModalPromptModule {
    entry: Type<IMFXModalPromptComponent>;

    constructor() {
        this.entry = IMFXModalPromptComponent;
    }
}
